import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarStack, deriveGradient, deriveInitials, deriveSolidColor } from ".";
describe("Avatar utilities", () => {
	describe("deriveInitials", () => {
		it("first letter of first 2 words", () => {
			expect(deriveInitials("Akhil Saxena")).toBe("AS");
		});
		it("single word -> single letter", () => {
			expect(deriveInitials("OpenAI")).toBe("O");
		});
		it("empty / null -> ?", () => {
			expect(deriveInitials("")).toBe("?");
			expect(deriveInitials(undefined)).toBe("?");
			expect(deriveInitials(null)).toBe("?");
		});
		it("trims whitespace", () => {
			expect(deriveInitials("   Maya   Chen  ")).toBe("MC");
		});
	});

	describe("deriveGradient", () => {
		it("returns a 2-tuple", () => {
			const g = deriveGradient("Maya Chen");
			expect(g).toHaveLength(2);
			expect(g[0]).toMatch(/^#/);
			expect(g[1]).toMatch(/^#/);
		});
		it("deterministic - same input always returns same gradient", () => {
			expect(deriveGradient("test")).toEqual(deriveGradient("test"));
			expect(deriveGradient("Maya Chen")).toEqual(deriveGradient("Maya Chen"));
		});
		it("case-insensitive (lowercased before hashing)", () => {
			expect(deriveGradient("ABC")).toEqual(deriveGradient("abc"));
		});
	});

	describe("deriveSolidColor", () => {
		it("deterministic - same seed always returns same color", () => {
			expect(deriveSolidColor("contact-42")).toBe(deriveSolidColor("contact-42"));
		});
		it("uses the provided custom palette", () => {
			const palette = ["#111111", "#222222", "#333333"];
			expect(palette).toContain(deriveSolidColor("anything", palette));
		});
		it("custom palette only ever returns colors from that palette", () => {
			const palette = ["#abcdef", "#fedcba"];
			for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
				expect(palette).toContain(deriveSolidColor(seed, palette));
			}
		});
		it("falls back to built-in palette when an empty palette is passed", () => {
			expect(deriveSolidColor("x", [])).toBe(deriveSolidColor("x"));
		});
	});
});

describe("Avatar", () => {
	it("renders derived initials when no children provided", () => {
		const { getByText } = render(<Avatar name="Maya Chen" />);
		expect(getByText("MC")).toBeInTheDocument();
	});

	it("explicit initials prop wins over name-derived", () => {
		const { getByText, queryByText } = render(<Avatar name="Maya Chen" initials="ZZ" />);
		expect(getByText("ZZ")).toBeInTheDocument();
		expect(queryByText("MC")).not.toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Avatar ref={ref} name="x" />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("aria-label uses name prop", () => {
		const { getByLabelText } = render(<Avatar name="Maya Chen" />);
		expect(getByLabelText("Maya Chen")).toBeInTheDocument();
	});

	it("renders presence dot when presence prop set", () => {
		const { container } = render(<Avatar name="x" presence="online" />);
		// presence dot is the only inner span (other than initials text node)
		expect(container.querySelectorAll("span").length).toBeGreaterThan(0);
	});

	// jsdom normalizes inline color values (e.g. "#0284c7" -> "rgb(2, 132, 199)"),
	// so we render a reference element to obtain the normalized form rather than
	// comparing against raw hex from deriveSolidColor. Each render() returns a
	// fresh container, so we read the avatar root from it directly to avoid
	// duplicate-name ambiguity across multiple renders in one test.
	const rootOf = (container: HTMLElement) => container.firstChild as HTMLElement;
	const bgOf = (container: HTMLElement) => rootOf(container).style.background;
	const renderedBg = (props: Parameters<typeof Avatar>[0]) =>
		bgOf(render(<Avatar {...props} />).container);
	// Normalized form of an arbitrary hex color, as jsdom would store it.
	const normalize = (hex: string) =>
		bgOf(render(<Avatar name="__ref__" style={{ background: hex }} />).container);

	it("same seed produces the same background color regardless of name", () => {
		const bgA = bgOf(render(<Avatar name="Maya Chen" seed="contact-42" />).container);
		const bgB = bgOf(render(<Avatar name="Totally Different Name" seed="contact-42" />).container);
		expect(bgA).toBe(bgB);
		expect(bgA).not.toBe("");
	});

	it("seeds that hash to different palette slots produce different colors", () => {
		// Pick two seeds that the built-in palette maps to distinct colors so the
		// assertion isn't fooled by a hash collision in the 6-color palette.
		expect(deriveSolidColor("seed-a")).not.toBe(deriveSolidColor("seed-d"));
		const bgA = renderedBg({ name: "Maya Chen", seed: "seed-a" });
		const bgD = renderedBg({ name: "Maya Chen", seed: "seed-d" });
		expect(bgA).not.toBe(bgD);
	});

	it("seed drives color while name still drives initials", () => {
		const { getByText, container } = render(<Avatar name="Maya Chen" seed="some-id" />);
		// initials from name, unchanged
		expect(getByText("MC")).toBeInTheDocument();
		// color from seed: equals an Avatar whose NAME is the seed (color path identical)
		const refBg = renderedBg({ name: "some-id" });
		expect(bgOf(container)).toBe(refBg);
	});

	it("custom palette is used for the background color", () => {
		// Distinct dark palette so a built-in color can't accidentally collide.
		const palette = ["#0a0a0a", "#1b1b1b", "#2c2c2c", "#3d3d3d"];
		const expectedHex = deriveSolidColor("Maya Chen", palette);
		// the chosen color must come from the custom palette, not the built-in one
		expect(palette).toContain(expectedHex);
		const { container } = render(<Avatar name="Maya Chen" palette={palette} />);
		expect(bgOf(container)).toBe(normalize(expectedHex));
	});

	it("custom palette respects the seed override", () => {
		const palette = ["#0a0a0a", "#1b1b1b", "#2c2c2c"];
		const expectedHex = deriveSolidColor("stable-id", palette);
		const { container } = render(<Avatar name="Maya Chen" seed="stable-id" palette={palette} />);
		expect(bgOf(container)).toBe(normalize(expectedHex));
	});

	it("defaults unchanged - no seed/palette uses name-derived built-in color", () => {
		// Same as rendering with an explicit seed equal to the name.
		const withName = renderedBg({ name: "Maya Chen" });
		const withSeed = renderedBg({ name: "Maya Chen", seed: "Maya Chen" });
		expect(withName).toBe(withSeed);
		expect(withName).not.toBe("");
	});
});

describe("AvatarStack", () => {
	it("renders min(avatars.length, max) avatars + overflow chip", () => {
		const { container } = render(
			<AvatarStack
				avatars={[{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }]}
				max={3}
			/>,
		);
		const avs = container.querySelectorAll("[aria-label]");
		// 3 visible avatars + 1 overflow = 4 aria-labels
		expect(avs.length).toBe(4);
	});

	it("no overflow chip when avatars <= max", () => {
		const { container, queryByLabelText } = render(
			<AvatarStack avatars={[{ name: "A" }, { name: "B" }]} max={3} />,
		);
		expect(queryByLabelText(/more/)).not.toBeInTheDocument();
		expect(container.querySelectorAll("[aria-label]").length).toBe(2);
	});
});

describe("presence position", () => {
	it("defaults to bottom-right when no presencePosition supplied", () => {
		const { container } = render(<Avatar name="x" presence="online" />);
		const dot = container.querySelector("span[aria-hidden]") as HTMLElement;
		expect(dot).not.toBeNull();
		expect(dot.style.bottom).not.toBe("");
		expect(dot.style.right).not.toBe("");
		expect(dot.style.top).toBe("");
		expect(dot.style.left).toBe("");
	});

	it("presencePosition=top-right sets top and right, clears bottom and left", () => {
		const { container } = render(
			<Avatar name="x" presence="online" presencePosition="top-right" />,
		);
		const dot = container.querySelector("span[aria-hidden]") as HTMLElement;
		expect(dot).not.toBeNull();
		expect(dot.style.top).not.toBe("");
		expect(dot.style.right).not.toBe("");
		expect(dot.style.bottom).toBe("");
		expect(dot.style.left).toBe("");
	});

	it("presencePosition=top-left sets top and left, clears bottom and right", () => {
		const { container } = render(<Avatar name="x" presence="online" presencePosition="top-left" />);
		const dot = container.querySelector("span[aria-hidden]") as HTMLElement;
		expect(dot).not.toBeNull();
		expect(dot.style.top).not.toBe("");
		expect(dot.style.left).not.toBe("");
		expect(dot.style.bottom).toBe("");
		expect(dot.style.right).toBe("");
	});

	it("presencePosition=bottom-left sets bottom and left, clears top and right", () => {
		const { container } = render(
			<Avatar name="x" presence="online" presencePosition="bottom-left" />,
		);
		const dot = container.querySelector("span[aria-hidden]") as HTMLElement;
		expect(dot).not.toBeNull();
		expect(dot.style.bottom).not.toBe("");
		expect(dot.style.left).not.toBe("");
		expect(dot.style.top).toBe("");
		expect(dot.style.right).toBe("");
	});

	it("presencePosition=bottom-right (explicit) sets bottom and right", () => {
		const { container } = render(
			<Avatar name="x" presence="online" presencePosition="bottom-right" />,
		);
		const dot = container.querySelector("span[aria-hidden]") as HTMLElement;
		expect(dot).not.toBeNull();
		expect(dot.style.bottom).not.toBe("");
		expect(dot.style.right).not.toBe("");
		expect(dot.style.top).toBe("");
		expect(dot.style.left).toBe("");
	});

	it("no presence prop - no dot rendered (existing behavior unchanged)", () => {
		const { container } = render(<Avatar name="x" />);
		expect(container.querySelector("span[aria-hidden]")).toBeNull();
	});

	it("AvatarStack still renders without regressions after Avatar changes", () => {
		const { container } = render(
			<AvatarStack avatars={[{ name: "Alpha" }, { name: "Beta" }]} max={4} />,
		);
		expect(container.querySelectorAll("[aria-label]").length).toBe(2);
	});
});
