import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FieldError, FormErrorSummary, PasswordStrength } from ".";
import { SegmentedControl } from "../../data-display/SegmentedControl";
import { Field, useField } from "../../inputs/Field";
import { TextInput } from "../../inputs/TextInput";
const meta: Meta = {
	title: "Patterns/FormValidation",
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Composable form validation helpers (DS-75): `PasswordStrength` - 4-segment score bar; `FieldError` - inline field error message; `FormErrorSummary` - grouped error list for submit-time validation.",
			},
		},
	},
	argTypes: {
		score: {
			control: { type: "select" },
			options: [0, 1, 2, 3, 4],
			description:
				"Password strength score passed to `PasswordStrength`; 0 = empty, 4 = very strong.",
			table: { type: { summary: "0 | 1 | 2 | 3 | 4" } },
		},
		message: {
			control: "text",
			description: "Error message string passed to `FieldError`; renders below the input when set.",
			table: { type: { summary: "string | null" } },
		},
		errors: {
			control: false,
			description:
				"Array of error strings passed to `FormErrorSummary`; each renders as a list item.",
			table: { type: { summary: "string[]" } },
		},
		title: {
			control: "text",
			description:
				"Optional heading for `FormErrorSummary`; defaults to 'Please fix the following errors'.",
			table: { type: { summary: "string" } },
		},
	},
};

export default meta;
type Story = StoryObj;

export const PasswordStrengthAll: Story = {
	name: "PasswordStrength - all scores",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 220, width: "100%" }}
		>
			{([0, 1, 2, 3, 4] as const).map((score) => (
				<PasswordStrength key={score} score={score} />
			))}
		</div>
	),
};

function PasswordDemo() {
	const [value, setValue] = useState("");

	function calcScore(pw: string): 0 | 1 | 2 | 3 | 4 {
		if (!pw) return 0;
		let s = 0;
		if (pw.length >= 8) s++;
		if (/[A-Z]/.test(pw)) s++;
		if (/[0-9]/.test(pw)) s++;
		if (/[^A-Za-z0-9]/.test(pw)) s++;
		return s as 0 | 1 | 2 | 3 | 4;
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 260, width: "100%" }}>
			<TextInput
				type="password"
				placeholder="Enter password"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<PasswordStrength score={calcScore(value)} />
		</div>
	);
}

function RequiredDemo() {
	const single = useField({});
	const grouped = useField({});
	const warned = useField({ errorMessage: "Alt text is shorter than 15 characters." });
	return (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 300, width: "100%" }}
		>
			<Field
				label="Alt text"
				wiring={single}
				required
				hint="Describes the photo for screen readers."
			>
				<TextInput id={single.controlId} aria-describedby={single.describedBy} required />
			</Field>
			<Field label="Visibility" wiring={grouped} required group>
				<SegmentedControl
					options={[
						{ value: "public", label: "Public" },
						{ value: "draft", label: "Draft" },
					]}
					value="public"
					onChange={() => {}}
					ariaLabel="Visibility"
				/>
			</Field>
			<Field
				label="Caption"
				wiring={warned}
				required
				errorMessage="Alt text is shorter than 15 characters."
				errorTone="warning"
			>
				<TextInput
					id={warned.controlId}
					aria-describedby={warned.describedBy}
					defaultValue="A gull"
				/>
			</Field>
		</div>
	);
}

export const PasswordStrengthLive: Story = {
	name: "PasswordStrength - live input",
	render: () => <PasswordDemo />,
};

export const FieldErrorStory: Story = {
	name: "FieldError",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 260, width: "100%" }}>
			<TextInput placeholder="email@example.com" error />
			<FieldError message="Please enter a valid email address." />
		</div>
	),
};

export const FormErrorSummaryStory: Story = {
	name: "FormErrorSummary",
	render: () => (
		<div style={{ maxWidth: 320, width: "100%" }}>
			<FormErrorSummary
				errors={[
					"Name is required.",
					"Email address is invalid.",
					"Password must be at least 8 characters.",
				]}
			/>
		</div>
	),
};

export const FieldErrorSeverity: Story = {
	name: "FieldError - error vs warning (E11)",
	parameters: {
		docs: {
			description: {
				story:
					'The two severities used to render identically and both interrupted. `error` keeps `role="alert"`, which preempts the screen reader; `warning` uses `role="status"`, which waits. The visible difference is deliberately not colour alone \u2014 a monochrome or colour-blind reader gets the icon.',
			},
		},
	},
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300, width: "100%" }}
		>
			<FieldError message="Alt text is required before publishing." />
			<FieldError message="Alt text is shorter than 15 characters." tone="warning" />
		</div>
	),
};

export const FieldRequiredMarker: Story = {
	name: "Field - required marker (E15)",
	parameters: {
		docs: {
			description: {
				story:
					"Requiredness used to live in the label string, so every screen invented its own marker. The marker is `aria-hidden` because the control's own native `required` attribute is what announces it; under `group` it moves into the `<legend>`. The glyph comes from `primitives.css`, not from the JSX.",
			},
		},
	},
	render: () => <RequiredDemo />,
};

export const AnchoredErrorSummary: Story = {
	name: "FormErrorSummary - anchored entries (G-6)",
	parameters: {
		docs: {
			description: {
				story:
					"An entry can carry an `href`, and the anchor renders ON the list item that names the failure \u2014 the link text IS the failure. The workaround this replaces was a second ordered list beside the summary, bound to the first only by both arrays happening to be in the same order. A mixed array of strings and objects is shown; the last entry has no `href` and stays plain text.",
			},
		},
	},
	render: () => (
		<div style={{ maxWidth: 340, width: "100%" }}>
			<FormErrorSummary
				errors={[
					{ message: "R\u00e9sum\u00e9 is missing a role.", href: "#resume" },
					{ message: "Two photos have no alt text.", href: "#photos" },
					"Home intro is empty.",
				]}
			/>
		</div>
	),
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	decorators: [
		(Story) => (
			<div
				style={{
					background: "var(--cream-2)",
					padding: 24,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 280, width: "100%" }}
		>
			<PasswordStrength score={2} />
			<FieldError message="This field is required." />
			<FormErrorSummary errors={["Name is required.", "Email is invalid."]} />
		</div>
	),
};
