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
