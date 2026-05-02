import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlertBanner } from "./AlertBanner";
import { Button } from "./Button";

const SRC = {
	Default: `<AlertBanner
  open
  tone="info"
  title="Heads up — verify your email"
  description="We sent a link to your inbox. Verify to enable backups."
/>`,
	Tones: `<AlertBanner open tone="info" title="Heads up" description="Informational message — calm and clear." />
<AlertBanner open tone="success" title="Saved as draft" description="Your changes are safe." />
<AlertBanner open tone="warning" title="Trial ends in 3 days" description="Upgrade now to keep your data." />
<AlertBanner open tone="error" title="Payment failed" description="Action required to maintain service." />`,
	WithDescription: `<AlertBanner
  open
  tone="warning"
  title="Almost out of space"
  description="You're using 9.2 GB of 10 GB. Free tier ends at 10 GB."
/>`,
	ChildrenSlot: `<AlertBanner open tone="error" title="API quota reached" onDismiss={() => {}}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span>Cloudflare D1 daily write quota hit. Upgrade to keep saving.</span>
    <Button size="xs" variant="primary">Upgrade</Button>
  </div>
</AlertBanner>`,
	Dismissible: `const [open, setOpen] = useState(true);
return (
  <div>
    <AlertBanner
      open={open}
      onDismiss={() => setOpen(false)}
      tone="info"
      title="You can dismiss this banner"
      description="Click the X to close. Re-open below."
    />
    {!open ? (
      <Button style={{ marginTop: 12 }} onClick={() => setOpen(true)}>
        Re-open banner
      </Button>
    ) : null}
  </div>
);`,
	NonDismissible: `<AlertBanner
  open
  tone="warning"
  title="Verify your email to enable backups"
  description="Until verified, your data is local-only."
/>`,
	Playground: `<AlertBanner
  open
  tone="info"
  title="Tweak via controls"
  description="Try the tone selector and toggle dismissible."
  onDismiss={() => {}}
/>`,
	DarkMode: `<AlertBanner open tone="info" title="Heads up" description="Tone bgs lift saturation in dark mode." />
<AlertBanner open tone="success" title="Saved" description="Visible against cream-2 dark surfaces." />
<AlertBanner open tone="warning" title="Almost full" description="amber-l token swaps for dark mode." />
<AlertBanner open tone="error" title="Failed" description="High-contrast destructive tone." />`,
};

const meta: Meta<typeof AlertBanner> = {
	title: "Feedback/AlertBanner",
	component: AlertBanner,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Inline-flow controlled tone banner with info, success, warning, and error variants; supports an optional dismiss button.",
			},
		},
	},
	args: { open: true },
	argTypes: {
		open: { control: "boolean", description: "Controls visibility; returns null when false." },
		tone: {
			control: "select",
			options: ["info", "success", "warning", "error"],
			description: "Visual tone variant for the banner.",
		},
		title: { control: false, description: "Required heading text (ReactNode)." },
		description: {
			control: "text",
			description: "Optional secondary body text beneath the title.",
		},
		children: { control: false, description: "Overrides description for advanced layouts." },
		dismissible: { control: "boolean", description: "Whether to show the dismiss X button." },
		onDismiss: { control: false, description: "Callback when the dismiss button is clicked." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Default: Story = {
	args: {
		tone: "info",
		title: "Heads up — verify your email",
		description: "We sent a link to your inbox. Verify to enable backups.",
	},
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const Tones: Story = {
	parameters: { docs: { source: { code: SRC.Tones } } },
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 540 }}>
			<AlertBanner
				open
				tone="info"
				title="Heads up"
				description="Informational message — calm and clear."
			/>
			<AlertBanner
				open
				tone="success"
				title="Saved as draft"
				description="Your changes are safe."
			/>
			<AlertBanner
				open
				tone="warning"
				title="Trial ends in 3 days"
				description="Upgrade now to keep your data."
			/>
			<AlertBanner
				open
				tone="error"
				title="Payment failed"
				description="Action required to maintain service."
			/>
		</div>
	),
};

export const WithDescription: Story = {
	args: {
		tone: "warning",
		title: "Almost out of space",
		description: "You're using 9.2 GB of 10 GB. Free tier ends at 10 GB.",
	},
	parameters: { docs: { source: { code: SRC.WithDescription } } },
};

export const ChildrenSlot: Story = {
	parameters: { docs: { source: { code: SRC.ChildrenSlot } } },
	render: () => (
		<AlertBanner open tone="error" title="API quota reached" onDismiss={() => {}}>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<span>Cloudflare D1 daily write quota hit. Upgrade to keep saving.</span>
				<Button size="xs" variant="primary">
					Upgrade
				</Button>
			</div>
		</AlertBanner>
	),
};

export const Dismissible: Story = {
	parameters: { docs: { source: { code: SRC.Dismissible } } },
	render: () => {
		function DismissibleDemo() {
			const [open, setOpen] = useState(true);
			return (
				<div>
					<AlertBanner
						open={open}
						onDismiss={() => setOpen(false)}
						tone="info"
						title="You can dismiss this banner"
						description="Click the X to close. Re-open below."
					/>
					{!open ? (
						<Button style={{ marginTop: 12 }} onClick={() => setOpen(true)}>
							Re-open banner
						</Button>
					) : null}
				</div>
			);
		}
		return <DismissibleDemo />;
	},
};

export const NonDismissible: Story = {
	args: {
		tone: "warning",
		title: "Verify your email to enable backups",
		description: "Until verified, your data is local-only.",
		// no onDismiss → no X button
	},
	parameters: { docs: { source: { code: SRC.NonDismissible } } },
};

export const Playground: Story = {
	args: {
		tone: "info",
		title: "Tweak via controls",
		description: "Try the tone selector and toggle dismissible.",
		onDismiss: () => {},
	},
	parameters: { docs: { source: { code: SRC.Playground } } },
	argTypes: {
		tone: { control: "select", options: ["info", "success", "warning", "error"] },
		open: { control: "boolean" },
		dismissible: { control: "boolean" },
	},
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 540 }}>
			<AlertBanner
				open
				tone="info"
				title="Heads up (dark)"
				description="Tone bgs lift saturation in dark mode."
			/>
			<AlertBanner
				open
				tone="success"
				title="Saved (dark)"
				description="Visible against cream-2 dark surfaces."
			/>
			<AlertBanner
				open
				tone="warning"
				title="Almost full (dark)"
				description="amber-l token swaps for dark mode."
			/>
			<AlertBanner
				open
				tone="error"
				title="Failed (dark)"
				description="High-contrast destructive tone."
			/>
		</div>
	),
};
