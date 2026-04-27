import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sheet } from "./Sheet";

describe("Sheet", () => {
	it("renders portaled to body when open=true with role=dialog", () => {
		render(
			<Sheet open={true} onClose={() => {}} title="Details">
				<p>body</p>
			</Sheet>,
		);
		const panel = document.body.querySelector(".ds-atom-sheet");
		expect(panel).not.toBeNull();
		expect(panel?.getAttribute("role")).toBe("dialog");
		expect(screen.getByText("body")).toBeInTheDocument();
		const labelledBy = panel?.getAttribute("aria-labelledby");
		expect(labelledBy).toBeTruthy();
		expect(document.getElementById(labelledBy ?? "")?.textContent).toBe("Details");
	});

	it("returns null when open=false", () => {
		render(
			<Sheet open={false} onClose={() => {}}>
				<p>x</p>
			</Sheet>,
		);
		expect(document.body.querySelector(".ds-atom-sheet")).toBeNull();
	});

	it("side defaults to 'right'", () => {
		render(
			<Sheet open={true} onClose={() => {}}>
				<p>x</p>
			</Sheet>,
		);
		const panel = document.body.querySelector(".ds-atom-sheet");
		expect(panel?.getAttribute("data-side")).toBe("right");
	});

	it("side='left' applies data-side='left'", () => {
		render(
			<Sheet open={true} onClose={() => {}} side="left">
				<p>x</p>
			</Sheet>,
		);
		const panel = document.body.querySelector(".ds-atom-sheet");
		expect(panel?.getAttribute("data-side")).toBe("left");
	});

	it("backdrop click calls onClose when closeOnBackdropClick is default (true)", () => {
		const onClose = vi.fn();
		render(
			<Sheet open={true} onClose={onClose}>
				<p>x</p>
			</Sheet>,
		);
		const backdrop = document.body.querySelector(".ds-atom-sheet-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalled();
	});

	it("backdrop click does NOT call onClose when closeOnBackdropClick=false", () => {
		const onClose = vi.fn();
		render(
			<Sheet open={true} onClose={onClose} closeOnBackdropClick={false}>
				<p>x</p>
			</Sheet>,
		);
		const backdrop = document.body.querySelector(".ds-atom-sheet-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("Escape calls onClose", () => {
		const onClose = vi.fn();
		render(
			<Sheet open={true} onClose={onClose}>
				<p>x</p>
			</Sheet>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("auto-generates aria-labelledby + aria-describedby from title + description", () => {
		render(
			<Sheet open={true} onClose={() => {}} title="T" description="D">
				<p>x</p>
			</Sheet>,
		);
		const panel = document.body.querySelector(".ds-atom-sheet");
		const labelledBy = panel?.getAttribute("aria-labelledby");
		const describedBy = panel?.getAttribute("aria-describedby");
		expect(labelledBy).toBeTruthy();
		expect(describedBy).toBeTruthy();
		expect(document.getElementById(labelledBy ?? "")?.textContent).toBe("T");
		expect(document.getElementById(describedBy ?? "")?.textContent).toBe("D");
	});

	it("click on the sheet panel itself does NOT call onClose", () => {
		const onClose = vi.fn();
		render(
			<Sheet open={true} onClose={onClose}>
				<p>x</p>
			</Sheet>,
		);
		const panel = document.body.querySelector(".ds-atom-sheet") as HTMLElement;
		fireEvent.click(panel);
		expect(onClose).not.toHaveBeenCalled();
	});
});
