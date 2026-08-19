import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { type Page, type Route, expect, test } from "@playwright/test";

/**
 * Criterion 4, measured as a DOWNLOAD rather than as a declaration.
 *
 * src/tokens.test.ts counts @font-face rules by parsing the installed packages.
 * That cannot prove a download: a face rule is a declaration, and whether the
 * browser fetches the file depends on `unicode-range` matching and on a glyph
 * actually being rendered. Criterion 4 is worded as a download — "a page
 * consuming only the charcoal theme DOWNLOADS Playfair Display, DM Sans and IBM
 * Plex Mono, and does NOT download Inter, Archivo, JetBrains Mono or
 * Newsreader" — so it needs a network measurement.
 *
 * WHY THIS SERVES ITS OWN PAGE INSTEAD OF LOADING A STORY. Storybook's preview
 * imports BOTH face layers, because it is a two-brand development environment
 * and all 477 existing baselines depend on the default families. A story would
 * therefore legitimately fetch Inter for Storybook's own chrome and the
 * negative half would be untestable there. Everything below is served from a
 * synthetic origin through page.route(), so the document contains exactly the
 * stylesheets named in each test and nothing else.
 *
 * The stylesheets are the REAL ones off disk — src/tokens.css,
 * src/themes/charcoal.css and src/fonts/*.css — with the Fontsource entry
 * points inlined and their relative url() targets re-pointed at routed paths
 * that serve the actual woff2 bytes. So this exercises the whole chain the
 * criterion is about: a --font-* token names a family, the face layer declares
 * that family, and the browser goes and gets the file.
 */

// Playwright resolves config.rootDir to testDir, not to the repository, so the
// repo root is derived from the config file's own location instead.
function repoRoot(configFile: string | undefined): string {
	if (!configFile) throw new Error("playwright configFile is undefined — cannot locate repo root");
	return dirname(configFile);
}

/**
 * Fontsource filenames carry the family slug — `inter-latin-400-normal.woff2`,
 * `playfair-display-latin-wght-normal.woff2`. These patterns match on that
 * slug.
 *
 * Every observed font URL is required to match exactly one of these seven
 * patterns (see the exhaustiveness assertion in each test). Without that, a
 * package renaming its files would make a pattern match nothing and the
 * negative half would pass vacuously, which is the failure mode this whole
 * spec exists to avoid.
 */
const CHARCOAL_FAMILIES = {
	"Playfair Display": /(^|\/)playfair-display-/i,
	"DM Sans": /(^|\/)dm-sans-/i,
	"IBM Plex Mono": /(^|\/)ibm-plex-mono-/i,
} as const;

const PRE_2_0_FAMILIES = {
	Inter: /(^|\/)inter-/i,
	Archivo: /(^|\/)archivo-/i,
	"JetBrains Mono": /(^|\/)jetbrains-mono-/i,
	Newsreader: /(^|\/)newsreader-/i,
} as const;

const ORIGIN = "http://charcoal-font-probe.test";

/** A stylesheet with its @imports inlined and its url() targets re-pointed at
 *  routed paths. Returns the CSS plus the routed-path -> disk-path map. */
