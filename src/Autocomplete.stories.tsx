import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Autocomplete } from "./Autocomplete";
import { Avatar } from "./Avatar";

const SRC = {
	Default: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    onSelect={(c) => setValue(c.name)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    placeholder="Search companies…"
  />
);`,
	WithRecents: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    recentItems={[COMPANIES[0], COMPANIES[2], COMPANIES[3]]}
    onSelect={(c) => setValue(c.name)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    placeholder="Search companies…"
  />
);`,
	WithOnCreate: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    onSelect={(c) => setValue(c.name)}
    onCreate={(q) => alert(\`Create: \${q}\`)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    placeholder="Search companies…"
  />
);`,
	NoResults: `const [value, setValue] = useState("zzzz");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    onSelect={(c) => setValue(c.name)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    placeholder="Search companies…"
  />
);`,
	CustomRenderItem: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    onSelect={(c) => setValue(c.name)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    renderItem={(c, isActive) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: isActive ? 600 : 400 }}>
        <Avatar name={c.name} size="xs" />
        <span>{c.name}</span>
      </span>
    )}
    placeholder="Search companies…"
  />
);`,
	Playground: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    recentItems={[COMPANIES[0], COMPANIES[1]]}
    onSelect={(c) => setValue(c.name)}
    onCreate={(q) => alert(\`Create: \${q}\`)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    renderItem={(c, isActive) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: isActive ? 600 : 400 }}>
        <Avatar name={c.name} size="xs" />
        <span>{c.name}</span>
      </span>
    )}
    placeholder="Search companies…"
  />
);`,
	DarkMode: `const [value, setValue] = useState("");
const items = filter(COMPANIES, value);
return (
  <Autocomplete
    value={value}
    onValueChange={setValue}
    items={items}
    recentItems={[COMPANIES[0], COMPANIES[2]]}
    onSelect={(c) => setValue(c.name)}
    onCreate={(q) => alert(\`Create: \${q}\`)}
    getItemLabel={(c) => c.name}
    getItemKey={(c) => c.id}
    placeholder="Search companies…"
  />
);`,
};

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
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Generic combobox primitive with consumer-filtered items, keyboard navigation, and optional multi-value selection.",
			},
		},
	},
	argTypes: {
		pool: {
			control: false,
			description: "Full list of items to search; consumer filters this before passing to `items`.",
			table: { type: { summary: "{ value: string; label: string }[]" } },
		},
		recents: {
			control: false,
			description:
				"Recently selected items shown at the top of the dropdown before the user types.",
			table: { type: { summary: "{ value: string; label: string }[]" } },
		},
		withOnCreate: {
			control: "boolean",
			description: "When true, shows a 'Create …' option when no results match the query.",
			table: { type: { summary: "boolean" } },
		},
		customRender: {
			control: "boolean",
			description: "When true, renders each item with a custom template (avatar + name).",
			table: { type: { summary: "boolean" } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof CompanyPicker>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <CompanyPicker />,
};

export const WithRecents: Story = {
	parameters: { docs: { source: { code: SRC.WithRecents } } },
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[2], COMPANIES[3]]} />,
};

export const WithOnCreate: Story = {
	parameters: { docs: { source: { code: SRC.WithOnCreate } } },
	render: () => <CompanyPicker withOnCreate />,
};

export const NoResults: Story = {
	parameters: { docs: { source: { code: SRC.NoResults } } },
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
	parameters: { docs: { source: { code: SRC.CustomRenderItem } } },
	render: () => <CompanyPicker customRender />,
};

export const Playground: Story = {
	parameters: { docs: { source: { code: SRC.Playground } } },
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[1]]} withOnCreate customRender />,
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
	render: () => <CompanyPicker recents={[COMPANIES[0], COMPANIES[2]]} withOnCreate />,
};
