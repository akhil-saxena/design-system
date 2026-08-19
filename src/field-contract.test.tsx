import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import * as DS from "./index";

/**
 * The validation contract, checked identically across every form control.
 *
 * Before this, only TextInput and Textarea could show a validation message —
 * twelve other controls had no `error` prop at all, so a validated form had to
 * hand-roll the affordance per control, differently each time. These tests exist
 * because the failure mode is drift: each control keeps working while quietly
 * disagreeing with the others about how an error looks, reads and announces.
 */
const MSG = "This field is required";

const controls: Array<[string, () => ReactElement]> = [
	["TextInput", () => <DS.TextInput aria-label="F" errorMessage={MSG} />],
	["Textarea", () => <DS.Textarea aria-label="F" errorMessage={MSG} />],
	["Select", () => <DS.Select value={null} onChange={() => {}} options={[]} errorMessage={MSG} />],
	[
		"MultiSelect",
		() => <DS.MultiSelect value={[]} onChange={() => {}} options={[]} errorMessage={MSG} />,
	],
	["Checkbox", () => <DS.Checkbox label="Accept" errorMessage={MSG} />],
	["Toggle", () => <DS.Toggle label="On" errorMessage={MSG} />],
	[
		"RangeSlider",
		() => <DS.RangeSlider value={5} onChange={() => {}} ariaLabel="V" errorMessage={MSG} />,
	],
	[
		"Autocomplete",
		() => (
			<DS.Autocomplete
				value=""
				onValueChange={() => {}}
				items={[]}
				getItemLabel={(i: string) => i}
				getItemKey={(i: string) => i}
				onSelect={() => {}}
				errorMessage={MSG}
			/>
		),
	],
	["ColorInput", () => <DS.ColorInput label="Brand" errorMessage={MSG} />],
	["NumberStepper", () => <DS.NumberStepper value={1} onChange={() => {}} errorMessage={MSG} />],
	["FileInput", () => <DS.FileInput onSelect={() => {}} errorMessage={MSG} />],
	["DatePicker", () => <DS.DatePicker value={null} onChange={() => {}} errorMessage={MSG} />],
	[
		"StarRating",
		() => <DS.StarRating value={3} onChange={() => {}} label="Rate" errorMessage={MSG} />,
	],
	[
		"SegmentedControl",
		() => (
			<DS.SegmentedControl
				options={[{ value: "a", label: "A" }]}
				value="a"
				onChange={() => {}}
				ariaLabel="Pick"
				errorMessage={MSG}
			/>
		),
	],
	[
		"RadioGroup",
		() => (
			<DS.RadioGroup name="g" label="Pick one" errorMessage={MSG}>
				<DS.Radio value="a" label="A" />
			</DS.RadioGroup>
		),
	],
];

