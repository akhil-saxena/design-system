import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterNav } from ".";
import { SegmentedControl } from "../SegmentedControl";

const CATEGORIES = [
	{ href: "/photos", label: "All" },
	{ href: "/photos/street", label: "Street" },
	{ href: "/photos/landscape", label: "Landscape" },
	{ href: "/photos/portrait", label: "Portrait" },
];

const meta: Meta<typeof FilterNav> = {
	title: "Data Display/FilterNav",
	component: FilterNav,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					'A category filter that is a real link list: `<nav aria-label>` containing `<a href>` elements, with `aria-current="page"` on the current one. The anchor sibling of `SegmentedControl` (G-9) — it reuses that component\'s CSS classes so the two are visually identical, but it is a nav/link-list ARIA pattern rather than a radiogroup, holds no state, and ships **zero JS**. Use it for prerendered category routes that must be crawlable and Back-button-capable; use `SegmentedControl` for an in-page toggle.',
			},
		},
	},
	args: { items: CATEGORIES, activeHref: "/photos/street", ariaLabel: "Photo categories" },
	argTypes: {
		activeHref: {
			control: "select",
			options: CATEGORIES.map((c) => c.href),
			description: 'Which item gets aria-current="page". Derive it from the URL.',
		},
		size: { control: "inline-radio", options: ["sm", "md", "lg"] },
		items: { control: false },
		className: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof FilterNav>;

export const Default: Story = {};

/**
 * The three labels are deliberately different, and that is a usage note rather
 * than story housekeeping: `test:a11y` failed this story with `landmark-unique`
 * when all three navs shared `aria-label="Photo categories"`. Two navigation
 * landmarks with the same accessible name are indistinguishable in a screen
 * reader's landmark list, so a page with more than one FilterNav needs a distinct
 * `ariaLabel` for each.
 */
export const Sizes: Story = {
	render: (args) => (
		<div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
			<FilterNav {...args} size="sm" ariaLabel="Photo categories, small" />
			<FilterNav {...args} size="md" ariaLabel="Photo categories, medium" />
			<FilterNav {...args} size="lg" ariaLabel="Photo categories, large" />
		</div>
	),
};

/**
 * The parity check, as a story.
 *
 * The two must be indistinguishable in the same brand and mode — that is what
 * "shares SegmentedControl's CSS classes for visual parity" means, and it is why
 * `FilterNav` reuses those classes instead of copying their declarations.
 * `tests/visual/filternav-parity.spec.ts` asserts it on computed background,
 * border, padding, font and height rather than by eye, because "looks the same"
 * is only a requirement if something can fail it.
 *
 * What differs is everything a screen reader and a crawler see: a `<nav>` of
 * anchors with `aria-current="page"` above, a `role="radiogroup"` of
 * `role="radio"` buttons with `aria-checked` below.
 */
export const BesideSegmentedControl: Story = {
	parameters: { layout: "padded" },
	render: (args) => {
		const [value, setValue] = useState("street");
		return (
			<div style={{ display: "grid", gap: 24, justifyItems: "start" }}>
				<div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
					<code style={{ fontFamily: "var(--mono)", fontSize: 11, opacity: 0.7 }}>
						FilterNav — nav / a href / aria-current, zero JS
					</code>
					<FilterNav {...args} />
				</div>
				<div style={{ display: "grid", gap: 6, justifyItems: "start" }}>
					<code style={{ fontFamily: "var(--mono)", fontSize: 11, opacity: 0.7 }}>
						SegmentedControl — radiogroup / radio / aria-checked, controlled
					</code>
					<SegmentedControl
						ariaLabel="Photo categories toggle"
						value={value}
						onChange={setValue}
						options={[
							{ value: "all", label: "All" },
							{ value: "street", label: "Street" },
							{ value: "landscape", label: "Landscape" },
							{ value: "portrait", label: "Portrait" },
						]}
					/>
				</div>
			</div>
		);
	},
};

/**
 * T-18-01. A consumer-supplied `href` is an elevation-of-privilege vector:
 * React does not block `javascript:` in `href`, so an unfiltered value would
 * execute on click. Only in-app shapes (`/`, `#`, `.`) become anchors; a
 * protocol-relative `//host`, an absolute URL and a leading-whitespace smuggle
 * all render as plain text. The category is still named — it just is not
 * clickable, which beats a live hostile URL.
 */
export const RejectedHrefs: Story = {
	args: {
		items: [
			{ href: "/photos", label: "All" },
			{ href: "//evil.example.com/photos", label: "Protocol relative" },
			{ href: "https://evil.example.com", label: "Absolute" },
			{ href: "/photos/street", label: "Street" },
		],
		activeHref: "/photos",
	},
};
