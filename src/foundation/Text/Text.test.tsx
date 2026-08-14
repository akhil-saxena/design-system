import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Text } from ".";

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
