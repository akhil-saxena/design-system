import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { StatusPill, type StatusPillStage } from ".";

describe("StatusPill", () => {
	it("renders children", () => {
		const { getByText } = render(<StatusPill stage="applied">Applied</StatusPill>);
		expect(getByText("Applied")).toBeInTheDocument();
	});

	it("defaults to interactive <button type=button>", () => {
		const { container } = render(<StatusPill stage="offer">Offer</StatusPill>);
		const btn = container.querySelector("button") as HTMLButtonElement;
		expect(btn).not.toBeNull();
		expect(btn.type).toBe("button");
		expect(btn.dataset.interactive).toBe("true");
	});

	it("renders <span> when interactive=false and ignores onClick", () => {
		const { container } = render(
			<StatusPill stage="offer" interactive={false}>
				Offer
			</StatusPill>,
		);
		expect(container.querySelector("button")).toBeNull();
		const span = container.querySelector("span.ds-atom-statuspill") as HTMLSpanElement;
		expect(span).not.toBeNull();
		expect(span.dataset.interactive).toBe("false");
	});

	it("fires onClick when interactive", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<StatusPill stage="screening" onClick={onClick}>
				Screening
			</StatusPill>,
		);
		fireEvent.click(getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("emits data-stage for every stage", () => {
		const stages: StatusPillStage[] = [
			"wishlist",
			"applied",
			"screening",
			"interviewing",
			"offer",
			"closed",
		];
		for (const stage of stages) {
			const { container, unmount } = render(<StatusPill stage={stage}>{stage}</StatusPill>);
			const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
			expect(el.dataset.stage).toBe(stage);
			unmount();
		}
	});

	it("renders chevron only when withChevron is set", () => {
		const { container, rerender } = render(<StatusPill stage="applied">Applied</StatusPill>);
		expect(container.querySelector(".ds-atom-statuspill-chev")).toBeNull();
		rerender(
			<StatusPill stage="applied" withChevron>
				Applied
			</StatusPill>,
		);
		expect(container.querySelector(".ds-atom-statuspill-chev")).not.toBeNull();
	});

	it("forwards ref to <button> when interactive", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<StatusPill ref={ref} stage="applied">
				x
			</StatusPill>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("forwards ref to <span> when interactive=false", () => {
		const ref = createRef<HTMLSpanElement>();
		render(
			<StatusPill ref={ref} stage="applied" interactive={false}>
				x
			</StatusPill>,
		);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("merges custom className", () => {
		const { container } = render(
			<StatusPill stage="applied" className="my-class">
				x
			</StatusPill>,
		);
		const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
		expect(el.className).toContain("ds-atom-statuspill");
		expect(el.className).toContain("my-class");
	});
});

/**
 * G-5: the stage union was job-domain-locked
 * (`wishlist | applied | screening | interviewing | offer | closed`), so
 * `StatusPill` appeared on ZERO of the seven admin screens and `Badge` stood in
 * on three surfaces it could not express. These cases cover the generic path —
 * a tone plus a label — while the block above proves the six job stages survive
 * as a preset.
 *
 * The tone vocabulary is `src/foundation/tone.ts`'s, the same one `Text`,
 * `Heading` and `Eyebrow` consume. A pill with its own closed union would be a
 * fourth vocabulary, which is the shape of the defect being fixed.
 */
describe("StatusPill generic tone path (G-5)", () => {
	it("renders the label with the tone, and no job-domain vocabulary", () => {
		const { container, getByText } = render(<StatusPill tone="success" label="Published" />);
		expect(getByText("Published")).toBeInTheDocument();
		const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
		expect(el.dataset.tone).toBe("success");
		// The two paths are mutually exclusive at runtime as well as in the types.
		expect(el.dataset.stage).toBeUndefined();
	});

	it("accepts every semantic Tone name", () => {
		for (const tone of ["primary", "secondary", "muted", "accent", "danger", "success"] as const) {
			const { container, unmount } = render(<StatusPill tone={tone} label={tone} />);
			const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
			expect(el.dataset.tone).toBe(tone);
			unmount();
		}
	});

	it("normalises the deprecated raw-token spellings through resolveTone", () => {
		// LegacyTone exists so consumers written against the old raw-token API keep
		// working; `data-tone` must carry the CANONICAL name so primitives.css only
		// ever needs the six semantic rules.
		for (const [legacy, semantic] of [
			["ink", "primary"],
			["ink-2", "secondary"],
			["ink-3", "muted"],
			["ink-4", "muted"],
			["amber", "accent"],
			["red", "danger"],
			["green", "success"],
		] as const) {
			const { container, unmount } = render(<StatusPill tone={legacy} label="x" />);
			const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
			expect(el.dataset.tone).toBe(semantic);
			unmount();
		}
	});

	it("emits a non-colour marker on the generic path and never on the preset path", () => {
		// F-15-5's second half. A 1.2:1 fill ladder is a colour distinction; the
		// marker is a SHAPE, so a monochrome or colour-blind reader gets the same
		// three-way split. G-7's evidence states the principle for a neighbouring
		// component: "one of them is a colour and a colour alone is not a
		// distinction."
		const { container } = render(<StatusPill tone="accent" label="Maintained" />);
		const marker = container.querySelector(".ds-atom-statuspill-marker");
		expect(marker).not.toBeNull();
		expect(marker?.getAttribute("aria-hidden")).toBe("true");

		// The preset path is unchanged, so no existing render moves.
		const preset = render(<StatusPill stage="offer">Offer</StatusPill>);
		expect(preset.container.querySelector(".ds-atom-statuspill-marker")).toBeNull();
	});

	it("carries data-step so the ladder and the marker shape cannot disagree", () => {
		// The fill ladder and the marker shape are two expressions of ONE three-way
		// split. Deriving both from data-step is what stops a later restyle moving
		// the fill without moving the shape — which would leave a monochrome reader
		// with three identical pills again.
		const expected: Record<string, string> = {
			muted: "1",
			success: "1",
			secondary: "2",
			accent: "2",
			primary: "3",
			danger: "3",
		};
		for (const [tone, step] of Object.entries(expected)) {
			const { container, unmount } = render(<StatusPill tone={tone as "muted"} label={tone} />);
			const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
			expect(el.dataset.step, `tone ${tone}`).toBe(step);
			unmount();
		}
	});

	it("renders a <span> by default on the generic path, not a <button>", () => {
		// A status READ OUT of content is not a control. The preset path defaults to
		// interactive because changing a pipeline stage is what a kanban pill is
		// FOR; a Live/Maintained/Archived label on a public Work card is not.
		const { container } = render(<StatusPill tone="muted" label="Archived" />);
		expect(container.querySelector("button")).toBeNull();
		expect(container.querySelector("span.ds-atom-statuspill")).not.toBeNull();
	});

	it("still merges a consumer className on the generic path", () => {
		const { container } = render(<StatusPill tone="danger" label="x" className="mine" />);
		const el = container.querySelector(".ds-atom-statuspill") as HTMLElement;
		expect(el.className).toContain("ds-atom-statuspill");
		expect(el.className).toContain("mine");
	});

	it("rejects at the type level: neither a preset stage nor a label", () => {
		// @ts-expect-error - a pill with no stage and no label has no content and no
		// tone; the discriminated union must not admit it.
		const bare = <StatusPill />;
		// @ts-expect-error - stage and tone are mutually exclusive, so a call site
		// cannot supply both and leave the reader guessing which one wins.
		const both = <StatusPill stage="offer" tone="success" label="Offer" />;
		expect(bare).toBeTruthy();
		expect(both).toBeTruthy();
	});
});