function inlineFaceLayer(
	file: string,
	root: string,
	assets: Map<string, string>,
	seen = new Set<string>(),
): string {
	if (seen.has(file)) return "";
	seen.add(file);
	if (!existsSync(file)) throw new Error(`stylesheet does not exist: ${file}`);
	let css = readFileSync(file, "utf8");

	// Inline every @import, resolving bare specifiers through node_modules
	// exactly as a bundler would.
	css = css.replace(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g, (_m, spec: string) => {
		const target = spec.startsWith(".")
			? resolvePath(dirname(file), spec)
			: join(root, "node_modules", spec);
		return inlineFaceLayer(target, root, assets, seen);
	});

	// Re-point url(./files/x.woff2) at a routed path serving the real bytes.
	css = css.replace(/url\((\.\/[^)"']+)\)/g, (_m, rel: string) => {
		const disk = resolvePath(dirname(file), rel);
		const routed = `/__font/${assets.size}/${rel.split("/").pop()}`;
		assets.set(routed, disk);
		return `url(${routed})`;
	});

	return css;
}

const MIME: Record<string, string> = {
	".woff2": "font/woff2",
	".woff": "font/woff",
	".ttf": "font/ttf",
};

/** Serve a bare document with the given face layers and nothing else. */
async function probe(page: Page, root: string, faceLayers: string[]): Promise<string[]> {
	const assets = new Map<string, string>();
	const sheets: Record<string, string> = {
		"/tokens.css": readFileSync(join(root, "src/tokens.css"), "utf8"),
		"/charcoal-theme.css": readFileSync(join(root, "src/themes/charcoal.css"), "utf8"),
	};
	for (const layer of faceLayers) {
		sheets[`/${layer}.css`] = inlineFaceLayer(join(root, `src/fonts/${layer}.css`), root, assets);
	}

	const links = ["/tokens.css", "/charcoal-theme.css", ...faceLayers.map((l) => `/${l}.css`)]
		.map((href) => `<link rel="stylesheet" href="${href}">`)
		.join("\n");

	// data-brand="charcoal" is set on <html> exactly as a real consumer sets it,
	// so the three families below are reached THROUGH the charcoal --font-*
	// tokens rather than being named directly. A token that lost its `Variable`
	// suffix would stop matching a declared face and simply not download.
	const html = `<!doctype html>
<html lang="en" data-brand="charcoal">
<head><meta charset="utf-8">${links}</head>
<body>
<h1 style="font-family: var(--font-display)">Display heading in the charcoal serif</h1>
<p style="font-family: var(--font-body)">Body copy in the charcoal sans, long enough to render.</p>
<code style="font-family: var(--font-mono)">const mono = "charcoal";</code>
</body></html>`;

	// Subscribe BEFORE navigating. A listener attached after goto() misses the
	// document's own subresource requests, which is the entire measurement.
	const fontRequests: string[] = [];
	page.on("request", (req) => {
		const url = req.url();
		if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) fontRequests.push(url);
	});

	await page.route(`${ORIGIN}/**`, async (route: Route) => {
		const path = new URL(route.request().url()).pathname;
		if (path === "/") return route.fulfill({ contentType: "text/html", body: html });
		if (sheets[path]) return route.fulfill({ contentType: "text/css", body: sheets[path] });
		const disk = assets.get(path);
		if (disk) {
			const ext = path.slice(path.lastIndexOf("."));
			return route.fulfill({
				contentType: MIME[ext] ?? "application/octet-stream",
				body: readFileSync(disk),
			});
		}
		return route.fulfill({ status: 404, body: "not routed" });
	});

	await page.goto(`${ORIGIN}/`);
	// Force layout so the renderer decides which faces it actually needs, then
	// wait for those loads to settle. fonts.ready alone can resolve before any
	// load has been kicked off.
	await page.evaluate(() => document.body.getBoundingClientRect().height);
	await page.evaluate(() => document.fonts.ready.then(() => undefined));
	await page.waitForTimeout(250);
	return fontRequests;
}

test.describe("charcoal font downloads (criterion 4)", () => {
	test("a page consuming only charcoal fetches its three families and no others", async ({
		page,
	}, testInfo) => {
		const root = repoRoot(testInfo.config.configFile);
		const urls = await probe(page, root, ["charcoal"]);
		console.log(`charcoal-only probe fetched ${urls.length} font files:\n  ${urls.join("\n  ")}`);

		// Positive half.
		for (const [family, pattern] of Object.entries(CHARCOAL_FAMILIES)) {
			expect(
				urls.filter((u) => pattern.test(u)),
				`${family} was never downloaded. Observed: ${urls.join(", ") || "(nothing)"}`,
			).not.toHaveLength(0);
		}

		// Negative half — the criterion's actual content, asserted separately.
		for (const [family, pattern] of Object.entries(PRE_2_0_FAMILIES)) {
			expect(
				urls.filter((u) => pattern.test(u)),
				`${family} was downloaded by a charcoal-only page`,
			).toEqual([]);
		}

		// Exhaustiveness: every observed file must be attributable to one of the
		// seven families. A Fontsource file rename then fails HERE, loudly,
		// instead of quietly turning the negative half into a tautology.
		const patterns = Object.values({ ...CHARCOAL_FAMILIES, ...PRE_2_0_FAMILIES });
		expect(urls.filter((u) => !patterns.some((p) => p.test(u)))).toEqual([]);
	});

	test("charcoal fetches none of the pre-2.0 families even when they are declared", async ({
		page,
	}, testInfo) => {
		// The load-bearing version. With only the charcoal layer linked, no Inter
		// face exists, so "Inter was not downloaded" is true by construction and
		// cannot fail — the shape of assertion this phase has twice shipped by
		// accident. Here BOTH layers are linked, so all 81 faces are declared and
		// the browser genuinely could fetch Inter. It does not, because the
		// charcoal --font-* tokens never name it.
		const root = repoRoot(testInfo.config.configFile);
		const urls = await probe(page, root, ["charcoal", "default"]);
		console.log(`both-layers probe fetched ${urls.length} font files:\n  ${urls.join("\n  ")}`);

		for (const [family, pattern] of Object.entries(CHARCOAL_FAMILIES)) {
			expect(
				urls.filter((u) => pattern.test(u)),
				`${family} was never downloaded`,
			).not.toHaveLength(0);
		}
		for (const [family, pattern] of Object.entries(PRE_2_0_FAMILIES)) {
			expect(
				urls.filter((u) => pattern.test(u)),
				`${family} was downloaded although charcoal names no token that reaches it`,
			).toEqual([]);
		}
		const patterns = Object.values({ ...CHARCOAL_FAMILIES, ...PRE_2_0_FAMILIES });
		expect(urls.filter((u) => !patterns.some((p) => p.test(u)))).toEqual([]);
	});
});
