import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from "./Table";
import { useSortableTable } from "./hooks/useSortableTable";

// ── Sample data ───────────────────────────────────────────────────────────────

type User = { id: number; name: string; role: string; joinDate: string };

const users: User[] = [
	{ id: 1, name: "Alice Martin", role: "Engineer", joinDate: "2022-03-15" },
	{ id: 2, name: "Bob Chen", role: "Designer", joinDate: "2021-11-01" },
	{ id: 3, name: "Carol Davis", role: "Product", joinDate: "2023-01-20" },
	{ id: 4, name: "David Kim", role: "Engineer", joinDate: "2020-08-05" },
	{ id: 5, name: "Eva Lopez", role: "Marketing", joinDate: "2022-07-12" },
];

// ── Controlled sortable table wrapper ─────────────────────────────────────────

function SortableTable({
	density,
	sticky,
}: {
	density?: "cozy" | "comfortable" | "spacious";
	sticky?: boolean;
}) {
	const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(users, {
		defaultCol: "name",
	});

	const cellDir = (col: keyof User) => (sortCol === col ? sortDir : null);

	return (
		<div style={sticky ? { maxHeight: "200px", overflowY: "auto" } : undefined}>
			<Table.Root density={density} sticky={sticky} ariaLabel="User list">
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("name")}
							onToggleSort={() => toggleSort("name")}
						>
							Name
						</Table.HeaderCell>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("role")}
							onToggleSort={() => toggleSort("role")}
						>
							Role
						</Table.HeaderCell>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("joinDate")}
							onToggleSort={() => toggleSort("joinDate")}
						>
							Join Date
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{sorted.map((u) => (
						<Table.Row key={u.id}>
							<Table.Cell>{u.name}</Table.Cell>
							<Table.Cell>{u.role}</Table.Cell>
							<Table.Cell>{u.joinDate}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</div>
	);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Table.Root> = {
	title: "Primitives/Table",
	component: Table.Root,
	parameters: {
		layout: "padded",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table.Root>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Default table with sortable columns. Click any header to sort. */
export const Default: Story = {
	render: () => <SortableTable />,
};

/** Cozy density — 32px row height, tight padding. */
export const DensityCozy: Story = {
	render: () => <SortableTable density="cozy" />,
};

/** Comfortable density — 40px row height (default). */
export const DensityComfortable: Story = {
	render: () => <SortableTable density="comfortable" />,
};

/** Spacious density — 48px row height, generous padding. */
export const DensitySpacious: Story = {
	render: () => <SortableTable density="spacious" />,
};

/** Sticky header — scroll the container and the header stays pinned. */
export const StickyHeader: Story = {
	render: () => <SortableTable sticky />,
};

/** Table without sortable headers — plain chrome. */
export const NoSort: Story = {
	render: () => (
		<Table.Root ariaLabel="Static user list">
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Role</Table.HeaderCell>
					<Table.HeaderCell>Join Date</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{users.map((u) => (
					<Table.Row key={u.id}>
						<Table.Cell>{u.name}</Table.Cell>
						<Table.Cell>{u.role}</Table.Cell>
						<Table.Cell>{u.joinDate}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	),
};

/** Dark mode — verified against v0.5.6 token fixes. */
export const DarkMode: Story = {
	render: () => <SortableTable />,
	parameters: {
		backgrounds: { default: "dark" },
		themes: { default: "dark" },
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "var(--surface-1, #1a1a1a)", padding: "16px" }}>
				<Story />
			</div>
		),
	],
};

/** Playground — all props controllable via Storybook controls. */
export const Playground: Story = {
	render: (args) => {
		const [sortCol, setSortCol] = useState<keyof User | null>(null);
		const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

		function toggleSort(col: keyof User) {
			if (sortCol === col) {
				setSortDir((d) => (d === "asc" ? "desc" : "asc"));
			} else {
				setSortCol(col);
				setSortDir("asc");
			}
		}

		const sorted = [...users].sort((a, b) => {
			if (!sortCol) return 0;
			const av = a[sortCol];
			const bv = b[sortCol];
			const cmp = av < bv ? -1 : av > bv ? 1 : 0;
			return sortDir === "asc" ? cmp : -cmp;
		});

		const cellDir = (col: keyof User) => (sortCol === col ? sortDir : null);

		return (
			<Table.Root
				density={args.density ?? "comfortable"}
				sticky={args.sticky}
				ariaLabel="Playground table"
			>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("name")}
							onToggleSort={() => toggleSort("name")}
						>
							Name
						</Table.HeaderCell>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("role")}
							onToggleSort={() => toggleSort("role")}
						>
							Role
						</Table.HeaderCell>
						<Table.HeaderCell
							sortable
							sortDir={cellDir("joinDate")}
							onToggleSort={() => toggleSort("joinDate")}
						>
							Join Date
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{sorted.map((u) => (
						<Table.Row key={u.id}>
							<Table.Cell>{u.name}</Table.Cell>
							<Table.Cell>{u.role}</Table.Cell>
							<Table.Cell>{u.joinDate}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		);
	},
	argTypes: {
		density: {
			control: { type: "select" },
			options: ["cozy", "comfortable", "spacious"],
		},
		sticky: { control: "boolean" },
	},
};
