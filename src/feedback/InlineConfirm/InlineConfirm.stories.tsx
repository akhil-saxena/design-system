import type { Meta, StoryObj } from "@storybook/react";
import { Trash } from "lucide-react";
import { InlineConfirm } from ".";
import { Button } from "../../inputs/Button";
const meta: Meta<typeof InlineConfirm> = {
	title: "Feedback/InlineConfirm",
	component: InlineConfirm,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Render-prop trigger replacement for **low-stakes inline destructives** (delete comment, remove tag, discard draft). Click the trigger → prompt row appears in-place with a 4 s auto-cancel. For high-stakes actions (delete account, mass-delete) use `ConfirmDialog` instead.",
			},
		},
	},
	argTypes: {
		trigger: { control: false },
		onConfirm: { control: false },
		onCancel: { control: false },
		confirmLabel: { control: "text" },
		cancelLabel: { control: "text" },
		confirmVariant: { control: "select", options: ["danger", "primary"] },
		autoCancelMs: { control: "number" },
		promptText: { control: "text" },
	},
};

export default meta;
type Story = StoryObj<typeof InlineConfirm>;

const SRC = {
	default: `<InlineConfirm
  trigger={(p) => (
    <Button variant="ghost" icon={<Trash size={14} />} {...p}>
      Delete
    </Button>
  )}
  onConfirm={handleDelete}
  promptText="Delete this item?"
/>`,

	danger: `<InlineConfirm
  trigger={(p) => <Button variant="danger" {...p}>Remove tag</Button>}
  onConfirm={handleRemove}
  confirmVariant="danger"
  promptText="Remove this tag?"
/>`,

	primary: `<InlineConfirm
  trigger={(p) => <Button variant="primary" {...p}>Send</Button>}
  onConfirm={handleSend}
  confirmVariant="primary"
  confirmLabel="Send now"
  cancelLabel="Wait"
  promptText="Send the email?"
/>`,

	labels: `<InlineConfirm
  trigger={(p) => <Button {...p}>Discard draft</Button>}
  onConfirm={handleDiscard}
  confirmLabel="Discard"
  cancelLabel="Keep"
  promptText="Discard your unsaved changes?"
/>`,

	autoCancel: `// 10 s timeout (default is 4000 ms)
<InlineConfirm
  trigger={(p) => <Button variant="ghost" {...p}>Click me</Button>}
  onConfirm={onConfirm}
  autoCancelMs={10000}
  promptText="10 s to decide"
/>`,

	noAutoCancel: `// Persists until the user explicitly cancels or confirms
<InlineConfirm
  trigger={(p) => <Button {...p}>Click me</Button>}
  onConfirm={onConfirm}
  autoCancelMs={Infinity}
  promptText="Persists until explicit cancel/confirm"
/>`,

	inList: `{items.map((item) => (
  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--rule)", borderRadius: 8 }}>
    <span style={{ flex: 1, fontWeight: 600 }}>{item}</span>
    <InlineConfirm
      trigger={(p) => (
        <Button size="xs" variant="ghost" icon={<Trash size={12} />} {...p}>
          Delete
        </Button>
      )}
      onConfirm={() => handleDelete(item)}
      promptText="Delete?"
    />
  </div>
))}`,
};

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: "Ghost trigger with trash icon. Click to reveal the 4 s auto-cancelling prompt row.",
			},
			source: { code: SRC.default },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" icon={<Trash size={14} />} {...p}>
					Delete
				</Button>
			)}
			onConfirm={() => {
				console.log("confirmed");
			}}
			promptText="Delete this item?"
		/>
	),
};

export const DangerVariant: Story = {
	name: "Confirm variant - danger",
	parameters: {
		docs: {
			description: {
				story: "Red confirm button. Use for destructive actions like delete or remove.",
			},
			source: { code: SRC.danger },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="danger" {...p}>
					Remove tag
				</Button>
			)}
			onConfirm={() => {}}
			confirmVariant="danger"
			promptText="Remove this tag?"
		/>
	),
};

export const PrimaryVariant: Story = {
	name: "Confirm variant - primary",
	parameters: {
		docs: {
			description: {
				story: "Amber confirm button. Use for non-destructive confirms like Send or Submit.",
			},
			source: { code: SRC.primary },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="primary" {...p}>
					Send
				</Button>
			)}
			onConfirm={() => {}}
			confirmVariant="primary"
			confirmLabel="Send now"
			cancelLabel="Wait"
			promptText="Send the email?"
		/>
	),
};

export const CustomLabels: Story = {
	name: "Custom labels",
	parameters: {
		docs: {
			description: { story: "Override confirm and cancel labels to match the action context." },
			source: { code: SRC.labels },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => <Button {...p}>Discard draft</Button>}
			onConfirm={() => {}}
			confirmLabel="Discard"
			cancelLabel="Keep"
			promptText="Discard your unsaved changes?"
		/>
	),
};

export const CustomAutoCancel: Story = {
	name: "Custom auto-cancel (10 s)",
	parameters: {
		docs: {
			description: {
				story: "Extend the auto-cancel timeout. Hover or focus inside the prompt pauses the timer.",
			},
			source: { code: SRC.autoCancel },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" {...p}>
					Click me (10s timeout)
				</Button>
			)}
			onConfirm={() => {}}
			autoCancelMs={10000}
			promptText="10s to decide"
		/>
	),
};

export const DisabledAutoCancel: Story = {
	name: "No auto-cancel",
	parameters: {
		docs: {
			description: {
				story:
					"Pass `autoCancelMs={Infinity}` to disable the timer - prompt stays until explicitly resolved.",
			},
			source: { code: SRC.noAutoCancel },
		},
	},
	render: () => (
		<InlineConfirm
			trigger={(p) => <Button {...p}>Click me (no timeout)</Button>}
			onConfirm={() => {}}
			autoCancelMs={Number.POSITIVE_INFINITY}
			promptText="Persists until explicit cancel/confirm"
		/>
	),
};

export const InListContext: Story = {
	name: "In-list context",
	parameters: {
		docs: {
			description: {
				story:
					"Typical usage - one InlineConfirm per row. The prompt expands in-place with zero layout shift.",
			},
			source: { code: SRC.inList },
		},
	},
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
			{["Stripe", "Linear", "Anthropic"].map((name) => (
				<div
					key={name}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						padding: "10px 12px",
						border: "1px solid var(--rule)",
						borderRadius: "var(--radius-md)",
						background: "var(--surf-1)",
					}}
				>
					<span
						style={{
							flex: 1,
							fontFamily: "var(--display)",
							fontWeight: 600,
							fontSize: 13,
						}}
					>
						{name}
					</span>
					<InlineConfirm
						trigger={(p) => (
							<Button size="xs" variant="ghost" icon={<Trash size={12} />} {...p}>
								Delete
							</Button>
						)}
						onConfirm={() => {}}
						promptText="Delete?"
					/>
				</div>
			))}
		</div>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	parameters: {
		docs: {
			description: { story: "Prompt text and buttons follow dark tokens automatically." },
			source: { code: SRC.default },
		},
	},
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
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
		<InlineConfirm
			trigger={(p) => (
				<Button variant="ghost" icon={<Trash size={14} />} {...p}>
					Delete (dark)
				</Button>
			)}
			onConfirm={() => {}}
			promptText="Delete this item?"
		/>
	),
};
