import { render } from "@testing-library/react";
import { createRef } from "react";
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
