import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { CopyToClipboard } from "./CopyToClipboard";

const SRC = {
	Default: `<CopyToClipboard value="tok_live_xxxxxxxxxxxx" />`,
	WithLabel: `<CopyToClipboard
  value="tok_live_51HqLfKJdGpTbRz9YxN8mWvVcA0bC2dE3fG4hI5jK6lM7nO8pQ9rS"
  label="Copy token"
/>`,
	CopiedLabel: `// Label swaps to "Copied!" for 2 s after a successful click
<CopyToClipboard
  value="tok_live_xxxxxxxxxxxx"
  copiedLabel="Copied!"
/>`,
	ErrorFallback: `<CopyToClipboard
  value="tok_live_will_fail"
  onError={(err) => console.warn("[onError]", err.message)}
/>`,
	Playground: `<CopyToClipboard value="playground_value_123" label="Click me" copiedLabel="Copied!" />`,
	DarkMode: `<CopyToClipboard value="tok_live_dark_xxxxxxxxxxxx" copiedLabel="Copied!" />`,
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
		value: "tok_live_xxxxxxxxxxxx",
	},
	parameters: { docs: { source: { code: SRC.Default } } },
};

export const WithLabel: Story = {
	args: {
		value: "tok_live_51HqLfKJdGpTbRz9YxN8mWvVcA0bC2dE3fG4hI5jK6lM7nO8pQ9rS",
		label: "Copy token",
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
		value: "tok_live_xxxxxxxxxxxx",
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
function ErrorFallbackDemo() {
	useEffect(() => {
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: () => Promise.reject(new Error("Permission denied (mock)")) },
			configurable: true,
			writable: true,
		});
		// Patch execCommand via Object.defineProperty to avoid the deprecated-member TS warning.
		const originalExecCommand = Object.getOwnPropertyDescriptor(document, "execCommand");
		Object.defineProperty(document, "execCommand", {
			value: () => false,
			configurable: true,
			writable: true,
		});
		return () => {
			Object.defineProperty(navigator, "clipboard", {
				value: originalClipboard,
				configurable: true,
				writable: true,
			});
			if (originalExecCommand) {
				Object.defineProperty(document, "execCommand", originalExecCommand);
			}
		};
	}, []);
	return (
		<CopyToClipboard
			value="tok_live_will_fail"
			onError={(err) => console.warn("[story onError]", err.message)}
		/>
	);
}

export const ErrorFallback: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Both clipboard paths are mocked to fail so `onError` fires — icon stays as Copy, no feedback shown.",
			},
			source: { code: SRC.ErrorFallback },
		},
	},
	render: () => <ErrorFallbackDemo />,
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
		value: "tok_live_dark_xxxxxxxxxxxx",
	},
};
