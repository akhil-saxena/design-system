import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Eyebrow } from ".";

describe("Eyebrow", () => {
	it("renders children", () => {
		const { getByText } = render(<Eyebrow>FULL NAME</Eyebrow>);
		expect(getByText("FULL NAME")).toBeInTheDocument();
	});

	it("renders a <span>", () => {
		const { container } = render(<Eyebrow>x</Eyebrow>);
		expect(container.querySelector("span.ds-atom-eyebrow")).not.toBeNull();
	});

	it("size sm sets fontSize via token var", () => {
		const { container } = render(<Eyebrow size="sm">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.style.fontSize).toBe("var(--text-2xs)");
	});

	it("size md sets fontSize via token var", () => {
		const { container } = render(<Eyebrow size="md">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.style.fontSize).toBe("var(--text-xs)");
	});

	it("size xs uses an explicit 8px", () => {
		const { container } = render(<Eyebrow size="xs">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.style.fontSize).toBe("8px");
	});

	it("tone emits data-tone and omits inline color fallback", () => {
		const { container } = render(<Eyebrow tone="amber">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.dataset.tone).toBe("accent");
		expect(el.style.color).toBe("");
	});

	it("falls back to var(--ink-3) when no tone nor color", () => {
		const { container } = render(<Eyebrow>x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.style.color).toBe("var(--ink-3)");
	});

	it("color prop wins over tone-derived fallback", () => {
		const { container } = render(<Eyebrow color="#ff0000">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.style.color).toContain("rgb(255, 0, 0)");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Eyebrow ref={ref}>x</Eyebrow>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});
});

describe("Eyebrow — semantic tones", () => {
	// The public vocabulary is semantic; the deprecated raw-token spellings are
	// normalised to it so `primitives.css` needs only one rule per role.
	it("passes a semantic tone straight through", () => {
		const { container } = render(<Eyebrow tone="accent">x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
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
				<Eyebrow tone={legacy as any}>x</Eyebrow>,
			);
			const el = container.querySelector("span") as HTMLSpanElement;
			expect(el.dataset.tone, `${legacy} should map to ${semantic}`).toBe(semantic);
			unmount();
		}
	});

	it("omits data-tone entirely when no tone is given", () => {
		const { container } = render(<Eyebrow>x</Eyebrow>);
		const el = container.querySelector("span") as HTMLSpanElement;
		expect(el.dataset.tone).toBeUndefined();
	});
});
