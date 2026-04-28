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

const meta: Meta<typeof CopyToClipboard> = {
	title: "Compound/CopyToClipboard",
	component: CopyToClipboard,
	parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CopyToClipboard>;

export const Default: Story = {
	args: {
		value: "sk_live_xxxxxxxxxxxx",
	},
};

export const WithLabel: Story = {
	args: {
		value: "sk_live_51HqLfKJdGpTbRz9YxN8mWvVcA0bC2dE3fG4hI5jK6lM7nO8pQ9rS",
		label: "Copy API key",
	},
};

/**
 * Demonstrates D-531 silent fallback. Clipboard mock rejects so onError fires
 * + console.warn logged + icon stays Copy. NO internal toast.
 */
export const ErrorFallback: Story = {
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
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	args: {
		value: "sk_live_dark_xxxxxxxxxxxx",
	},
};
