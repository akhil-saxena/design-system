import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { StickyNote } from "./StickyNote";

describe("StickyNote", () => {
	it("renders default rotation 'right' on the root", () => {
		const { container } = render(<StickyNote>x</StickyNote>);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveAttribute("data-rotation", "right");
		expect(root).toHaveClass("ds-atom-stickynote");
	});

	it("applies data-rotation for each explicit value", () => {
		for (const r of ["left", "right", "none"] as const) {
			const { container } = render(<StickyNote rotation={r}>x</StickyNote>);
			expect(container.firstChild).toHaveAttribute("data-rotation", r);
		}
	});

	it("forwards ref to the root div", () => {
		const ref = createRef<HTMLDivElement>();
		render(<StickyNote ref={ref}>x</StickyNote>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveAttribute("data-rotation", "right");
	});

	it("spreads consumer props onto the root", () => {
		const onClick = vi.fn();
		const { container } = render(
			<StickyNote className="my-extra" data-testid="note-x" onClick={onClick}>
				body
			</StickyNote>,
		);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-stickynote");
		expect(root).toHaveClass("my-extra");
		expect(root).toHaveAttribute("data-testid", "note-x");
		root.click();
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("renders freely-composed children unchanged", () => {
		const { container, getByText } = render(
			<StickyNote>
				<h3>Title</h3>
				<p>Body line.</p>
				<div>Hint line</div>
			</StickyNote>,
		);
		expect(getByText("Title").tagName).toBe("H3");
		expect(getByText("Body line.").tagName).toBe("P");
		const root = container.firstChild as HTMLElement;
		expect(root.querySelector("h3")).not.toBeNull();
		expect(root.querySelector("p")).not.toBeNull();
	});

	it("merges consumer style last (consumer wins on collisions)", () => {
		const { container } = render(<StickyNote style={{ padding: "999px" }}>x</StickyNote>);
		const root = container.firstChild as HTMLElement;
		expect(root.style.padding).toBe("999px");
	});
});
