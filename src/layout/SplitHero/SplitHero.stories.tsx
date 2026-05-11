import type { Meta, StoryObj } from "@storybook/react";
import { SplitHero } from ".";
import { DotGrid } from "../../foundation/DotGrid";
import { Eyebrow } from "../../foundation/Eyebrow";
import { Heading } from "../../foundation/Heading";
import { Text } from "../../foundation/Text";
import { Button } from "../../inputs/Button";
import { TextInput } from "../../inputs/TextInput";

const meta: Meta<typeof SplitHero> = {
	title: "Layout/SplitHero",
	component: SplitHero,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Two-column page chrome for marketing / auth / onboarding surfaces. Aside | main on desktop; stacked on tablet (≤ `stackBelow`); aside hidden on mobile (≤ `hideAsideBelow`).",
			},
		},
	},
	argTypes: {
		ratio: { control: "text" },
		stackBelow: { control: "number" },
		hideAsideBelow: { control: "number" },
		asideBackground: { control: "color" },
		mainBackground: { control: "color" },
		aside: { control: false },
		main: { control: false },
		className: { control: false },
		style: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof SplitHero>;

const Aside = () => (
	<div
		style={{
			position: "relative",
			padding: 48,
			color: "var(--cream)",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			gap: 16,
			flex: 1,
		}}
	>
		<DotGrid />
		<div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
			<Eyebrow tone="amber">WELCOME BACK</Eyebrow>
			<Heading level={1} size="3xl" weight="black" color="var(--cream)">
				Sign in to your trail.
			</Heading>
			<Text tone="ink-4" maxWidth={360}>
				Pick up your job search exactly where you left off.
			</Text>
		</div>
	</div>
);

const Main = () => (
	<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
		<Heading level={2} size="2xl" weight="bold">
			Welcome back
		</Heading>
		<TextInput label="Email" placeholder="you@example.com" />
		<TextInput label="Password" type="password" />
		<Button variant="primary" size="lg">
			Sign in
		</Button>
	</div>
);

export const Default: Story = {
	args: { aside: <Aside />, main: <Main /> },
};

export const NarrowAside: Story = {
	args: { aside: <Aside />, main: <Main />, ratio: "0.85fr 1fr" },
};
