import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

	/**
	 * F-15-3, and the inversion of what this case used to assert.
	 *
	 * It previously read "panel background is rgba(255,255,255,.97) regardless of
	 * outer context", with the guard comment "panel must use an explicit rgba value
	 * — NOT a theme token". That was the codified form of the sibling repo's
	 * PROJECT.md decision "ConfirmDialog is always-light glass surface — not
	 * token-driven internally" (CONSTRAINT-010), and a second brand invalidates it:
	 * nothing in the charcoal cascade could reach a hardcoded value, so the panel
	 * was a near-white card floating on a charcoal page.
	 *
	 * The assertion is now that the panel carries NO inline background, because
	 * inline styles beat class rules without !important — leaving the object in
	 * place and adding a rule beside it would have changed nothing painted. What
	 * the rule RESOLVES to is asserted in a real browser by
	 * tests/visual/confirm-panel.spec.ts; jsdom implements no CSS specificity and
	 * never loads primitives.css, so a computed-style read here would prove nothing.
	 */
	it("panel carries no inline background, so the cascade can reach it", () => {
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
		expect(panel.style.background).toBe("");
		expect(panel.style.backgroundColor).toBe("");
		// The whole inline object is gone, not just its background: a leftover
		// box-shadow or border-radius would beat the sheet just as thoroughly.
		expect(panel.getAttribute("style")).toBeNull();
	});

	it("the panel rule exists in the authored sheet, under a ConfirmDialog banner", () => {
		// The finding was not "the class is missing" — the class was already on the
		// element. It was that no RULE for it existed anywhere under dist/css/,
		// because split-css.mjs derives sheets from primitives.css banners and
		// ConfirmDialog had no banner section at all.
		const css = readFileSync(join(__dirname, "../../primitives.css"), "utf8");
		const at = css.indexOf("/* ─── DS atom: ConfirmDialog ───");
		expect(
			at,
			"no ConfirmDialog banner — split-css.mjs emits no confirmdialog.css",
		).toBeGreaterThan(0);
		const next = css.indexOf("/* ─── DS", at + 10);
		const section = css.slice(at, next === -1 ? css.length : next);
		expect(section).toContain(".ds-atom-confirm-panel {");
		// Comments stripped before the ABSENCE assertion, per protocol section 7: the
		// banner has to quote rgba(255,255,255,.97) in order to record what it
		// superseded, so an unfiltered not.toContain would fail on the documentation
		// of the fix. This is the same self-invalidating shape 01-14 and 01-15 found
		// in shell gates, here inside a test.
		const rules = section.replace(/\/\*[\s\S]*?\*\//g, "");
		expect(rules).toContain(".ds-atom-confirm-panel {");
		// Token-driven, not a hardcoded colour. Both halves matter: the presence of
		// the token and the absence of the literal it replaced.
		expect(rules).toMatch(/background:\s*color-mix\(in srgb, var\(--panel\)/);
		expect(rules).not.toContain("255,255,255,.97");
		expect(rules).not.toMatch(/rgba\(255,\s*255,\s*255/);
	});

	it("every tone wash resolves through a token, not a hardcoded rgba", () => {
		// The danger tone's `var(--red)` ink was already token-driven; the WASH
		// behind it was the hardcoded half, and so were the other three tones'.
		const src = readFileSync(join(__dirname, "index.tsx"), "utf8");
		const table = src.slice(src.indexOf("const tones:"), src.indexOf("// ─── Tone → button"));
		const washes = [...table.matchAll(/^\t\tbg:\s*(.+),$/gm)].map((m) => m[1]);
		expect(washes).toHaveLength(4);
		for (const w of washes) {
			expect(w, `tone wash ${w} is not token-driven`).toMatch(/var\(--/);
			expect(w, `tone wash ${w} is a hardcoded colour`).not.toMatch(/^"rgba?\(\d/);
		}
	});

	it("records the superseded always-light-glass decision in the source", () => {
		// PROJECT.md in the sibling repo still says the panel is always-light and not
		// token-driven. That file belongs to that repository's own workflow and is not
		// edited from here, so the counter-record has to live in the code the next
		// reader will actually open.
		const src = readFileSync(join(__dirname, "index.tsx"), "utf8");
		const note = src.slice(
			src.indexOf("// ─── Shared panel style"),
			src.indexOf("// ─── ConfirmDialog"),
		);
		expect(note).toMatch(/supersede/i);
		expect(note).toMatch(/PROJECT\.md/);
		expect(note).toMatch(/always-light/i);
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

describe("ConfirmDialog — tone vocabulary", () => {
	// AlertBanner and Toast both spell this tone "warning"; ConfirmDialog shipped
	// "warn". Both now resolve to the same presentation so the system reads as one
	// vocabulary, without breaking consumers on the old spelling.
	it("treats the legacy 'warn' spelling as 'warning'", () => {
		const { container: withAlias } = render(
			<ConfirmDialog open tone="warn" title="T" onConfirm={() => {}} onClose={() => {}} />,
		);
		const aliasHtml = withAlias.innerHTML;
		cleanup();
		const { container: withCanonical } = render(
			<ConfirmDialog open tone="warning" title="T" onConfirm={() => {}} onClose={() => {}} />,
		);
		expect(aliasHtml).toBe(withCanonical.innerHTML);
	});
});
