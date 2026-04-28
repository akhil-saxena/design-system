/**
 * # Usage Audit — Autocomplete
 *
 * **Requirement:** DS-52 — Generic combobox with empty-focus recents and
 * "+ Add `[query]` as new" flow per D-521.
 *
 * **API (D-521 verbatim):**
 * ```tsx
 * type AutocompleteProps<T> = {
 *   value: string;
 *   onValueChange: (q: string) => void;
 *   items: T[];
 *   recentItems?: T[];
 *   onSelect: (item: T) => void;
 *   onCreate?: (query: string) => void;
 *   getItemLabel: (item: T) => string;
 *   getItemKey: (item: T) => string;
 *   renderItem?: (item: T, isActive: boolean) => ReactNode;
 *   placeholder?: string;
 * };
 * ```
 *
 * **When to use:**
 * - User needs to search a known dataset and select an item.
 * - You want to surface recents on empty focus (e.g. recent companies).
 * - You want an inline create-as-new flow when the query has zero matches.
 *
 * **Composition contract:**
 * - Filtering is consumer-controlled — caller filters `items` before passing.
 * - Recents are consumer-provided via `recentItems?` — no internal storage.
 * - Create-as-new is opt-in via `onCreate?`. Without it, "No results" shows.
 * - Trigger is a real `<input>` (not a button), so the keyboard model is
 *   typing-first; ArrowDown/Enter still drive listbox navigation through
 *   DSDropdown's keyboard layer.
 *
 * **A11y per D-501:** `role="combobox"`, `aria-autocomplete="list"`,
 * `aria-expanded`, `aria-controls={listId}` on the input. Listbox uses
 * `<ul role="listbox">` + `<li role="option">` items. Create button is a
 * plain `<button>` outside the listbox (NOT `role=option`).
 *
 * **Out of scope (deferred):**
 * - Internal localStorage recents (rejected for v2.0 per D-521).
 * - Async loading (`loading?` prop) — v2.1 if needed.
 * - Visual baselines — captured in 16-09 closeout.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Autocomplete } from "./Autocomplete";
import { Avatar } from "./Avatar";

type Company = { id: string; name: string };

const COMPANIES: Company[] = [
	{ id: "1", name: "Stripe" },
	{ id: "2", name: "Automattic" },
	{ id: "3", name: "Supabase" },
	{ id: "4", name: "Linear" },
	{ id: "5", name: "Vercel" },
	{ id: "6", name: "Cloudflare" },
];

function filter(items: Company[], q: string) {
	if (!q.trim()) return items;
	const lower = q.toLowerCase();
	return items.filter((c) => c.name.toLowerCase().includes(lower));
}

function CompanyPicker(props: {
	recents?: Company[];
	withOnCreate?: boolean;
	customRender?: boolean;
	pool?: Company[];
}) {
	const [value, setValue] = useState("");
	const pool = props.pool ?? COMPANIES;
	const items = filter(pool, value);
	return (
		<div style={{ width: 320 }}>
			<Autocomplete<Company>
				value={value}
				onValueChange={setValue}
				items={items}
				recentItems={props.recents}
				onSelect={(c) => setValue(c.name)}
				onCreate={props.withOnCreate ? (q) => alert(`Create: ${q}`) : undefined}
				getItemLabel={(c) => c.name}
				getItemKey={(c) => c.id}
				renderItem={
					props.customRender
						? (c, isActive) => (
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										gap: 8,
										fontWeight: isActive ? 600 : 400,
									}}
								>
									<Avatar name={c.name} size="xs" />
									<span>{c.name}</span>
								</span>
							)
						: undefined
				}
				placeholder="Search companies…"
			/>
		</div>
	);
}

const meta: Meta<typeof CompanyPicker> = {
	title: "Compound/Autocomplete",
	component: CompanyPicker,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof CompanyPicker>;

export const Default: Story = {
	render: () => <CompanyPicker />,
};

export const WithRecents: Story = {
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[2], COMPANIES[3]]} />,
};

export const WithOnCreate: Story = {
	render: () => <CompanyPicker withOnCreate />,
};

export const NoResults: Story = {
	render: () => {
		// No onCreate → "No results"
		function Inner() {
			const [value, setValue] = useState("zzzz");
			const items = filter(COMPANIES, value);
			return (
				<div style={{ width: 320 }}>
					<Autocomplete<Company>
						value={value}
						onValueChange={setValue}
						items={items}
						onSelect={(c) => setValue(c.name)}
						getItemLabel={(c) => c.name}
						getItemKey={(c) => c.id}
						placeholder="Search companies…"
					/>
				</div>
			);
		}
		return <Inner />;
	},
};

export const CustomRenderItem: Story = {
	render: () => <CompanyPicker customRender />,
};

export const Playground: Story = {
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[1]]} withOnCreate customRender />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[2]]} withOnCreate />,
};
