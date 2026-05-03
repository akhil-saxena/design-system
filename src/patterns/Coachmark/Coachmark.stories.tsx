import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Coachmark } from ".";
import { Button } from "../../inputs/Button";
const meta: Meta<typeof Coachmark> = {
	title: "Patterns/Coachmark",
	component: Coachmark,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"First-run hint anchored to a target element via Popover (DS-76). Dismissible with optional localStorage persistence. Supports multi-step sequences with dot progress indicator. Use the **Show again** button in each story to re-trigger after dismissing.",
			},
		},
	},
	argTypes: {
		anchorRef: {
			control: false,
			description: "Ref to the DOM element the Coachmark popover is anchored to.",
			table: { type: { summary: "React.RefObject<HTMLElement>" } },
		},
		title: {
			control: "text",
			description: "Heading text displayed inside the Coachmark popover.",
			table: { type: { summary: "string" } },
		},
		desc: {
			control: "text",
			description: "Optional body text rendered below the title.",
			table: { type: { summary: "string" } },
		},
		step: {
			control: "number",
			description: "Current step number in a multi-step sequence; shown as a dot indicator.",
			table: { type: { summary: "number" } },
		},
		total: {
			control: "number",
			description: "Total number of steps; combined with `step` to render the dot progress row.",
			table: { type: { summary: "number" } },
		},
		placement: {
			control: { type: "select" },
			options: ["bottom-start", "bottom-end", "top-start", "top-end"],
			description: "Popover placement relative to the anchor element.",
			table: { type: { summary: '"bottom-start" | "bottom-end" | "top-start" | "top-end"' } },
		},
		storageKey: {
			control: "text",
			description:
				"localStorage key used to persist dismissed state; pass null to disable persistence.",
			table: { type: { summary: "string | null" } },
		},
		onNext: {
			control: false,
			description: "Called when the user clicks the Next button in a multi-step sequence.",
			table: { type: { summary: "() => void" } },
		},
		onDone: {
			control: false,
			description: "Called when the user clicks Done on the final step.",
			table: { type: { summary: "() => void" } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof Coachmark>;

// ─── Single hint ──────────────────────────────────────────────────────────────

function SingleHint() {
	const ref = useRef<HTMLButtonElement>(null);
	const [key, setKey] = useState(0);

	return (
		<div
			style={{
				padding: 48,
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				gap: 12,
			}}
		>
			<Button ref={ref} variant="secondary">
				New feature
			</Button>
			<Coachmark
				key={key}
				anchorRef={ref}
				title="Try the new export"
				desc="Click here to export your data in CSV or PDF format."
			/>
			<Button
				variant="ghost"
				size="sm"
				style={{ marginTop: 8, alignSelf: "flex-end" }}
				onClick={() => setKey((k) => k + 1)}
			>
				Show again
			</Button>
		</div>
	);
}

export const Default: Story = {
	render: () => <SingleHint />,
};

// ─── Multi-step ───────────────────────────────────────────────────────────────

function MultiStep() {
	const ref = useRef<HTMLButtonElement>(null);
	const [step, setStep] = useState(1);
	const [key, setKey] = useState(0);
	const total = 3;

	const titles = ["Welcome", "Explore features", "You're all set"];
	const descs = [
		"This is your main dashboard. Everything starts here.",
		"Use the sidebar to navigate between sections.",
		"You can revisit this tour from the Help menu.",
	];

	function reset() {
		setStep(1);
		setKey((k) => k + 1);
	}

	return (
		<div
			style={{
				padding: 48,
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				gap: 12,
			}}
		>
			<Button ref={ref} variant="primary">
				Start tour
			</Button>
			<Coachmark
				key={key}
				anchorRef={ref}
				title={titles[step - 1] ?? ""}
				desc={descs[step - 1]}
				step={step}
				total={total}
				onNext={() => setStep((s) => Math.min(s + 1, total))}
				onDone={reset}
			/>
			<Button
				variant="ghost"
				size="sm"
				style={{ marginTop: 8, alignSelf: "flex-end" }}
				onClick={reset}
			>
				Show again
			</Button>
		</div>
	);
}

export const MultiStepStory: Story = {
	name: "Multi-step",
	render: () => <MultiStep />,
};

// ─── Dark mode ────────────────────────────────────────────────────────────────

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
	render: () => <SingleHint />,
};
