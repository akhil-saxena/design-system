import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Wizard, type WizardStep } from "./Wizard";

const meta: Meta<typeof Wizard> = {
	title: "Primitives/Wizard",
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
					<button
						type="button"
						onClick={() => {
							setDone(false);
							setName("");
						}}
						style={{
							marginTop: 16,
							padding: "6px 16px",
							background: "var(--amber)",
							color: "#fff",
							border: "none",
							borderRadius: 7,
							cursor: "pointer",
							fontFamily: "var(--font)",
							fontWeight: 600,
						}}
					>
						Reset
					</button>
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
										style={{
											fontSize: 12,
											fontWeight: 600,
											fontFamily: "var(--font)",
											color: "var(--ink-2)",
										}}
									>
										Full name
									</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Jane Smith"
										style={{
											padding: "8px 12px",
											border: "1px solid var(--rule)",
											borderRadius: 7,
											fontFamily: "var(--font)",
											fontSize: 13,
											color: "var(--ink)",
											background: "var(--cream)",
										}}
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
					background: "var(--ink)",
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
