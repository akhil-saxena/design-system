import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, TypeToConfirm } from ".";

describe("ConfirmDialog", () => {
	it("renders null when open=false", () => {
		render(
			<ConfirmDialog
				open={false}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
			/>,
		);
		const panel = document.body.querySelector(".ds-atom-confirm-panel");
		expect(panel).toBeNull();
	});

	it("renders panel with role alertdialog when open=true", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
			/>,
		);
		const panel = document.body.querySelector(".ds-atom-confirm-panel");
		expect(panel).not.toBeNull();
		expect(panel?.getAttribute("role")).toBe("alertdialog");
		expect(panel?.getAttribute("aria-modal")).toBe("true");
	});

	it("calls onClose on Escape keydown", () => {
		const onClose = vi.fn();
		render(
			<ConfirmDialog
				open={true}
				onClose={onClose}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
			/>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onConfirm when the confirm button is clicked", () => {
		const onConfirm = vi.fn();
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={onConfirm}
				tone="danger"
				title="Sure?"
				confirmLabel="Confirm"
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("submitting the footer form (Enter on the confirm button) confirms", () => {
		const onConfirm = vi.fn();
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={onConfirm}
				tone="danger"
				title="Sure?"
				confirmLabel="Confirm"
			/>,
		);
		const form = screen.getByRole("button", { name: "Confirm" }).closest("form") as HTMLFormElement;
		fireEvent.submit(form);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("a11y: Enter while focused on Cancel does NOT confirm (no global-Enter handler)", () => {
		const onConfirm = vi.fn();
		const onClose = vi.fn();
		render(
			<ConfirmDialog
				open={true}
				onClose={onClose}
				onConfirm={onConfirm}
				tone="danger"
				title="Delete?"
				cancelLabel="Cancel"
			/>,
		);
		const cancel = screen.getByRole("button", { name: "Cancel" });
		cancel.focus();
		// A plain Enter keydown must no longer trigger the destructive confirm.
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onConfirm).not.toHaveBeenCalled();
		// Activating the focused Cancel button cancels.
		fireEvent.click(cancel);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("backdrop click does NOT call onClose", () => {
		const onClose = vi.fn();
		render(
			<ConfirmDialog
				open={true}
				onClose={onClose}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
			/>,
		);
		const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("danger tone: confirm button has data-variant=danger", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
				confirmLabel="Yes, delete"
			/>,
		);
		const confirmBtn = screen.getByText("Yes, delete").closest("button");
		expect(confirmBtn?.getAttribute("data-variant")).toBe("danger");
	});

	it("warn tone: confirm button has data-variant=primary", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="warn"
				title="Are you sure?"
				confirmLabel="Proceed"
			/>,
		);
		const confirmBtn = screen.getByText("Proceed").closest("button");
		expect(confirmBtn?.getAttribute("data-variant")).toBe("primary");
	});

	it("success tone: confirm button has data-variant=primary", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="success"
				title="Confirm action?"
				confirmLabel="Confirm"
			/>,
		);
		const confirmBtn = screen.getByText("Confirm").closest("button");
		expect(confirmBtn?.getAttribute("data-variant")).toBe("primary");
	});

	it("neutral tone: confirm button has data-variant=secondary", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="neutral"
				title="Continue?"
				confirmLabel="Continue"
			/>,
		);
		const confirmBtn = screen.getByText("Continue").closest("button");
		expect(confirmBtn?.getAttribute("data-variant")).toBe("secondary");
	});

	it("panel background is rgba(255,255,255,.97) regardless of outer context", () => {
		render(
			<ConfirmDialog
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				tone="danger"
				title="Sure?"
			/>,
		);
		const panel = document.body.querySelector(".ds-atom-confirm-panel") as HTMLElement;
		expect(panel).not.toBeNull();
		// jsdom normalizes rgba(255,255,255,.97) → rgba(255, 255, 255, 0.97)
		// Guard: panel must use an explicit rgba value — NOT a theme token like var(--cream)
		expect(panel.style.background).toMatch(/^rgba\(255,\s*255,\s*255,\s*0\.97\)$/);
	});
});

describe("TypeToConfirm", () => {
	it("confirm button is disabled until exact match", () => {
		render(
			<TypeToConfirm
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				title="Delete project?"
				guardWord="DELETE"
			/>,
		);
		const confirmBtn = screen.getByRole("button", { name: /delete forever/i });
		expect(confirmBtn).toBeDisabled();

		fireEvent.change(screen.getByRole("textbox"), { target: { value: "DELETE" } });
		expect(confirmBtn).not.toBeDisabled();
	});

	it("comparison is case-sensitive — 'delete' does not enable button", () => {
		render(
			<TypeToConfirm
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				title="Delete project?"
				guardWord="DELETE"
			/>,
		);
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "delete" } });
		expect(screen.getByRole("button", { name: /delete forever/i })).toBeDisabled();
	});

	it("leading space does not count — ' DELETE' does not enable button", () => {
		render(
			<TypeToConfirm
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				title="Delete project?"
				guardWord="DELETE"
			/>,
		);
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: " DELETE" } });
		expect(screen.getByRole("button", { name: /delete forever/i })).toBeDisabled();
	});

	it("Enter fires onConfirm only when ok=true", () => {
		const onConfirm = vi.fn();
		render(
			<TypeToConfirm
				open={true}
				onClose={() => {}}
				onConfirm={onConfirm}
				title="Delete project?"
				guardWord="DELETE"
			/>,
		);
		// Before match: Enter should NOT fire onConfirm
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onConfirm).not.toHaveBeenCalled();

		// After exact match: Enter should fire onConfirm
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "DELETE" } });
		fireEvent.keyDown(document, { key: "Enter" });
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("guardWord prop overrides default DELETE", () => {
		render(
			<TypeToConfirm
				open={true}
				onClose={() => {}}
				onConfirm={() => {}}
				title="Remove item?"
				guardWord="REMOVE"
				confirmLabel="Delete forever"
			/>,
		);
		const confirmBtn = screen.getByRole("button", { name: /delete forever/i });
		expect(confirmBtn).toBeDisabled();

		fireEvent.change(screen.getByRole("textbox"), { target: { value: "REMOVE" } });
		expect(confirmBtn).not.toBeDisabled();
	});
});
