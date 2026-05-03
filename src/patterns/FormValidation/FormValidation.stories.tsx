import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FieldError, FormErrorSummary, PasswordStrength } from ".";
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

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 24,
					borderRadius: 8,
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
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
