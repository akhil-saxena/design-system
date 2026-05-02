import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
	title: "Primitives/Accordion",
	component: Accordion,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Disclosure accordion using the WAI-ARIA pattern (`<button aria-expanded>` inside a heading). Supports `single` (one open at a time) and `multi` (independent) modes. Controlled via `openIds` + `onOpenIdsChange`, or uncontrolled via `defaultOpenIds`.",
			},
		},
	},
	argTypes: {
		mode: {
			control: "select",
			options: ["single", "multi"],
			description:
				"Whether only one item can be open at a time (`single`) or items toggle independently (`multi`).",
		},
		defaultOpenIds: { control: false, description: "Uncontrolled: IDs open on first render." },
		openIds: { control: false, description: "Controlled open state. Use with `onOpenIdsChange`." },
		onOpenIdsChange: { control: false },
		className: { control: "text", description: "Extra CSS class on the root element." },
		style: { control: false, description: "Inline style on the root element." },
		children: { control: false },
	},
};
export default meta;

type Story = StoryObj<typeof Accordion>;

const ITEMS = [
	{
		id: "item-1",
		q: "How does the design system track components?",
		a: "Each component is assigned a DS ticket (e.g. DS-64) and governed by a PLAN.md that describes its API, ARIA pattern, and test requirements.",
	},
	{
		id: "item-2",
		q: "Can I use custom heading levels?",
		a: "Yes. Pass headingLevel={2} through headingLevel={6} to each Accordion.Item to match the surrounding document outline.",
	},
	{
		id: "item-3",
		q: "What is the WAI-ARIA disclosure pattern?",
		a: "Each trigger is a <button aria-expanded> inside a heading tag. The panel is a <div role='region' aria-labelledby>. This avoids the deprecated tablist anti-pattern.",
	},
	{
		id: "item-4",
		q: "Is reduced-motion supported?",
		a: "Yes. When the OS prefers reduced motion the chevron transition is disabled via a CSS data-attribute selector on the root element.",
	},
];

const itemsSource = (mode: string, extra = "") =>
	`<Accordion mode="${mode}"${extra}>
${ITEMS.map((i) => `  <Accordion.Item id="${i.id}" title="${i.q}">\n    ${i.a}\n  </Accordion.Item>`).join("\n")}
</Accordion>`;

const SOURCE = {
	single: itemsSource("single"),
	multi: itemsSource("multi"),

	controlled: `const [openIds, setOpenIds] = useState(["item-1"]);

<Accordion mode="multi" openIds={openIds} onOpenIdsChange={setOpenIds}>
${ITEMS.map((i) => `  <Accordion.Item id="${i.id}" title="${i.q}">\n    ${i.a}\n  </Accordion.Item>`).join("\n")}
</Accordion>`,

	headingLevel: `<Accordion mode="single">
${ITEMS.slice(0, 3)
	.map(
		(i) =>
			`  <Accordion.Item id="${i.id}" title="${i.q}" headingLevel={2}>\n    ${i.a}\n  </Accordion.Item>`,
	)
	.join("\n")}
</Accordion>`,

	disabled: `<Accordion mode="single">
  <Accordion.Item id="${ITEMS[0].id}" title="${ITEMS[0].q}">
    ${ITEMS[0].a}
  </Accordion.Item>
  <Accordion.Item id="item-disabled" title="This item is disabled" disabled>
    You cannot see this content because the item is disabled.
  </Accordion.Item>
  <Accordion.Item id="${ITEMS[2].id}" title="${ITEMS[2].q}">
    ${ITEMS[2].a}
  </Accordion.Item>
</Accordion>`,
};

