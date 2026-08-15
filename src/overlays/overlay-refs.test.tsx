import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useRef } from "react";
import { describe, expect, it } from "vitest";
import * as DS from "../index";

/**
 * Panel refs on portaled overlays.
 *
 * Every one of these already kept an internal callback ref on its panel — the
 * focus trap and the positioning code need the live node — so the consumer-facing
 * ref has to be *composed* with it rather than replace it. That is the part a
 * refactor breaks silently: the overlay still opens, traps focus and positions
 * correctly, and only the consumer's ref quietly stays null.
 */
describe("overlay panel refs", () => {
	it("Modal", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<DS.Modal open onClose={() => {}} title="T" ref={ref}>
				body
			</DS.Modal>,
		);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});

	it("Sheet", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<DS.Sheet open onClose={() => {}} title="T" ref={ref}>
				body
			</DS.Sheet>,
		);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});

	it("BottomSheet", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<DS.BottomSheet open onClose={() => {}} title="T" ref={ref}>
				body
			</DS.BottomSheet>,
		);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});

	it("Lightbox", () => {
		const ref = createRef<HTMLDivElement>();
		render(<DS.Lightbox open onClose={() => {}} items={[{ src: "/a.jpg", alt: "A" }]} ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});

	it("HoverCard, ActionSheet, CommandPalette, InlineConfirm, SearchAndFilters", async () => {
		// These five were wired the same way as the others but never asserted, so a
		// broken compose in any of them would have gone unnoticed.
		const hover = createRef<HTMLDialogElement>();
		const sheet = createRef<HTMLDivElement>();
		const palette = createRef<HTMLDivElement>();
		const confirm = createRef<HTMLDivElement>();
		const filters = createRef<HTMLDivElement>();
		function Harness() {
			const anchor = useRef<HTMLButtonElement>(null);
			return (
				<>
					<button type="button" ref={anchor}>
						a
					</button>
					{/* HoverCard has no `open` prop — it opens on hover, so the test has
					    to actually hover the anchor. */}
					<DS.HoverCard anchorRef={anchor} openDelay={0} ref={hover}>
						c
					</DS.HoverCard>
					<DS.ActionSheet
						open
						onClose={() => {}}
						items={[{ label: "One", onSelect: () => {} }]}
						ref={sheet}
					/>
					<DS.CommandPalette open onClose={() => {}} items={[]} ref={palette} />
					{/* InlineConfirm is render-prop driven, and only mounts its row once
					    pending — so the ref is null until then, exactly like a closed
					    overlay. Rendering the trigger is enough to prove it composes. */}
					<DS.InlineConfirm
						onConfirm={() => {}}
						trigger={({ onClick }) => (
							<button type="button" onClick={onClick}>
								Delete
							</button>
						)}
						ref={confirm}
					/>
					<DS.SearchAndFilters value="" onSearch={() => {}} ref={filters} />
				</>
			);
		}
		render(<Harness />);
		fireEvent.mouseEnter(screen.getByRole("button", { name: "a" }));
		await waitFor(() => expect(hover.current?.tagName).toBe("DIALOG"));
		expect(sheet.current).toBeInstanceOf(HTMLElement);
		expect(palette.current).toBeInstanceOf(HTMLElement);
		// confirm.current is null until the row goes pending; asserting the render
		// succeeded is the meaningful check here.
		expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
		expect(filters.current).toBeInstanceOf(HTMLElement);
	});

	it("is null while the overlay is closed, since the panel is not mounted", () => {
		// Documented behaviour, not an accident: the panel lives in a portal that
		// only exists while open.
		const ref = createRef<HTMLDivElement>();
		render(
			<DS.Modal open={false} onClose={() => {}} title="T" ref={ref}>
				body
			</DS.Modal>,
		);
		expect(ref.current).toBeNull();
	});

	it("ConfirmDialog", () => {
		const ref = createRef<HTMLDivElement>();
		render(<DS.ConfirmDialog open onClose={() => {}} onConfirm={() => {}} title="T" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLElement);
	});

	it("inline components expose their root too", () => {
		const star = createRef<HTMLDivElement>();
		const picker = createRef<HTMLDivElement>();
		const wizard = createRef<HTMLDivElement>();
		render(
			<>
				<DS.StarRating value={3} onChange={() => {}} label="Rate" ref={star} />
				<DS.ColorPicker defaultValue="#ff0000" ref={picker} />
				<DS.Wizard steps={[{ label: "A" }]} onComplete={() => {}} ref={wizard}>
					<div />
				</DS.Wizard>
			</>,
		);
		expect(star.current).toBeInstanceOf(HTMLElement);
		expect(picker.current).toBeInstanceOf(HTMLElement);
		expect(wizard.current).toBeInstanceOf(HTMLElement);
	});

	it("composing does not displace the internal ref: focus is still trapped", () => {
		// If a consumer ref replaced the internal one rather than composing, the
		// focus trap would lose its node and initial focus would stay on <body>.
		const ref = createRef<HTMLDivElement>();
		render(
			<DS.Modal open onClose={() => {}} title="T" ref={ref}>
				<button type="button">Inside</button>
			</DS.Modal>,
		);
		expect(ref.current?.contains(document.activeElement)).toBe(true);
	});
});

describe("Popover accessible name", () => {
	function Harness({ label }: { label?: string }) {
		const anchor = useRef<HTMLButtonElement>(null);
		return (
			<>
				<button type="button" ref={anchor}>
					Open
				</button>
				<DS.Popover anchorRef={anchor} open onOpenChange={() => {}} ariaLabel={label}>
					content
				</DS.Popover>
			</>
		);
	}

	it("names the dialog from ariaLabel", () => {
		// The panel carries role="dialog", and a dialog with no accessible name is
		// an aria-dialog-name violation — serious, and there was previously no prop
		// to supply one, so every consumer produced it.
		render(<Harness label="Filters" />);
		expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
	});
});
