/**
 * # Usage Audit — CopyToClipboard (DS-87, DS-55, D-531)
 *
 * Consumers (post v2.1):
 * - settings/ApiKeyRow — value=user's API key (displayed redacted), onCopy fires app-level toast
 * - integrations/WebhookUrl — value=webhook callback URL
 * - billing/InvoiceId — value=invoice number for receipt lookup
 *
 * API:
 * - value (required): string to write to clipboard
 * - label?: visible text override (default = value)
 * - onCopy?: fires after successful clipboard.writeText
 * - onError?: fires on clipboard failure (insecure context, denied, unsupported)
 *
 * Behavior (D-531):
 * - On success: icon swaps Copy→Check (var(--green)) for 2000ms, then reverts
 * - On failure: console.warn(err) + icon stays Copy + onError?.(err) called
 * - NO internal Toast dep — consumer wires their own toast in onCopy / onError
 */
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { CopyToClipboard } from "./CopyToClipboard";

const SRC = {
	Default: `<CopyToClipboard value="sk_live_xxxxxxxxxxxx" />`,
	WithLabel: `<CopyToClipboard
  value="sk_live_51HqLfKJdGpTbRz9YxN8mWvVcA0bC2dE3fG4hI5jK6lM7nO8pQ9rS"
  label="Copy API key"
/>`,
	CopiedLabel: `// Label swaps to "Copied!" for 2 s after a successful click
<CopyToClipboard
  value="sk_live_xxxxxxxxxxxx"
  copiedLabel="Copied!"
/>`,
	ErrorFallback: `<CopyToClipboard
  value="sk_live_will_fail"
  onError={(err) => console.warn("[onError]", err.message)}
/>`,
	Playground: `<CopyToClipboard value="playground_value_123" label="Click me" copiedLabel="Copied!" />`,
	DarkMode: `<CopyToClipboard value="sk_live_dark_xxxxxxxxxxxx" copiedLabel="Copied!" />`,
};

const meta: Meta<typeof CopyToClipboard> = {
	title: "Compound/CopyToClipboard",
	component: CopyToClipboard,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Inline value display with a copy-to-clipboard button that flips to a check icon for 2 seconds on success.",
			},
		},
	},
	argTypes: {
		value: { control: "text", description: "The string written to the clipboard on click." },
		label: {
			control: "text",
			description: "Visible button text; falls back to `value` when omitted.",
		},
		copiedLabel: {
			control: "text",
			description:
				"Text shown in place of `label` for 2 s after a successful copy. Omit to keep the original label.",
		},
		onCopy: { control: false, description: "Called after a successful clipboard write." },
		onError: { control: false, description: "Called when the clipboard API fails." },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof CopyToClipboard>;

export const Default: Story = {
	args: {
		value: "sk_live_xxxxxxxxxxxx",
	},
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const WithLabel: Story = {
	args: {
		value: "sk_live_51HqLfKJdGpTbRz9YxN8mWvVcA0bC2dE3fG4hI5jK6lM7nO8pQ9rS",
		label: "Copy API key",
	},
	parameters: {
		docs: {
			description: {
				story: "Custom `label` hides the raw value — useful for long or sensitive strings.",
			},
			source: { code: SRC.WithLabel },
		},
	},
};

export const WithCopiedLabel: Story = {
	name: "Copied label feedback",
	args: {
		value: "sk_live_xxxxxxxxxxxx",
		copiedLabel: "Copied!",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Pass `copiedLabel` to swap the button text for 2 s after copying — the clearest feedback when button space allows.",
			},
			source: { code: SRC.CopiedLabel },
		},
	},
};

/**
 * Demonstrates D-531 silent fallback. Clipboard mock rejects so onError fires
 * + console.warn logged + icon stays Copy. NO internal toast.
 */
export const ErrorFallback: Story = {
	parameters: { docs: { source: { code: SRC.ErrorFallback } } },
	render: (args) => {
		useEffect(() => {
			const original = navigator.clipboard;
			Object.defineProperty(navigator, "clipboard", {
				value: { writeText: () => Promise.reject(new Error("Permission denied (mock)")) },
				configurable: true,
				writable: true,
			});
			return () => {
				Object.defineProperty(navigator, "clipboard", {
					value: original,
					configurable: true,
					writable: true,
				});
			};
		}, []);
		return (
			<CopyToClipboard
				{...args}
				value="sk_live_will_fail"
				onError={(err) => console.warn("[story onError]", err.message)}
			/>
		);
	},
};

export const Playground: Story = {
	args: {
		value: "playground_value_123",
		label: "Click me",
	},
	parameters: { docs: { source: { code: SRC.Playground } } },
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
	args: {
		value: "sk_live_dark_xxxxxxxxxxxx",
	},
};