describe("form control validation contract", () => {
	for (const [name, make] of controls) {
		describe(name, () => {
			it("renders the message and announces it", () => {
				// role="alert" matters: a message that appears on submit must be
				// announced, not just added to the DOM where nothing reads it.
				const { unmount } = render(make());
				expect(screen.getByRole("alert")).toHaveTextContent(MSG);
				unmount();
			});

			it("marks the control aria-invalid and points describedby at the message", () => {
				// aria-invalid is the part that actually tells assistive tech the field
				// is wrong; styling alone conveys nothing to a screen reader.
				const { container, unmount } = render(make());
				const invalid = container.querySelector("[aria-invalid='true']");
				expect(invalid, `${name} set no aria-invalid`).not.toBeNull();

				const describedBy = invalid?.getAttribute("aria-describedby");
				expect(describedBy, `${name} did not describe its control`).toBeTruthy();
				const alertId = screen.getByRole("alert").id;
				expect(describedBy?.split(" ")).toContain(alertId);
				unmount();
			});
		});
	}

	it("a hint and an error are both described, not one replacing the other", () => {
		const { container } = render(
			<DS.TextInput aria-label="F" hint="Two or more characters" errorMessage={MSG} />,
		);
		const ids = container.querySelector("[aria-invalid='true']")?.getAttribute("aria-describedby");
		expect(ids?.split(" ")).toHaveLength(2);
	});

	it("preserves an aria-describedby the consumer already passed", () => {
		// Overwriting it would silently drop a description the consumer wired up.
		const { container } = render(
			<>
				<span id="external">External note</span>
				<DS.TextInput aria-label="F" aria-describedby="external" errorMessage={MSG} />
			</>,
		);
		const ids = container.querySelector("[aria-invalid='true']")?.getAttribute("aria-describedby");
		expect(ids?.split(" ")).toContain("external");
	});

	it("adds no wrapper when there is no label, hint or message", () => {
		// The scaffold must not appear uninvited: emitting it always would insert a
		// div into every existing consumer's layout.
		const { container } = render(<DS.TextInput aria-label="F" />);
		expect(container.querySelector(".ds-atom-field")).toBeNull();
	});

	it("labels a radio group with a legend, since <label for> cannot name a group", () => {
		render(
			<DS.RadioGroup name="g" label="Pick one">
				<DS.Radio value="a" label="A" />
			</DS.RadioGroup>,
		);
		const group = screen.getByRole("group");
		expect(within(group).getByText("Pick one").tagName).toBe("LEGEND");
	});
});

describe("async dropdown loading state", () => {
	/** The panel only exists while open, so every case has to open it first. */
	function open() {
		fireEvent.click(screen.getByRole("combobox"));
	}

	it("Select distinguishes 'still loading' from 'no results'", () => {
		// Without this the two states were indistinguishable: an async list that had
		// not arrived rendered "No results", telling the user their query matched
		// nothing when in fact nothing had been fetched yet.
		render(<DS.Select value={null} onChange={() => {}} options={[]} loading ariaLabel="Pick" />);
		open();
		expect(screen.queryByText("No results")).toBeNull();
		expect(screen.getByText("Loading…")).toHaveAttribute("aria-live", "polite");
	});

	it("Select falls back to the empty state once loading finishes", () => {
		render(<DS.Select value={null} onChange={() => {}} options={[]} ariaLabel="Pick" />);
		open();
		expect(screen.getByText("No results")).toBeTruthy();
	});

	it("MultiSelect announces its loading row too", () => {
		render(<DS.MultiSelect value={[]} onChange={() => {}} options={[]} loading ariaLabel="Pick" />);
		open();
		expect(screen.getByText("Loading…")).toHaveAttribute("aria-live", "polite");
	});
});

describe("loading state on async-fed collections", () => {
	it("Autocomplete shows loading instead of 'No results'", () => {
		// The two states were indistinguishable: a list still in flight rendered
		// "No results", which asserts the query matched nothing.
		render(
			<DS.Autocomplete
				value="ad"
				onValueChange={() => {}}
				items={[]}
				getItemLabel={(i: string) => i}
				getItemKey={(i: string) => i}
				onSelect={() => {}}
				loading
			/>,
		);
		fireEvent.focus(screen.getByRole("combobox"));
		expect(screen.queryByText("No results")).toBeNull();
		expect(screen.getByText("Loading…")).toHaveAttribute("aria-live", "polite");
	});

	it("DataGrid shows a loading row spanning every column", () => {
		render(
			<DS.DataGrid
				columns={[
					{ key: "a", label: "A", width: 100 },
					{ key: "b", label: "B", width: 100 },
				]}
				rows={[]}
				loading
			/>,
		);
		const cell = screen.getByText("Loading…");
		// +1 for the selection column, or the row would not span the full width.
		expect(cell.getAttribute("colspan")).toBe("3");
		expect(cell).toHaveAttribute("aria-live", "polite");
	});

	it("Table.StateRow gives the compositional API the same affordance", () => {
		// Table cannot take a `loading` prop — the consumer owns the body — so the
		// state row is a compound member instead.
		render(
			<DS.Table.Root ariaLabel="t">
				<DS.Table.Body>
					<DS.Table.StateRow colSpan={2}>Loading…</DS.Table.StateRow>
				</DS.Table.Body>
			</DS.Table.Root>,
		);
		const cell = screen.getByText("Loading…");
		expect(cell.getAttribute("colspan")).toBe("2");
		expect(cell).toHaveAttribute("aria-live", "polite");
	});
});