export const Single: Story = {
	name: "Single — one open at a time",
	parameters: {
		docs: {
			description: { story: "Default mode. Opening one item closes the previously open item." },
			source: { code: SOURCE.single },
		},
	},
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const Multi: Story = {
	name: "Multi — independent toggle",
	parameters: {
		docs: {
			description: {
				story: "Each item toggles independently — multiple items can be open simultaneously.",
			},
			source: { code: SOURCE.multi },
		},
	},
	render: () => (
		<Accordion mode="multi" style={{ maxWidth: 560 }}>
			{ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const Controlled: Story = {
	name: "Controlled",
	parameters: {
		docs: {
			description: { story: "Parent owns the open state via `openIds` + `onOpenIdsChange`." },
			source: { code: SOURCE.controlled },
		},
	},
	render: function ControlledStory() {
		const [openIds, setOpenIds] = useState<string[]>(["item-1"]);
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
					{ITEMS.map((item) => (
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
	name: "Custom heading level",
	parameters: {
		docs: {
			description: {
				story: "Pass `headingLevel` (2–6) per item to match the surrounding document outline.",
			},
			source: { code: SOURCE.headingLevel },
		},
	},
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{ITEMS.slice(0, 3).map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q} headingLevel={2}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const DisabledItem: Story = {
	name: "Disabled item",
	parameters: {
		docs: {
			description: {
				story:
					"A disabled item cannot be expanded — trigger is non-interactive and visually muted.",
			},
			source: { code: SOURCE.disabled },
		},
	},
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			<Accordion.Item id="item-1" title={ITEMS[0].q}>
				{ITEMS[0].a}
			</Accordion.Item>
			<Accordion.Item id="item-2" title="This item is disabled" disabled>
				You cannot see this content because the item is disabled.
			</Accordion.Item>
			<Accordion.Item id="item-3" title={ITEMS[2].q}>
				{ITEMS[2].a}
			</Accordion.Item>
		</Accordion>
	),
};

export const DarkMode: Story = {
	name: "Dark mode",
	globals: { backgrounds: { value: "#1c1917" } },
	parameters: {
		docs: {
			description: {
				story: "Accordion on the dark surface — borders, text, and chevron all follow dark tokens.",
			},
			source: { code: SOURCE.single },
		},
	},
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

export const ReducedMotion: Story = {
	name: "Reduced motion",
	parameters: {
		docs: {
			description: {
				story:
					"When the OS prefers reduced motion, the chevron rotation and panel transition are disabled instantly.",
			},
			source: { code: SOURCE.single },
		},
	},
	render: () => (
		<Accordion mode="single" style={{ maxWidth: 560 }}>
			{ITEMS.map((item) => (
				<Accordion.Item key={item.id} id={item.id} title={item.q}>
					{item.a}
				</Accordion.Item>
			))}
		</Accordion>
	),
};

type PlaygroundArgs = {
	mode: "single" | "multi";
	q1: string;
	a1: string;
	q2: string;
	a2: string;
	q3: string;
	a3: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
	args: {
		mode: "single",
		q1: "How does the design system track components?",
		a1: "Each component is assigned a DS ticket (e.g. DS-64) and governed by a PLAN.md that describes its API, ARIA pattern, and test requirements.",
		q2: "Can I use custom heading levels?",
		a2: "Yes. Pass headingLevel={2} through headingLevel={6} to match the surrounding document outline.",
		q3: "Is reduced-motion supported?",
		a3: "Yes. When the OS prefers reduced motion the chevron transition is removed via a CSS data-attribute selector.",
	},
	argTypes: {
		mode: { control: "select", options: ["single", "multi"], description: "Open mode." },
		q1: { control: "text", description: "Item 1 — title / question" },
		a1: { control: "text", description: "Item 1 — content / answer" },
		q2: { control: "text", description: "Item 2 — title / question" },
		a2: { control: "text", description: "Item 2 — content / answer" },
		q3: { control: "text", description: "Item 3 — title / question" },
		a3: { control: "text", description: "Item 3 — content / answer" },
	},
	parameters: {
		docs: {
			description: {
				story: "Edit any item's title or content, and toggle the open mode via the Controls panel.",
			},
			source: { code: SOURCE.single },
		},
	},
	render: (args) => (
		<Accordion mode={args.mode} style={{ maxWidth: 560 }}>
			<Accordion.Item id="p1" title={args.q1}>
				{args.a1}
			</Accordion.Item>
			<Accordion.Item id="p2" title={args.q2}>
				{args.a2}
			</Accordion.Item>
			<Accordion.Item id="p3" title={args.q3}>
				{args.a3}
			</Accordion.Item>
		</Accordion>
	),
};
