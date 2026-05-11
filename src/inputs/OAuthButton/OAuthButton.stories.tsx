import type { Meta, StoryObj } from "@storybook/react";
import { OAuthButton } from ".";

const meta: Meta<typeof OAuthButton> = {
	title: "Inputs/OAuthButton",
	component: OAuthButton,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					'OAuth provider button (Google, GitHub, Apple). Matches DS Button geometry — 44px height, 9px radius — so it stacks cleanly with `<Button size="lg">` on auth/onboarding forms. Pass `dark` to invert for use over dark surfaces.',
			},
		},
	},
	args: { provider: "google" },
	argTypes: {
		provider: {
			control: "select",
			options: ["google", "github", "apple"],
			description: "OAuth provider — determines logo + default label.",
		},
		dark: {
			control: "boolean",
			description: "When true, renders inverted for dark surfaces.",
		},
		label: { control: "text", description: "Override the default label." },
		disabled: { control: "boolean" },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof OAuthButton>;

export const Default: Story = {};

export const AllProviders: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
			<OAuthButton provider="google" />
			<OAuthButton provider="github" />
			<OAuthButton provider="apple" />
		</div>
	),
};

export const CustomLabel: Story = {
	args: { provider: "google", label: "Sign in with Google" },
};

export const Disabled: Story = {
	args: { provider: "google", disabled: true },
};

export const Dark: Story = {
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{ background: "#1c1917", padding: 16, borderRadius: 8, width: 360 }}
			>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
			<OAuthButton provider="google" dark />
			<OAuthButton provider="github" dark />
			<OAuthButton provider="apple" dark />
		</div>
	),
};