/**
 * E15 — `FieldProps` had no `required` flag, so requiredness was encoded in the
 * label string ("Alt text (required)") and repeated in the hint. The measured
 * consequence: every screen invents its own marker and they will not match.
 *
 * These tests pin the three decisions, not just the prop:
 *   1. the glyph is NOT a JSX literal — it comes from primitives.css, so a
 *      consumer can restyle it and a locale can change it;
 *   2. the marker is `aria-hidden` — the native `required` attribute already
 *      announces requiredness, and a marker in the accessible name says it twice;
 *   3. under `group` the marker moves into the <legend>, because a <label for>
 *      cannot name a group and an orphaned marker names nothing.
 */
function FieldHarness({
	label = "Alt text",
	required,
	group,
	errorMessage,
	errorTone,
}: {
	label?: string;
	required?: boolean;
	group?: boolean;
	errorMessage?: string;
	errorTone?: "error" | "warning";
}) {
	const wiring = DS.useField({ errorMessage });
	return (
		<DS.Field
			label={label}
			wiring={wiring}
			required={required}
			group={group}
			errorMessage={errorMessage}
			errorTone={errorTone}
		>
			<input id={wiring.controlId} aria-describedby={wiring.describedBy} />
		</DS.Field>
	);
}

const MARKER = ".ds-atom-field-required";

describe("Field required marker (E15)", () => {
	it("renders exactly one marker, inside the label", () => {
		const { container } = render(<FieldHarness required />);
		const markers = container.querySelectorAll(MARKER);
		expect(markers, "expected exactly one required marker").toHaveLength(1);
		expect(markers[0]?.closest("label"), "marker is not inside the label").not.toBeNull();
	});

	it("does not put the marker in the accessible name", () => {
		// Two mechanisms, both asserted: aria-hidden removes the element and its
		// generated content from the accessibility tree, and the element carries no
		// text of its own so it could not contribute a name even without it.
		const { container } = render(<FieldHarness required />);
		const marker = container.querySelector(MARKER);
		expect(marker?.getAttribute("aria-hidden")).toBe("true");
		expect(marker?.textContent, "the glyph must come from CSS, not from JSX").toBe("");
	});

	it("moves the marker into the legend when the field is a group", () => {
		const { container } = render(<FieldHarness required group />);
		const marker = container.querySelector(MARKER);
		expect(marker, "no marker rendered for a grouped field").not.toBeNull();
		expect(marker?.closest("legend"), "marker is orphaned outside the <legend>").not.toBeNull();
		expect(container.querySelector("fieldset")).not.toBeNull();
	});

	it("renders no marker and unchanged markup when required is absent", () => {
		// The prop is additive: an existing consumer's DOM must not gain an element.
		const { container: withOut } = render(<FieldHarness />);
		expect(withOut.querySelector(MARKER)).toBeNull();
		const label = withOut.querySelector("label");
		expect(label?.children, "the label gained a child it did not have before").toHaveLength(0);
		expect(label?.textContent).toBe("Alt text");
	});
});

/**
 * E11 — `FieldError` had no severity axis, so D-18's LENIENT warning and its
 * STRICT publish block rendered identically and *both interrupted*. The
 * interruption is half the defect: `role="alert"` preempts, `role="status"`
 * waits. A colour change alone would have fixed neither half.
 */
