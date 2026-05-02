import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./Button";
import { TextInput } from "./TextInput";
import { Wizard, type WizardStep } from "./Wizard";

const meta: Meta<typeof Wizard> = {
	title: "Patterns/Wizard",
	component: Wizard,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Multi-step form scaffold (DS-74). Composes ProgressBar and useFocusTrap. Renders a stepper header, step content area, and Back/Next navigation — all inside a single focus-trapped container. Per-step `validate()` blocks advance and displays the error inline.",
			},
		},
	},
	argTypes: {
		steps: {
			control: false,
			description:
				"Ordered array of step definitions; each has a label, optional desc, and optional validate function.",
			table: {
				type: { summary: "{ label: string; desc?: string; validate?: () => string | null }[]" },
			},
		},
		onComplete: {
			control: false,
			description: "Called when the user clicks Next on the final step and all validation passes.",
			table: { type: { summary: "() => void" } },
		},
		onCancel: {
			control: false,
			description:
				"Called when the user clicks Back on the first step; omit to hide the Back button on step 0.",
			table: { type: { summary: "() => void" } },
		},
		orientation: {
			control: { type: "select" },
			options: ["horizontal", "vertical"],
			description: "Layout direction of the stepper header — horizontal (default) or vertical.",
			table: { type: { summary: '"horizontal" | "vertical"' } },
		},
		children: {
			control: false,
			description:
				"Render function called with the current zero-based step index; returns step content.",
			table: { type: { summary: "(step: number) => React.ReactNode" } },
		},
	},
};
export default meta;

type Story = StoryObj<typeof Wizard>;

// ─── ThreeStepForm ────────────────────────────────────────────────────────────
export const ThreeStepForm: Story = {
	name: "Three Step Form (with validation)",
	render: () => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [name, setName] = useState("");
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [done, setDone] = useState(false);

		const steps: WizardStep[] = [
			{
				label: "Personal Info",
				desc: "Your name and contact details",
				validate: () => {
					if (!name.trim()) return "Name is required";
					return null;
				},
			},
			{
				label: "Account Setup",
				desc: "Username and password",
			},
			{
				label: "Confirm",
				desc: "Review and submit",
			},
		];

		if (done) {
			return (
				<div
					style={{
						padding: 24,
						textAlign: "center",
						fontFamily: "var(--font)",
						color: "var(--ink)",
					}}
				>
					<div style={{ fontSize: 32, marginBottom: 8 }}>Done</div>
					<p style={{ color: "var(--ink-3)", fontSize: 13 }}>onComplete fired — form submitted.</p>
					<Button
						variant="primary"
						size="sm"
						style={{ marginTop: 16 }}
						onClick={() => {
							setDone(false);
							setName("");
						}}
					>
						Reset
					</Button>
				</div>
			);
		}

		return (
			<div style={{ maxWidth: 560 }}>
				<Wizard steps={steps} onComplete={() => setDone(true)}>
					{(step) => {
						if (step === 0) {
							return (
								<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
									<label
										htmlFor="wizard-name"
										style={{
											fontSize: 12,
											fontWeight: 600,
											fontFamily: "var(--font)",
											color: "var(--ink-2)",
										}}
									>
										Full name
									</label>
									<TextInput
										id="wizard-name"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Jane Smith"
									/>
								</div>
							);
						}
						if (step === 1) {
							return (
								<div
									style={{
										padding: 16,
										background: "var(--cream-2)",
										borderRadius: 8,
										fontSize: 13,
										color: "var(--ink-3)",
										fontFamily: "var(--font)",
									}}
								>
									Account setup fields would go here (username, password).
								</div>
							);
						}
						return (
							<div
								style={{
									padding: 16,
									background: "var(--cream-2)",
									borderRadius: 8,
									fontSize: 13,
									fontFamily: "var(--font)",
								}}
							>
								<div style={{ fontWeight: 700, marginBottom: 4, color: "var(--ink)" }}>
									Review your details
								</div>
								<div style={{ color: "var(--ink-3)" }}>Name: {name || "(not provided)"}</div>
							</div>
						);
					}}
				</Wizard>
			</div>
		);
	},
};

// ─── TwoStepNoValidation ──────────────────────────────────────────────────────
export const TwoStepNoValidation: Story = {
	name: "Two Steps (no validation)",
	render: () => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [done, setDone] = useState(false);
		const steps: WizardStep[] = [{ label: "Details" }, { label: "Submit" }];

		return (
			<div style={{ maxWidth: 480 }}>
				{done ? (
					<p style={{ fontFamily: "var(--font)", color: "var(--green-vivid)", fontWeight: 700 }}>
						Completed!
					</p>
				) : (
					<Wizard steps={steps} onComplete={() => setDone(true)}>
						{(step) => (
							<div
								style={{
									padding: 16,
									background: "var(--cream-2)",
									borderRadius: 8,
									fontFamily: "var(--font)",
									fontSize: 13,
									color: "var(--ink-3)",
								}}
							>
								Step {step + 1} content — no validation on any step.
							</div>
						)}
					</Wizard>
				)}
			</div>
		);
	},
};

// ─── VerticalOrientation ──────────────────────────────────────────────────────
export const VerticalOrientation: Story = {
	name: "Vertical Orientation",
	render: () => {
		const steps: WizardStep[] = [
			{ label: "Applied", desc: "Mar 12, 2026" },
			{ label: "Phone Screen", desc: "Mar 18, 2026" },
			{ label: "Technical Interview", desc: "Scheduled Mar 25" },
			{ label: "Onsite", desc: "Pending" },
		];

		return (
			<div style={{ maxWidth: 400 }}>
				<Wizard steps={steps} onComplete={() => {}} orientation="vertical">
					{(step) => (
						<div
							style={{
								padding: 16,
								background: "var(--cream-2)",
								borderRadius: 8,
								fontFamily: "var(--font)",
								fontSize: 13,
								color: "var(--ink-3)",
							}}
						>
							Currently on: {steps[step]?.label}
						</div>
					)}
				</Wizard>
			</div>
		);
	},
};

// ─── Dark ─────────────────────────────────────────────────────────────────────
export const Dark: Story = {
	name: "Dark Mode",
	render: () => {
		const steps: WizardStep[] = [
			{ label: "Step 1", desc: "First step" },
			{ label: "Step 2", desc: "Second step" },
			{ label: "Step 3", desc: "Final step" },
		];

		return (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 14,
					maxWidth: 560,
				}}
			>
				<Wizard steps={steps} onComplete={() => {}}>
					{(step) => (
						<div
							style={{
								padding: 16,
								background: "rgba(255,255,255,0.04)",
								borderRadius: 8,
								fontFamily: "var(--font)",
								fontSize: 13,
								color: "var(--ink-3)",
							}}
						>
							Dark mode — Step {step + 1} content
						</div>
					)}
				</Wizard>
			</div>
		);
	},
};
