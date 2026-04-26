import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarStack, deriveGradient, deriveInitials } from "./Avatar";

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
		it("deterministic — same input always returns same gradient", () => {
			expect(deriveGradient("test")).toEqual(deriveGradient("test"));
			expect(deriveGradient("Maya Chen")).toEqual(deriveGradient("Maya Chen"));
		});
		it("case-insensitive (lowercased before hashing)", () => {
			expect(deriveGradient("ABC")).toEqual(deriveGradient("abc"));
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