describe("FieldError severity (E11)", () => {
	it("defaults to the error treatment, unchanged", () => {
		const { container } = render(<DS.FieldError message={MSG} />);
		const el = screen.getByRole("alert");
		expect(el).toHaveTextContent(MSG);
		expect(el).toHaveClass("ds-atom-field-error");
		expect(el.getAttribute("data-tone"), "default markup must not gain an attribute").toBeNull();
		expect(container.querySelector(".ds-atom-field-error-icon")).toBeNull();
	});

	it("a warning does not interrupt", () => {
		render(<DS.FieldError message={MSG} tone="warning" />);
		expect(screen.queryByRole("alert"), "a warning must not preempt the reader").toBeNull();
		expect(screen.getByRole("status")).toHaveTextContent(MSG);
	});

	it("distinguishes a warning by more than colour", () => {
		// A colour and a colour alone is not a distinction: a monochrome or
		// colour-blind reader gets nothing from it. The icon element is the
		// non-colour half, and it is aria-hidden because the message already says it.
		const { container } = render(<DS.FieldError message={MSG} tone="warning" />);
		expect(container.querySelector(".ds-atom-field-error")).toHaveAttribute("data-tone", "warning");
		const icon = container.querySelector(".ds-atom-field-error-icon");
		expect(icon, "no non-colour distinction rendered").not.toBeNull();
		expect(icon?.getAttribute("aria-hidden")).toBe("true");
		expect(icon?.textContent, "the glyph must come from CSS, not from JSX").toBe("");
	});

	it("expresses a warning through the Field scaffold too", () => {
		render(<FieldHarness errorMessage={MSG} errorTone="warning" />);
		expect(screen.queryByRole("alert")).toBeNull();
		expect(screen.getByRole("status")).toHaveTextContent(MSG);
	});
});

/**
 * The assertion that keeps severity available everywhere at once: every control
 * that can show a validation message routes it through `FieldError`, rather than
 * each hand-rolling a span that agrees today and drifts tomorrow. Structural, not
 * nominal — the reference is what `FieldError` actually renders.
 */
describe("every error-capable control routes through FieldError", () => {
	function shapeOf(el: Element) {
		return {
			tag: el.tagName,
			cls: Array.from(el.classList).sort().join(" "),
			role: el.getAttribute("role"),
		};
	}

	/**
	 * The reference is read from a live `FieldError` render, not written out here,
	 * so a change to `FieldError` propagates into the loop below. Split into its own
	 * case deliberately: with the literal pin inside the loop's test, a mutation to
	 * `FieldError` short-circuits before the loop runs, and the control could not
	 * tell "the mutation landed" from "the routing broke".
	 */
	function reference() {
		const { container, unmount } = render(<DS.FieldError message={MSG} />);
		const shape = shapeOf(container.querySelector(".ds-atom-field-error") as Element);
		unmount();
		return shape;
	}

	it("FieldError's own output is the shape it has always had", () => {
		expect(reference()).toEqual({ tag: "SPAN", cls: "ds-atom-field-error", role: "alert" });
	});

	it("matches FieldError's own output for all fifteen controls", () => {
		const ref = reference();
		for (const [name, make] of controls) {
			const { unmount } = render(make());
			const el = screen.getByRole("alert");
			expect(shapeOf(el), `${name} does not route its message through FieldError`).toEqual(ref);
			unmount();
		}
	});

	it("routes the Field scaffold's own error slot through it as well", () => {
		const { container } = render(<FieldHarness errorMessage={MSG} />);
		const el = screen.getByRole("alert");
		expect(shapeOf(el)).toEqual({ tag: "SPAN", cls: "ds-atom-field-error", role: "alert" });
		// The scaffold still owns the id, because aria-describedby points at it.
		expect(el.id).toBeTruthy();
		expect(
			container.querySelector("input")?.getAttribute("aria-describedby")?.split(" "),
		).toContain(el.id);
	});
});
