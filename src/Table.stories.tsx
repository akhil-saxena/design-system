import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from "./Table";
import { useResizableColumns } from "./hooks/useResizableColumns";
import { useSortableTable } from "./hooks/useSortableTable";
import { useTableSelection } from "./hooks/useTableSelection";

// ── Sample data ───────────────────────────────────────────────────────────────

type User = { id: number; name: string; role: string; joinDate: string };

const users: User[] = [
	{ id: 1, name: "Alice Martin", role: "Engineer", joinDate: "2022-03-15" },
	{ id: 2, name: "Bob Chen", role: "Designer", joinDate: "2021-11-01" },
	{ id: 3, name: "Carol Davis", role: "Product", joinDate: "2023-01-20" },
	{ id: 4, name: "David Kim", role: "Engineer", joinDate: "2020-08-05" },
	{ id: 5, name: "Eva Lopez", role: "Marketing", joinDate: "2022-07-12" },
];

// ── Story components (must be named functions for hook rules) ─────────────────

function SortableTable({
	density,
	sticky,
}: Readonly<{
	density?: "cozy" | "comfortable" | "spacious";
	sticky?: boolean;
}>) {
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

function SelectionTable() {
	const ids = users.map((u) => u.id);
	const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);
	return (
		<Table.Root multiSelectable ariaLabel="Selectable user list">
			<Table.Header>
				<Table.Row>
					<Table.SelectAllCell
						isAllSelected={isAllSelected}
						isIndeterminate={isIndeterminate}
						onToggleAll={toggleAll}
					/>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Role</Table.HeaderCell>
					<Table.HeaderCell>Join Date</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{users.map((u) => (
					<Table.Row key={u.id} selected={isSelected(u.id)}>
						<Table.SelectCell selected={isSelected(u.id)} onToggle={() => toggle(u.id)} />
						<Table.Cell>{u.name}</Table.Cell>
						<Table.Cell>{u.role}</Table.Cell>
						<Table.Cell>{u.joinDate}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
}

function SingleSelectionTable() {
	const ids = users.map((u) => u.id);
	const { isSelected, toggle } = useTableSelection(ids, { mode: "single" });
	return (
		<Table.Root ariaLabel="Single-select user list">
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Select</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Role</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{users.map((u) => (
					<Table.Row key={u.id} selected={isSelected(u.id)}>
						<Table.SelectCell selected={isSelected(u.id)} onToggle={() => toggle(u.id)} />
						<Table.Cell>{u.name}</Table.Cell>
						<Table.Cell>{u.role}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
}

function ResizableTable() {
	const { widths, startResize } = useResizableColumns({
		name: 160,
		role: 120,
		joinDate: 120,
		status: 100,
	});
	return (
		<Table.Root ariaLabel="Resizable column table" style={{ tableLayout: "fixed", width: "100%" }}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell
						resizable
						width={widths.name}
						onResizeStart={(e) => startResize("name", e)}
					>
						Name
					</Table.HeaderCell>
					<Table.HeaderCell
						resizable
						width={widths.role}
						onResizeStart={(e) => startResize("role", e)}
					>
						Role
					</Table.HeaderCell>
					<Table.HeaderCell
						resizable
						width={widths.joinDate}
						onResizeStart={(e) => startResize("joinDate", e)}
					>
						Join Date
					</Table.HeaderCell>
					<Table.HeaderCell
						resizable
						width={widths.status}
						onResizeStart={(e) => startResize("status", e)}
					>
						Status
					</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{users.map((u) => (
					<Table.Row key={u.id}>
						<Table.Cell>{u.name}</Table.Cell>
						<Table.Cell>{u.role}</Table.Cell>
						<Table.Cell>{u.joinDate}</Table.Cell>
						<Table.Cell>Active</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
}

const allRows23 = Array.from({ length: 23 }, (_, i) => {
	let role: string;
	if (i % 3 === 0) {
		role = "Engineer";
	} else if (i % 3 === 1) {
		role = "Designer";
	} else {
		role = "Product";
	}
	return { id: i + 1, name: `User ${i + 1}`, role, joinDate: `2023-0${(i % 9) + 1}-01` };
});

function PaginationTable() {
	const [page, setPage] = useState(1);
	const pageSize = 5;
	const pageCount = Math.ceil(allRows23.length / pageSize);
	const pageRows = allRows23.slice((page - 1) * pageSize, page * pageSize);
	return (
		<div>
			<Table.Root ariaLabel="Paginated user list">
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Role</Table.HeaderCell>
						<Table.HeaderCell>Join Date</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{pageRows.map((u) => (
						<Table.Row key={u.id}>
							<Table.Cell>{u.name}</Table.Cell>
							<Table.Cell>{u.role}</Table.Cell>
							<Table.Cell>{u.joinDate}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
			<Table.Pagination
				page={page}
				pageCount={pageCount}
				onPageChange={setPage}
				pageSize={pageSize}
				total={allRows23.length}
			/>
		</div>
	);
}

function PaginationManyPagesDemo() {
	const [page, setPage] = useState(10);
	return (
		<div style={{ padding: "16px" }}>
			<p
				style={{
					marginBottom: "12px",
					fontFamily: "var(--font)",
					fontSize: 13,
					color: "var(--ink-2)",
				}}
			>
				20 pages — middle page shows both ellipses
			</p>
			<Table.Pagination page={page} pageCount={20} onPageChange={setPage} />
		</div>
	);
}

/**
 * Correct usage: Table.Pagination as a sibling of Table.Root (NOT nested inside).
 * `<nav>` inside `<table>` is invalid HTML — always place them as siblings in a wrapper div.
 */
function PaginationOutsideTableDemo() {
	const [page, setPage] = useState(1);
	const pageSize = 3;
	const pageCount = Math.ceil(users.length / pageSize);
	const pageRows = users.slice((page - 1) * pageSize, page * pageSize);
	return (
		// GOOD: Table.Root and Table.Pagination are siblings inside a wrapper div.
		<div>
			<Table.Root ariaLabel="Sibling pagination demo">
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>Role</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{pageRows.map((u) => (
						<Table.Row key={u.id}>
							<Table.Cell>{u.name}</Table.Cell>
							<Table.Cell>{u.role}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
			{/* Table.Pagination is a SIBLING — not a child of Table.Root */}
			<Table.Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
		</div>
	);
}

const combinedRows = Array.from({ length: 15 }, (_, i) => {
	const role = i % 2 === 0 ? "Engineer" : "Designer";
	return { id: i + 1, name: `User ${i + 1}`, role, joinDate: `2023-0${(i % 9) + 1}-01` };
});

function CombinedTable() {
	const [page, setPage] = useState(1);
	const pageSize = 5;
	const pageCount = Math.ceil(combinedRows.length / pageSize);
	const pageRows = combinedRows.slice((page - 1) * pageSize, page * pageSize);

	const ids = pageRows.map((r) => r.id);
	const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);
	const { widths, startResize } = useResizableColumns({ name: 160, role: 120, joinDate: 120 });

	return (
		<div>
			<Table.Root
				multiSelectable
				ariaLabel="Combined table"
				style={{ tableLayout: "fixed", width: "100%" }}
			>
				<Table.Header>
					<Table.Row>
						<Table.SelectAllCell
							isAllSelected={isAllSelected}
							isIndeterminate={isIndeterminate}
							onToggleAll={toggleAll}
						/>
						<Table.HeaderCell
							resizable
							width={widths.name}
							onResizeStart={(e) => startResize("name", e)}
						>
							Name
						</Table.HeaderCell>
						<Table.HeaderCell
							resizable
							width={widths.role}
							onResizeStart={(e) => startResize("role", e)}
						>
							Role
						</Table.HeaderCell>
						<Table.HeaderCell
							resizable
							width={widths.joinDate}
							onResizeStart={(e) => startResize("joinDate", e)}
						>
							Join Date
						</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{pageRows.map((u) => (
						<Table.Row key={u.id} selected={isSelected(u.id)}>
							<Table.SelectCell selected={isSelected(u.id)} onToggle={() => toggle(u.id)} />
							<Table.Cell>{u.name}</Table.Cell>
							<Table.Cell>{u.role}</Table.Cell>
							<Table.Cell>{u.joinDate}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
			{/* Pagination as sibling of Table.Root */}
			<Table.Pagination
				page={page}
				pageCount={pageCount}
				onPageChange={setPage}
				pageSize={pageSize}
				total={combinedRows.length}
			/>
		</div>
	);
}

function PlaygroundTable({
	density,
	sticky,
}: Readonly<{
	density?: "cozy" | "comfortable" | "spacious";
	sticky?: boolean;
}>) {
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
		<Table.Root density={density ?? "comfortable"} sticky={sticky} ariaLabel="Playground table">
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

/** Multi-select — checkbox column with select-all, indeterminate state, per-row selection. */
export const Selection: Story = {
	render: () => <SelectionTable />,
};

/** Single-select mode — only one row can be selected at a time. */
export const SingleSelection: Story = {
	render: () => <SingleSelectionTable />,
};

/** Resizable columns — drag any header right edge to resize. Min 60px. */
export const Resizable: Story = {
	render: () => <ResizableTable />,
};

/** Pagination — 23-row dataset paged 5 at a time; Table.Pagination is a sibling of Table.Root. */
export const Pagination: Story = {
	render: () => <PaginationTable />,
};

/** Pagination with many pages — pageCount=20, demonstrates both-ellipsis truncation. */
export const PaginationManyPages: Story = {
	render: () => <PaginationManyPagesDemo />,
};

/**
 * Correct usage: Table.Pagination rendered as a SIBLING of Table.Root, not nested inside.
 * `<nav>` inside `<table>` is invalid HTML — wrap both in a `<div>` and place as siblings.
 * This story is the canonical reference for the correct sibling pattern.
 */
export const PaginationOutsideTable: Story = {
	render: () => <PaginationOutsideTableDemo />,
};

/** Combined — Selection + Resizable + Pagination together (Pagination as sibling-of-Root). */
export const Combined: Story = {
	render: () => <CombinedTable />,
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
	render: (args) => <PlaygroundTable density={args.density} sticky={args.sticky} />,
	argTypes: {
		density: {
			control: { type: "select" },
			options: ["cozy", "comfortable", "spacious"],
		},
		sticky: { control: "boolean" },
	},
};
