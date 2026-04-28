import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DSDropdown } from "./DSDropdown";

function Harness(props: {
	open: boolean;
	onOpenChange?: (b: boolean) => void;
	activeIndex?: number;
	onActiveIndexChange?: (i: number) => void;
	onSelect?: (i: number) => void;
	itemCount?: number;
}) {
	const anchorRef = useRef<HTMLButtonElement | null>(null);
	return (
		<>
			<button ref={anchorRef} type="button">
				anchor
			</button>
			<DSDropdown
				anchorRef={anchorRef}
				open={props.open}
				onOpenChange={props.onOpenChange ?? (() => {})}
				activeIndex={props.activeIndex ?? 0}
				onActiveIndexChange={props.onActiveIndexChange ?? (() => {})}
				itemCount={props.itemCount ?? 3}
				onSelect={props.onSelect ?? (() => {})}
			>
				<div data-testid="panel-content">items</div>
			</DSDropdown>
		</>
	);
}

describe("DSDropdown", () => {
	it("renders nothing when open=false", () => {
		render(<Harness open={false} />);
		expect(document.body.querySelector('[data-testid="panel-content"]')).toBeNull();
	});

	it("portals panel into document.body when open=true", () => {
		render(<Harness open={true} />);
		expect(document.body.querySelector('[data-testid="panel-content"]')).not.toBeNull();
	});

	it("ArrowDown advances activeIndex (with wrap)", () => {
		const onActiveIndexChange = vi.fn();
		render(
			<Harness
				open={true}
				activeIndex={0}
				itemCount={3}
				onActiveIndexChange={onActiveIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowDown" });
		expect(onActiveIndexChange).toHaveBeenCalledWith(1);
	});

	it("ArrowUp from 0 wraps to last", () => {
		const onActiveIndexChange = vi.fn();
		render(
			<Harness
				open={true}
				activeIndex={0}
				itemCount={3}
				onActiveIndexChange={onActiveIndexChange}
			/>,
		);
		fireEvent.keyDown(document, { key: "ArrowUp" });
		expect(onActiveIndexChange).toHaveBeenCalledWith(2);
	});

	it("Enter calls onSelect with activeIndex", () => {
		const onSelect = vi.fn();
		render(<Harness open={true} activeIndex={1} itemCount={3} onSelect={onSelect} />);
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith(1);
	});

	it("Escape calls onOpenChange(false)", () => {
		const onOpenChange = vi.fn();
		render(<Harness open={true} onOpenChange={onOpenChange} />);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
