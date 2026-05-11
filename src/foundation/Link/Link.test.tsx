import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Link } from ".";

describe("Link", () => {
	it("renders children inside <a>", () => {
		const { container, getByText } = render(<Link href="/x">Sign in</Link>);
		expect(getByText("Sign in")).toBeInTheDocument();
		const a = container.querySelector("a.ds-atom-link") as HTMLAnchorElement;
		expect(a.getAttribute("href")).toBe("/x");
	});

	it("emits data-variant for each variant", () => {
		const variants = ["default", "inline", "footer", "action", "quiet"] as const;
		for (const variant of variants) {
			const { container, unmount } = render(<Link variant={variant}>x</Link>);
			const a = container.querySelector(".ds-atom-link") as HTMLElement;
			expect(a.dataset.variant).toBe(variant);
			unmount();
		}
	});

	it("`as` swaps the rendered element (e.g. <button>)", () => {
		const onClick = vi.fn();
		const { container } = render(
			<Link as="button" onClick={onClick}>
				CLEAR
			</Link>,
		);
		expect(container.querySelector("a")).toBeNull();
		const btn = container.querySelector("button.ds-atom-link") as HTMLButtonElement;
		expect(btn).not.toBeNull();
		fireEvent.click(btn);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("color prop overrides inline color", () => {
		const { container } = render(<Link color="#ff0000">x</Link>);
		const a = container.querySelector("a") as HTMLAnchorElement;
		expect(a.style.color).toContain("rgb(255, 0, 0)");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLAnchorElement>();
		render(<Link ref={ref}>x</Link>);
		expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
	});

	it("merges className", () => {
		const { container } = render(<Link className="extra">x</Link>);
		const a = container.querySelector(".ds-atom-link") as HTMLElement;
		expect(a.className).toContain("ds-atom-link");
		expect(a.className).toContain("extra");
	});
});
