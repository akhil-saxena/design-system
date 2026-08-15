import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from ".";

const Glyph = () => <svg aria-hidden="true" role="presentation" />;

describe("IconButton", () => {
	it("takes its accessible name from `label`", () => {
		// The whole point of the primitive: an icon-only control cannot be
		// constructed without a name, because `label` is a required prop.
		render(<IconButton label="Close dialog" icon={<Glyph />} />);
		expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
	});

	it("hides the glyph from assistive tech so the control is announced once", () => {
		const { container } = render(<IconButton label="Close" icon={<Glyph />} />);
		expect(container.querySelector(".ds-atom-iconbtn-glyph")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	});

	it("defaults to type=button so it cannot submit an enclosing form", () => {
		render(<IconButton label="Close" icon={<Glyph />} />);
		expect(screen.getByRole("button")).toHaveAttribute("type", "button");
	});

	it("fires onClick, and does not when disabled", () => {
		const onClick = vi.fn();
		const { rerender } = render(<IconButton label="Close" icon={<Glyph />} onClick={onClick} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);

		rerender(<IconButton label="Close" icon={<Glyph />} onClick={onClick} disabled />);
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("marks itself busy and blocks interaction while loading", () => {
		const onClick = vi.fn();
		const { container } = render(
			<IconButton label="Saving" icon={<Glyph />} onClick={onClick} loading />,
		);
		const btn = screen.getByRole("button");
		expect(btn).toHaveAttribute("aria-busy", "true");
		expect(btn).toBeDisabled();
		expect(container.querySelector(".ds-atom-btn-spinner")).toBeInTheDocument();
		fireEvent.click(btn);
		expect(onClick).not.toHaveBeenCalled();
	});

	it("keeps a stable accessible name while loading", () => {
		render(<IconButton label="Saving" icon={<Glyph />} loading />);
		expect(screen.getByRole("button", { name: "Saving" })).toBeInTheDocument();
	});

	it("reflects variant and size as data attributes", () => {
		render(<IconButton label="Delete" icon={<Glyph />} variant="danger" size="lg" />);
		const btn = screen.getByRole("button");
		expect(btn).toHaveAttribute("data-variant", "danger");
		expect(btn).toHaveAttribute("data-size", "lg");
	});

	it("appends a consumer className rather than replacing the base class", () => {
		// Composing components (Lightbox, Pagination, Calendar…) rely on this to
		// keep their bespoke treatment while sharing the primitive.
		render(<IconButton label="Close" icon={<Glyph />} className="ds-atom-lightbox-close" />);
		const btn = screen.getByRole("button");
		expect(btn).toHaveClass("ds-atom-iconbtn");
		expect(btn).toHaveClass("ds-atom-lightbox-close");
	});

	it("declares no inline styles, so component classes win through the cascade", () => {
		// Button and TextInput both used to inline their base styles, which
		// silently outranked every class rule.
		render(<IconButton label="Close" icon={<Glyph />} />);
		expect(screen.getByRole("button").getAttribute("style")).toBeNull();
	});

	it("forwards a ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<IconButton ref={ref} label="Close" icon={<Glyph />} />);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
