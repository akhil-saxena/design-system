import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DataGrid, type DataGridColumn, type DataGridRow } from "./index";

// ── Sample data ───────────────────────────────────────────────────────────────

const COLS: DataGridColumn[] = [
	{ key: "company", label: "Company", width: 160, sortable: true },
	{ key: "role", label: "Role", width: 200, sortable: true },
	{ key: "status", label: "Status", width: 120 },
	{ key: "salary", label: "Salary", width: 110, sortable: true, align: "right" },
	{ key: "applied", label: "Applied", width: 110, sortable: true },
	{ key: "priority", label: "Priority", width: 110 },
];

const ROWS: DataGridRow[] = [
	{
		id: 1,
		company: "Stripe",
		role: "Staff Engineer",
		status: "interviewing",
		salary: "$210k",
		applied: "Mar 12",
		priority: "high",
	},
	{
		id: 2,
		company: "Linear",
		role: "Product Engineer",
		status: "applied",
		salary: "$185k",
		applied: "Mar 18",
		priority: "high",
	},
	{
		id: 3,
		company: "Vercel",
		role: "Senior Engineer",
		status: "offer",
		salary: "$195k",
		applied: "Feb 28",
		priority: "medium",
	},
	{
		id: 4,
		company: "Notion",
		role: "Staff Engineer",
		status: "rejected",
		salary: "$190k",
		applied: "Feb 14",
		priority: "low",
	},
	{
		id: 5,
		company: "Figma",
		role: "Senior Engineer",
		status: "interviewing",
		salary: "$200k",
		applied: "Mar 02",
		priority: "medium",
	},
	{
		id: 6,
		company: "Anthropic",
		role: "Research Engineer",
		status: "applied",
		salary: "$240k",
		applied: "Mar 22",
		priority: "high",
	},
	{
		id: 7,
		company: "Vercel",
		role: "Frontend Engineer",
		status: "applied",
		salary: "$170k",
		applied: "Mar 25",
		priority: "low",
	},
];

// ── Wrapper components ────────────────────────────────────────────────────────

function DataGridDemo({ enablePagination = true }: { enablePagination?: boolean }) {
	const [page, setPage] = useState(1);
	const totalPages = enablePagination ? 3 : 1;
	return (
		<DataGrid
			columns={COLS}
			rows={ROWS}
			page={page}
			totalPages={totalPages}
			onPageChange={setPage}
		/>
	);
}

function DataGridSelectionDemo() {
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Array<string | number>>([]);
	return (
		<div>
			<div
				style={{
					marginBottom: 12,
					fontFamily: "var(--mono)",
					fontSize: 11,
					color: "var(--ink-3)",
				}}
			>
				Selected: [{selected.join(", ") || "—"}]
			</div>
			<DataGrid
				columns={COLS}
				rows={ROWS}
				page={page}
				totalPages={3}
				onPageChange={setPage}
				onSelectionChange={setSelected}
			/>
		</div>
	);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DataGrid> = {
	title: "Data Display/DataGrid",
	component: DataGrid,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"DataGrid composes Table + three table hooks (sort, resize, selection) with status badges, priority dots, a bulk-action bar, and a footer Pagination component. The footer Pagination is rendered as a SIBLING of the inner table — `<nav>` inside `<table>` is invalid HTML.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Default DataGrid with 7 job-application rows. Demonstrates layout, status badges, and priority dots.",
			},
		},
	},
	render: () => <DataGridDemo />,
};

export const Sortable: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Click any sortable header (Company, Role, Salary, Applied) to toggle asc/desc. The active column shows an amber ▲/▼ indicator.",
			},
		},
	},
	render: () => <DataGridDemo />,
};

export const WithSelection: Story = {
	name: "With selection",
	parameters: {
		docs: {
			description: {
				story:
					"Check rows to reveal the bulk-action bar (Export / Archive / Clear). The select-all header checkbox toggles all rows.",
			},
		},
	},
	render: () => <DataGridSelectionDemo />,
};

export const DarkMode: Story = {
	name: "Dark mode",
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 12,
				}}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					"DataGrid tokens follow dark surface — header, row hover, sort indicator, bulk-bar amber tint.",
			},
		},
	},
	render: () => <DataGridDemo />,
};
