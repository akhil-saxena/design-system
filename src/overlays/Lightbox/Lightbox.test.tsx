import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Lightbox } from ".";
const oneItem = [{ src: "/a.jpg", alt: "A" }];
const twoItems = [
	{ src: "/a.jpg", alt: "A" },
	{ src: "/b.jpg", alt: "B" },
];
const threeItems = [
	{ src: "/a.jpg", alt: "A" },
	{ src: "/b.jpg", alt: "B" },
	{ src: "/c.jpg", alt: "C" },
];

describe("Lightbox", () => {
	it("renders portaled to document.body when open=true", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-backdrop")).toBeInTheDocument();
		expect(baseElement.querySelector("img")?.getAttribute("src")).toBe("/a.jpg");
	});

	it("returns null when open=false", () => {
		const { baseElement } = render(
			<Lightbox open={false} onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-backdrop")).toBeNull();
	});

	it("ArrowRight calls onIndexChange((activeIndex + 1) % length)", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={1}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		expect(onIndexChange).toHaveBeenCalledWith(2);
	});

	it("ArrowLeft from index 0 wraps around to last (D-350 wrap-around)", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={threeItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowLeft" });
		expect(onIndexChange).toHaveBeenCalledWith(2);
	});

	it("ArrowRight from last index wraps around to 0", () => {
		const onIndexChange = vi.fn();
		render(
			<Lightbox
				open
				onClose={() => {}}
				items={twoItems}
				activeIndex={1}
				onIndexChange={onIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowRight" });
		expect(onIndexChange).toHaveBeenCalledWith(0);
	});

	it("Escape key invokes onClose", () => {
		const onClose = vi.fn();
		render(<Lightbox open onClose={onClose} items={oneItem} activeIndex={0} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("items.length === 1: prev + next buttons NOT rendered", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={oneItem} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-prev")).toBeNull();
		expect(baseElement.querySelector(".ds-atom-lightbox-next")).toBeNull();
	});

	it("items.length > 1: prev + next buttons rendered", () => {
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={twoItems} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-prev")).toBeInTheDocument();
		expect(baseElement.querySelector(".ds-atom-lightbox-next")).toBeInTheDocument();
	});

	it("aria-label on dialog includes active item alt", () => {
		const items = [{ src: "/a.jpg", alt: "Senior Engineer Resume" }];
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={items} activeIndex={0} />,
		);
		const dialog = baseElement.querySelector('[role="dialog"]');
		expect(dialog?.getAttribute("aria-label")).toContain("Senior Engineer Resume");
	});

	it("caption renders when set on active item", () => {
		const items = [{ src: "/a.jpg", alt: "A", caption: "First slide" }];
		const { baseElement } = render(
			<Lightbox open onClose={() => {}} items={items} activeIndex={0} />,
		);
		expect(baseElement.querySelector(".ds-atom-lightbox-caption")?.textContent).toBe("First slide");
	});

	it("close button click invokes onClose", () => {
		const onClose = vi.fn();
		const { baseElement } = render(
			<Lightbox open onClose={onClose} items={oneItem} activeIndex={0} />,
		);
		const closeBtn = baseElement.querySelector(".ds-atom-lightbox-close");
		expect(closeBtn).not.toBeNull();
		fireEvent.click(closeBtn as Element);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("prev button click calls onIndexChange with prev index (wrap)", () => {
		const onIndexChange = vi.fn();
		const { baseElement } = render(
			<Lightbox
				open
				onClose={() => {}}
				items={twoItems}
				activeIndex={0}
				onIndexChange={onIndexChange}
			/>,
		);
		const prevBtn = baseElement.querySelector(".ds-atom-lightbox-prev");
		expect(prevBtn).not.toBeNull();
		fireEvent.click(prevBtn as Element);
		expect(onIndexChange).toHaveBeenCalledWith(1);
	});
});
