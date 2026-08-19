import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Text, type TextProps } from ".";

describe("Text", () => {
	it("renders children", () => {
		const { getByText } = render(<Text>Hello body copy.</Text>);
		expect(getByText("Hello body copy.")).toBeInTheDocument();
	});

	it("defaults to <p>", () => {
		const { container } = render(<Text>x</Text>);
		expect(container.querySelector("p")).not.toBeNull();
	});

	it("`as` switches the rendered tag", () => {
		const { container } = render(<Text as="span">x</Text>);
		expect(container.querySelector("p")).toBeNull();
		expect(container.querySelector("span.ds-atom-text")).not.toBeNull();
	});

	it("emits data-variant for legacy variant", () => {
		const { container } = render(<Text variant="legal">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.variant).toBe("legal");
	});

	it("token size emits data-size and skips inline fontSize", () => {
		const { container } = render(<Text size="sm">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.size).toBe("sm");
		expect(el.style.fontSize).toBe("");
	});

	it("tone emits data-tone and skips inline color", () => {
		const { container } = render(<Text tone="amber">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.tone).toBe("accent");
		expect(el.style.color).toBe("");
	});

	it("mono emits data-mono", () => {
		const { container } = render(<Text mono>x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.mono).toBe("true");
	});

	it("leading emits data-leading and clears inline lineHeight", () => {
		const { container } = render(<Text leading="tight">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.leading).toBe("tight");
		expect(el.style.lineHeight).toBe("");
	});

	it("maxWidth applies inline", () => {
		const { container } = render(<Text maxWidth={360}>x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.style.maxWidth).toBe("360px");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLElement>();
		render(<Text ref={ref}>x</Text>);
		expect(ref.current).not.toBeNull();
	});
});

describe("Text — semantic tones", () => {
	// The public vocabulary is semantic; the deprecated raw-token spellings are
	// normalised to it so `primitives.css` needs only one rule per role.
	it("passes a semantic tone straight through", () => {
		const { container } = render(<Text tone="accent">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.tone).toBe("accent");
		expect(el.style.color).toBe("");
	});

	it("maps the deprecated raw-token names onto semantic roles", () => {
		const cases: Array<[string, string]> = [
			["amber", "accent"],
			["ink-3", "muted"],
			// --ink-4 is an alias of --ink-3, so both spellings mean "muted".
			["ink-4", "muted"],
		];
		for (const [legacy, semantic] of cases) {
			const { container, unmount } = render(
				// biome-ignore lint/suspicious/noExplicitAny: exercising the deprecated union members by string
				<Text tone={legacy as any}>x</Text>,
			);
			const el = container.querySelector(".ds-atom-text") as HTMLElement;
			expect(el.dataset.tone, `${legacy} should map to ${semantic}`).toBe(semantic);
			unmount();
		}
	});

	it("omits data-tone entirely when no tone is given", () => {
		const { container } = render(<Text>x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.tone).toBeUndefined();
	});
});

/**
 * E5 — a page must be able to recolour a Text from a stylesheet without passing
 * a `tone` prop. Text inlined its variant colour whenever `tone` was absent, and
 * an inline declaration beats a class rule without `!important`, so a
 * correct-looking `.foo .ds-atom-text { color: … }` did nothing. Plan 00-10 lost
 * real time to exactly that rule.
 *
 * There are four sources of colour on a Text, and the intended order is:
 *
 *   variant default  <  a consumer's class rule  <  `tone` prop  <  `color` prop
 *
 * The first gap is what this describe block proves. The variant default is
 * declared inside `:where()` so it carries zero specificity and loses to any
 * consumer selector, rather than merely tying with one and being decided by
 * whichever stylesheet happened to load last.
 *
 * jsdom resolves the cascade by SOURCE ORDER and implements no specificity at
 * all — verified, not assumed. So the cases here are arranged to turn only on
 * inline-versus-stylesheet, which jsdom does model correctly, plus one
 * structural read of the parsed sheet. The specificity claim itself — that
 * `[data-tone]` outranks a consumer class regardless of load order — is proven
 * in a real browser in tests/visual/brand-probe.spec.ts.
 */
describe("Text — consumer styling boundary (E5)", () => {
	let dsSheet: HTMLStyleElement;
	let consumerSheet: HTMLStyleElement;

	beforeAll(() => {
		dsSheet = document.createElement("style");
		dsSheet.textContent = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
		document.head.appendChild(dsSheet);
		consumerSheet = document.createElement("style");
		consumerSheet.textContent = ".wk-red { color: rgb(255, 0, 0); }";
		document.head.appendChild(consumerSheet);
	});

	afterAll(() => {
		dsSheet.remove();
		consumerSheet.remove();
	});

	it("lets a consumer class recolour a Text that was given no tone", () => {
		const { container } = render(<Text className="wk-red">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(getComputedStyle(el).color).toBe("rgb(255, 0, 0)");
	});

	it("still computes each variant's default colour with no tone and no consumer class", () => {
		const cases: Array<[TextProps["variant"], string]> = [
			["body", "var(--ink-2)"],
			["small", "var(--ink-3)"],
			["caption", "var(--ink-3)"],
			["legal", "var(--ink-4)"],
		];
		for (const [variant, expected] of cases) {
			const { container, unmount } = render(<Text variant={variant}>x</Text>);
			const el = container.querySelector(".ds-atom-text") as HTMLElement;
			// jsdom does not substitute custom properties, so the literal var()
			// is what a correct rule produces.
			expect(getComputedStyle(el).color, `variant=${variant}`).toBe(expected);
			unmount();
		}
	});

	it("declares the variant default at zero specificity so a consumer selector cannot merely tie with it", () => {
		const rules = [...(dsSheet.sheet?.cssRules ?? [])] as CSSStyleRule[];
		const variantColour = rules.filter(
			(r) =>
				typeof r.selectorText === "string" &&
				r.selectorText.includes(".ds-atom-text[data-variant=") &&
				r.style?.getPropertyValue("color"),
		);
		expect(variantColour.length, "the four variant colours must live in the sheet").toBeGreaterThan(
			0,
		);
		for (const r of variantColour) {
			expect(r.selectorText.startsWith(":where("), r.selectorText).toBe(true);
		}
		// The tone rules are deliberately NOT wrapped: passing `tone` means the
		// component owns the colour, so those keep their (0,2,0) weight.
		const toneColour = rules.filter(
			(r) =>
				typeof r.selectorText === "string" && r.selectorText.includes(".ds-atom-text[data-tone="),
		);
		expect(toneColour.length).toBeGreaterThan(0);
		for (const r of toneColour) {
			expect(r.selectorText.includes(":where("), r.selectorText).toBe(false);
		}
	});

	it("keeps `tone` resolving through the data-tone rule", () => {
		const { container } = render(<Text tone="muted">x</Text>);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(el.dataset.tone).toBe("muted");
		expect(el.style.color).toBe("");
		expect(getComputedStyle(el).color).toBe("var(--ink-3)");
	});

	it("keeps the deprecated `color` prop winning over the tone rule and a consumer class", () => {
		const { container } = render(
			<Text className="wk-red" tone="muted" color="rgb(1, 2, 3)">
				x
			</Text>,
		);
		const el = container.querySelector(".ds-atom-text") as HTMLElement;
		expect(getComputedStyle(el).color).toBe("rgb(1, 2, 3)");
	});
});
