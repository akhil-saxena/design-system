import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from ".";
describe("Modal", () => {
	it("renders portaled to body when open=true with role=dialog and aria-labelledby pointing at the header", () => {
		render(
			<Modal open={true} onClose={() => {}} title="Hello">
				<p>body</p>
			</Modal>,
		);
		const panel = document.body.querySelector(".ds-atom-modal");
		expect(panel).not.toBeNull();
		expect(panel?.getAttribute("role")).toBe("dialog");
		expect(screen.getByText("body")).toBeInTheDocument();
		const labelledBy = panel?.getAttribute("aria-labelledby");
		expect(labelledBy).toBeTruthy();
		const header = document.getElementById(labelledBy ?? "");
		expect(header?.textContent).toBe("Hello");
	});

	it("returns null when open=false", () => {
		render(
			<Modal open={false} onClose={() => {}}>
				<p>x</p>
			</Modal>,
		);
		expect(document.body.querySelector(".ds-atom-modal")).toBeNull();
	});

	it("calls onClose on Escape keydown", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose}>
				<p>x</p>
			</Modal>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("backdrop click calls onClose when closeOnBackdropClick=true (default)", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose}>
				<p>x</p>
			</Modal>,
		);
		const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalled();
	});

	it("backdrop click does NOT call onClose when closeOnBackdropClick=false; Escape still closes", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose} closeOnBackdropClick={false}>
				<p>x</p>
			</Modal>,
		);
		const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("role=alertdialog is passed through to panel", () => {
		render(
			<Modal open={true} onClose={() => {}} role="alertdialog">
				<p>x</p>
			</Modal>,
		);
		const panel = document.body.querySelector(".ds-atom-modal");
		expect(panel?.getAttribute("role")).toBe("alertdialog");
	});

	it("auto-generates aria-labelledby + aria-describedby from title + description", () => {
		render(
			<Modal open={true} onClose={() => {}} title="T" description="D">
				<p>x</p>
			</Modal>,
		);
		const panel = document.body.querySelector(".ds-atom-modal");
		const labelledBy = panel?.getAttribute("aria-labelledby");
		const describedBy = panel?.getAttribute("aria-describedby");
		expect(labelledBy).toBeTruthy();
		expect(describedBy).toBeTruthy();
		expect(document.getElementById(labelledBy ?? "")?.textContent).toBe("T");
		expect(document.getElementById(describedBy ?? "")?.textContent).toBe("D");
	});

	it("click on the modal panel itself does NOT call onClose", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose}>
				<p>x</p>
			</Modal>,
		);
		const panel = document.body.querySelector(".ds-atom-modal") as HTMLElement;
		fireEvent.click(panel);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("aria-labelledby points at the title only — accessible name excludes the Close button", () => {
		render(
			<Modal open={true} onClose={() => {}} title="Edit profile">
				<p>body</p>
			</Modal>,
		);
		const panel = document.body.querySelector(".ds-atom-modal");
		const labelledBy = panel?.getAttribute("aria-labelledby");
		expect(labelledBy).toBeTruthy();
		const labelEl = document.getElementById(labelledBy ?? "");
		// The id must be on the title element, NOT the <header> (which also contains
		// the Close button). The computed name is just the title, not "Edit profile Close".
		expect(labelEl?.tagName).toBe("SPAN");
		expect(labelEl?.textContent).toBe("Edit profile");
		expect(labelEl?.textContent).not.toMatch(/Close/);
		// The <header> must NOT carry the labelledby id anymore.
		const header = document.body.querySelector(".ds-atom-modal-hd");
		expect(header?.id).toBeFalsy();
	});

	it("focus trap: focuses the header close button (first focusable element) on open", () => {
		render(
			<Modal open={true} onClose={() => {}} title="Trap">
				<button type="button" data-testid="first-btn">
					First
				</button>
				<button type="button" data-testid="second-btn">
					Second
				</button>
			</Modal>,
		);
		// Close button in the header is now the first focusable element.
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
	});
});

// ConfirmDialog tests have moved to src/overlays/ConfirmDialog/ConfirmDialog.test.tsx
// (ConfirmDialog was extracted from Modal in phase 018-01)
