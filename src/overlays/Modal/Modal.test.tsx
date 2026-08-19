import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Modal } from ".";
import { __dismissStackSize } from "../../hooks/useDismiss";
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

/**
 * F-15-2: `Modal` rendered a ghost `Button aria-label="Close"` into its header
 * unconditionally, with no prop to remove it — so it could not express a
 * fail-closed re-auth, the one dialog whose entire purpose is that you may not
 * dismiss it.
 *
 * `closable={false}` suppresses all THREE exits together. Suppressing only the
 * visible button would leave two working exits and look fixed, which is worse
 * than not having the prop.
 */
describe("Modal — closable (F-15-2)", () => {
	it("closable defaults to true: the Close button is present and closes", () => {
		// The control for every assertion below. The header button's own click path
		// was untested before this plan — only Escape and the backdrop were.
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose} title="Dismissable">
				<p>body</p>
			</Modal>,
		);
		const btn = screen.getByRole("button", { name: "Close" });
		fireEvent.click(btn);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closable={false} renders no Close button", () => {
		render(
			<Modal open={true} onClose={() => {}} closable={false} title="Re-authenticate">
				<button type="button">Sign in again</button>
			</Modal>,
		);
		expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
		// Non-vacuity: the dialog itself did render, so the absence above is the
		// button being suppressed and not the panel failing to mount.
		expect(document.body.querySelector(".ds-atom-modal")).not.toBeNull();
		expect(screen.getByRole("button", { name: "Sign in again" })).not.toBeNull();
	});

	it("closable={false} does not close on Escape", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose} closable={false} title="Re-authenticate">
				<p>body</p>
			</Modal>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).not.toHaveBeenCalled();
	});

	it("closable={false} does not close on a backdrop click", () => {
		const onClose = vi.fn();
		render(
			<Modal open={true} onClose={onClose} closable={false} title="Re-authenticate">
				<p>body</p>
			</Modal>,
		);
		const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
		expect(backdrop).not.toBeNull();
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("closable={false} does not close on a backdrop click even with closeOnBackdropClick=true", () => {
		// The two props can disagree. `closable` has to win, or the fail-closed
		// dialog is one default away from being dismissable again.
		const onClose = vi.fn();
		render(
			<Modal
				open={true}
				onClose={onClose}
				closable={false}
				closeOnBackdropClick={true}
				title="Re-authenticate"
			>
				<p>body</p>
			</Modal>,
		);
		const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
		fireEvent.click(backdrop);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("a closable={false} Modal SWALLOWS Escape rather than letting it reach the layer beneath", () => {
		// The reason it registers in the dismiss stack and ignores the key, rather
		// than declining to register: a trap dialog that steps out of the stack
		// leaves the topmost registered layer as the one BELOW it, so Escape would
		// close a surface the user cannot see behind the scrim and cannot reach
		// through the focus trap.
		const onOuterClose = vi.fn();
		const onTrapClose = vi.fn();
		render(
			<>
				<Modal open={true} onClose={onOuterClose} title="Outer">
					<p>outer body</p>
				</Modal>
				<Modal open={true} onClose={onTrapClose} closable={false} title="Re-authenticate">
					<p>trap body</p>
				</Modal>
			</>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onTrapClose).not.toHaveBeenCalled();
		expect(onOuterClose).not.toHaveBeenCalled();
	});

	it("closable={false} still unwinds the dismiss stack to zero on unmount", () => {
		// A layer that registers and never unregisters breaks Escape for every
		// dialog opened afterwards — the regression useDismiss exists to prevent.
		expect(__dismissStackSize()).toBe(0);
		const { unmount } = render(
			<Modal open={true} onClose={() => {}} closable={false} title="Re-authenticate">
				<p>body</p>
			</Modal>,
		);
		expect(__dismissStackSize()).toBe(1);
		unmount();
		expect(__dismissStackSize()).toBe(0);
	});

	it("documents the trap-by-design consequence on the prop", () => {
		// An undismissable dialog with no action in it is an accessibility failure.
		// The prop must not read as innocuous.
		const src = readFileSync(join(__dirname, "index.tsx"), "utf8");
		const iface = src.slice(
			src.indexOf("export interface ModalProps"),
			src.indexOf("export function Modal"),
		);
		const at = iface.indexOf("closable?:");
		expect(at).toBeGreaterThan(0);
		// The JSDoc block immediately preceding the member, not "somewhere in the
		// file" — prose elsewhere must not be able to satisfy this.
		const doc = iface.slice(iface.lastIndexOf("/**", at), at);
		expect(doc).toMatch(/trap/i);
		expect(doc).toMatch(/escape/i);
		expect(doc).toMatch(/backdrop/i);
	});
});

describe("Modal — inline (F-15-1)", () => {
	it("inline renders the panel in place instead of document.body", () => {
		const { container } = render(
			<Modal open={true} onClose={() => {}} inline title="Server-rendered">
				<p>body</p>
			</Modal>,
		);
		expect(container.querySelector(".ds-atom-modal")).not.toBeNull();
		expect(document.body.querySelectorAll(".ds-atom-modal")).toHaveLength(1);
	});

	it("inline server-renders the panel; the default renders 0 B", () => {
		const el = (
			<Modal open={true} onClose={() => {}} title="Server-rendered">
				<p>MODAL_SSR_MARKER</p>
			</Modal>
		);
		const inlineEl = (
			<Modal open={true} onClose={() => {}} inline title="Server-rendered">
				<p>MODAL_SSR_MARKER</p>
			</Modal>
		);
		expect(renderToStaticMarkup(el).length).toBe(0);
		const out = renderToStaticMarkup(inlineEl);
		expect(out.length).toBeGreaterThan(0);
		expect(out).toContain("MODAL_SSR_MARKER");
		expect(out).toContain('role="dialog"');
	});

	it("inline + closable={false} server-renders a dialog with no Close button", () => {
		// The two props compose: this is the fail-closed re-auth as a crawler and a
		// no-JS reader would receive it.
		const out = renderToStaticMarkup(
			<Modal open={true} onClose={() => {}} inline closable={false} title="Re-authenticate">
				<button type="button">Sign in again</button>
			</Modal>,
		);
		expect(out).toContain("Sign in again");
		expect(out).not.toContain('aria-label="Close"');
	});
});

// ConfirmDialog tests have moved to src/overlays/ConfirmDialog/ConfirmDialog.test.tsx
// (ConfirmDialog was extracted from Modal in phase 018-01)
