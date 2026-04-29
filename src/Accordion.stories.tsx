import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
	title: "Primitives/Accordion",
	component: Accordion,
	parameters: { layout: "padded" },
	tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Accordion>;

const FAQ_ITEMS = [
	{
		id: "faq-1",
		q: "How does the design system track components?",
		a: "Each component is assigned a DS ticket (e.g. DS-64) and governed by a PLAN.md file that describes its API, ARIA pattern, and test requirements.",
	},
	{
		id: "faq-2",
		q: "Can I use custom heading levels?",
		a: "Yes. Pass headingLevel={2} through headingLevel={6} to each Accordion.Item. This lets you match the surrounding document outline for correct accessibility.",
	},
	{
		id: "faq-3",
		q: "What is the WAI-ARIA disclosure pattern?",
		a: "Each trigger is a <button aria-expanded> wrapped in an <h*> tag. The panel is a <div role='region' aria-labelledby>. This avoids the deprecated tablist accordion anti-pattern.",
	},
	{
		id: "faq-4",
		q: "Is reduced-motion supported?",
		a: "Yes. When the OS prefers reduced motion, the chevron rotation transition is removed via a CSS data-attribute selector on the root element.",
	},
];

export const Single: Story = {
	name: "Single (default) — one open at a time",
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const Multi: Story = {
	name: "Multi — independent toggle",
	render: () => (
		<Accordion mode="multi" style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const Controlled: Story = {
	name: "Controlled — parent owns open state",
	render: function ControlledStory() {
		const [openIds, setOpenIds] = useState<string[]>(["faq-1"]);
		return (
			<div style={{ maxWidth: 560 }}>
				<p
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 12,
						marginBottom: 12,
						color: "var(--ink-2)",
					}}
				>
					openIds: [{openIds.join(", ")}]
				</p>
				<Accordion mode="multi" openIds={openIds} onOpenIdsChange={setOpenIds}>
					{FAQ_ITEMS.map((item) => (
						<Accordion.Item key={item.id} id={item.id} title={item.q}>
							{item.a}
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		);
	},
};

export const CustomHeadingLevel: Story = {
	name: "Custom heading level (h2)",
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.slice(0, 3).map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q} headingLevel={2}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const DisabledItem: Story = {
	name: "Disabled item",
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			<Accordion.Item id="faq-1" title={FAQ_ITEMS[0].q}>
				{FAQ_ITEMS[0].a}
			</Accordion.Item>
			<Accordion.Item id="faq-2" title="This item is disabled (cannot expand)" disabled>
				You cannot see this content because the item is disabled.
			</Accordion.Item>
			<Accordion.Item id="faq-3" title={FAQ_ITEMS[2].q}>
				{FAQ_ITEMS[2].a}
			</Accordion.Item>
		</Accordion>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	parameters: { backgrounds: { default: "dark" } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ padding: 24 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const ReducedMotion: Story = {
	name: "Reduced motion (no chevron transition)",
	decorators: [
		(Story) => (
			<div>
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-2)",
						marginBottom: 12,
						fontFamily: "var(--font-mono)",
					}}
				>
					Simulate reduced-motion OS preference to see transitions disabled.
				</p>
				<Story />
			</div>
		),
	],
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const Playground: Story = {
	args: {
		mode: "single",
	},
	render: (args) => (
		<Accordion {...args} style={{ maxWidth: 560 }}>
			{FAQ_ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};
