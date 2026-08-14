/**
 * Deterministic placeholder images for stories.
 *
 * Stories previously pointed `<img src>` at picsum.photos and i.pravatar.cc (11
 * references). Two problems with that:
 *
 *  1. The visual-regression baselines could never be stable — whether the remote
 *     image had finished loading when Playwright took the screenshot was a race,
 *     so `carousel--image-slides` failed intermittently no matter how many times
 *     the baselines were regenerated.
 *  2. Storybook, and therefore CI, needed public network access to render
 *     correctly.
 *
 * These generate self-contained SVG data URIs instead: same shape and colour
 * variety, zero network, byte-identical every run.
 *
 * Not exported from the public barrel — stories and tests only.
 */

/** Deterministic 32-bit hash so the same seed always picks the same colours. */
function hash(seed: string): number {
	let h = 5381;
	for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
	return h >>> 0;
}

// Muted duotone pairs that read as photography without competing with the UI.
const PAIRS: ReadonlyArray<readonly [string, string]> = [
	["#7c8a9c", "#3f4b5b"],
	["#9c8a7c", "#5b4b3f"],
	["#7c9c8a", "#3f5b4b"],
	["#8a7c9c", "#4b3f5b"],
	["#9c7c8a", "#5b3f4b"],
	["#8a9c7c", "#4b5b3f"],
];

function dataUri(svg: string): string {
	// encodeURIComponent (not base64) keeps the URI readable in devtools and
	// avoids pulling in a Buffer/btoa branch that differs across environments.
	return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

/** Landscape placeholder for media/gallery slides. */
export function storyImage(seed: string, width = 800, height = 400): string {
	const [from, to] = PAIRS[hash(seed) % PAIRS.length]!;
	return dataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
			<defs>
				<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stop-color="${from}"/>
					<stop offset="1" stop-color="${to}"/>
				</linearGradient>
			</defs>
			<rect width="${width}" height="${height}" fill="url(#g)"/>
			<circle cx="${width * 0.78}" cy="${height * 0.28}" r="${height * 0.12}" fill="rgba(255,255,255,0.18)"/>
			<path d="M0 ${height} L${width * 0.36} ${height * 0.52} L${width * 0.62} ${height * 0.78} L${width} ${height * 0.34} L${width} ${height} Z" fill="rgba(0,0,0,0.16)"/>
		</svg>
	`);
}

/** Square placeholder standing in for a user photo. */
export function storyAvatar(seed: string, size = 128): string {
	const [from, to] = PAIRS[hash(seed) % PAIRS.length]!;
	return dataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
			<rect width="${size}" height="${size}" fill="${from}"/>
			<circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.17}" fill="${to}"/>
			<path d="M${size * 0.16} ${size} a${size * 0.34} ${size * 0.3} 0 0 1 ${size * 0.68} 0 Z" fill="${to}"/>
		</svg>
	`);
}
