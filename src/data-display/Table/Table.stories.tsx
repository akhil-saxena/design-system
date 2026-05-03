import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from ".";
import { useResizableColumns } from "../../hooks/useResizableColumns";
import { useSortableTable } from "../../hooks/useSortableTable";
import { useTableSelection } from "../../hooks/useTableSelection";
// ── Sample data ───────────────────────────────────────────────────────────────

type User = { id: number; name: string; role: string; joinDate: string };

const users: User[] = [
	{ id: 1, name: "Alice Martin", role: "Engineer", joinDate: "2022-03-15" },
	{ id: 2, name: "Bob Chen", role: "Designer", joinDate: "2021-11-01" },
	{ id: 3, name: "Carol Davis", role: "Product", joinDate: "2023-01-20" },
	{ id: 4, name: "David Kim", role: "Engineer", joinDate: "2020-08-05" },
	{ id: 5, name: "Eva Lopez", role: "Marketing", joinDate: "2022-07-12" },
];

const wrap = (children: React.ReactNode, maxHeight?: number) => (
	<div
		style={{
			border: "1px solid var(--rule)",
			borderRadius: 8,
			overflow: maxHeight ? "hidden" : "auto",
			...(maxHeight ? { maxHeight } : {}),
		}}
	>
		{children}
	</div>
);

// ── Story components ──────────────────────────────────────────────────────────

function SortableTable({
	density,
	sticky,
}: Readonly<{ density?: "cozy" | "comfortable" | "spacious"; sticky?: boolean }>) {
	const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(users, { defaultCol: "name" });
	const cellDir = (col: keyof User) => (sortCol === col ? sortDir : null);
	return wrap(
		<div style={sticky ? { maxHeight: 200, overflowY: "auto" } : undefined}>
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
		</div>,
	);
}

function SelectionTable() {
	const ids = users.map((u) => u.id);
	const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);
	return wrap(
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
		</Table.Root>,
	);
}

function SingleSelectionTable() {
	const ids = users.map((u) => u.id);
	const { isSelected, toggle } = useTableSelection(ids, { mode: "single" });
	return wrap(
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
		</Table.Root>,
	);
}

function ResizableTable() {
	const { widths, startResize } = useResizableColumns({
		name: 160,
		role: 120,
		joinDate: 120,
		status: 100,
	});
	return wrap(
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
		</Table.Root>,
	);
}

const allRows23 = Array.from({ length: 23 }, (_, i) => ({
	id: i + 1,
	name: `User ${i + 1}`,
	role: ["Engineer", "Designer", "Product"][i % 3] as string,
	joinDate: `2023-0${(i % 9) + 1}-01`,
}));

function PaginationTable() {
	const [page, setPage] = useState(1);
	const pageSize = 5;
	const pageCount = Math.ceil(allRows23.length / pageSize);
	const pageRows = allRows23.slice((page - 1) * pageSize, page * pageSize);
	return (
		<div>
			{wrap(
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
				</Table.Root>,
			)}
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
		<div style={{ padding: 16 }}>
			<p
				style={{ marginBottom: 12, fontFamily: "var(--font)", fontSize: 13, color: "var(--ink-2)" }}
			>
				20 pages - middle page shows both ellipses
			</p>
			<Table.Pagination page={page} pageCount={20} onPageChange={setPage} />
		</div>
	);
}

const combinedRows = Array.from({ length: 15 }, (_, i) => ({
	id: i + 1,
	name: `User ${i + 1}`,
	role: i % 2 === 0 ? "Engineer" : "Designer",
	joinDate: `2023-0${(i % 9) + 1}-01`,
}));

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
			{wrap(
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
				</Table.Root>,
			)}
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
}: Readonly<{ density?: "cozy" | "comfortable" | "spacious"; sticky?: boolean }>) {
	const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(users, { defaultCol: "name" });
	const cellDir = (col: keyof User) => (sortCol === col ? sortDir : null);
	return wrap(
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
		</Table.Root>,
	);
}

// ── Source snippets ───────────────────────────────────────────────────────────

const SRC = {
	default: `// Sortable table - click any header to sort
const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(users, { defaultCol: "name" });

<div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "auto" }}>
  <Table.Root ariaLabel="User list">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell sortable sortDir={sortCol === "name" ? sortDir : null} onToggleSort={() => toggleSort("name")}>
          Name
        </Table.HeaderCell>
        <Table.HeaderCell sortable sortDir={sortCol === "role" ? sortDir : null} onToggleSort={() => toggleSort("role")}>
          Role
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {sorted.map((u) => (
        <Table.Row key={u.id}>
          <Table.Cell>{u.name}</Table.Cell>
          <Table.Cell>{u.role}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
</div>`,

	selection: `const ids = users.map((u) => u.id);
const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);

<div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "auto" }}>
  <Table.Root multiSelectable ariaLabel="Selectable user list">
    <Table.Header>
      <Table.Row>
        <Table.SelectAllCell isAllSelected={isAllSelected} isIndeterminate={isIndeterminate} onToggleAll={toggleAll} />
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
</div>`,

	resizable: `const { widths, startResize } = useResizableColumns({ name: 160, role: 120, joinDate: 120 });

<div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "auto" }}>
  <Table.Root ariaLabel="Resizable table" style={{ tableLayout: "fixed", width: "100%" }}>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell resizable width={widths.name} onResizeStart={(e) => startResize("name", e)}>Name</Table.HeaderCell>
        <Table.HeaderCell resizable width={widths.role} onResizeStart={(e) => startResize("role", e)}>Role</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {users.map((u) => (
        <Table.Row key={u.id}>
          <Table.Cell>{u.name}</Table.Cell>
          <Table.Cell>{u.role}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
</div>`,

	sticky: `// Wrap in a constrained-height div to make sticky header visible
<div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--rule)", borderRadius: 8 }}>
  <Table.Root sticky ariaLabel="Sticky header table">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Name</Table.HeaderCell>
        <Table.HeaderCell>Role</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {users.map((u) => (
        <Table.Row key={u.id}>
          <Table.Cell>{u.name}</Table.Cell>
          <Table.Cell>{u.role}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
</div>`,

	pagination: `// Table.Pagination must be a SIBLING of Table.Root - not nested inside.
// <nav> inside <table> is invalid HTML.
const [page, setPage] = useState(1);
const pageRows = allRows.slice((page - 1) * 5, page * 5);

<div>
  <div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "auto" }}>
    <Table.Root ariaLabel="Paginated user list">
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
  </div>
  <Table.Pagination page={page} pageCount={pageCount} onPageChange={setPage} pageSize={5} total={allRows.length} />
</div>`,

	combined: `const { isAllSelected, isIndeterminate, isSelected, toggle, toggleAll } = useTableSelection(ids);
const { widths, startResize } = useResizableColumns({ name: 160, role: 120 });

<div>
  <div style={{ border: "1px solid var(--rule)", borderRadius: 8, overflow: "auto" }}>
    <Table.Root multiSelectable style={{ tableLayout: "fixed", width: "100%" }} ariaLabel="Combined table">
      <Table.Header>
        <Table.Row>
          <Table.SelectAllCell isAllSelected={isAllSelected} isIndeterminate={isIndeterminate} onToggleAll={toggleAll} />
          <Table.HeaderCell resizable width={widths.name} onResizeStart={(e) => startResize("name", e)}>Name</Table.HeaderCell>
          <Table.HeaderCell resizable width={widths.role} onResizeStart={(e) => startResize("role", e)}>Role</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {pageRows.map((u) => (
          <Table.Row key={u.id} selected={isSelected(u.id)}>
            <Table.SelectCell selected={isSelected(u.id)} onToggle={() => toggle(u.id)} />
            <Table.Cell>{u.name}</Table.Cell>
            <Table.Cell>{u.role}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </div>
  <Table.Pagination page={page} pageCount={pageCount} onPageChange={setPage} pageSize={5} total={rows.length} />
</div>`,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Table.Root> = {
	title: "Data Display/Table",
	component: Table.Root,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Compound-API data table. `Table.Root` wraps a `<table>`. Always wrap it in a `<div>` with `border` + `borderRadius` for the container chrome. `Table.Pagination` must be a **sibling** of `Table.Root`, never nested inside - `<nav>` inside `<table>` is invalid HTML.",
			},
		},
	},
	argTypes: {
		density: {
			control: "select",
			options: ["cozy", "comfortable", "spacious"],
			description: "Row height preset.",
		},
		sticky: { control: "boolean", description: "Pin the header row on scroll." },
		multiSelectable: { control: "boolean", description: "Enable multi-row checkbox selection." },
		ariaLabel: { control: "text" },
		style: { control: false },
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Table.Root>;

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: {
		docs: {
			description: { story: "Sortable columns. Click any header to toggle sort direction." },
			source: { code: SRC.default },
		},
	},
	render: () => <SortableTable />,
};

export const DensityCozy: Story = {
	name: "Density - Cozy",
	parameters: {
		docs: {
			description: { story: "32 px row height, tight padding." },
			source: { code: SRC.default },
		},
	},
	render: () => <SortableTable density="cozy" />,
};

export const DensityComfortable: Story = {
	name: "Density - Comfortable",
	parameters: {
		docs: { description: { story: "40 px row height (default)." }, source: { code: SRC.default } },
	},
	render: () => <SortableTable density="comfortable" />,
};

export const DensitySpacious: Story = {
	name: "Density - Spacious",
	parameters: {
		docs: {
			description: { story: "48 px row height, generous padding." },
			source: { code: SRC.default },
		},
	},
	render: () => <SortableTable density="spacious" />,
};

export const StickyHeader: Story = {
	name: "Sticky header",
	parameters: {
		docs: {
			description: {
				story:
					"Scroll the container - header stays pinned. Requires a max-height overflow wrapper.",
			},
			source: { code: SRC.sticky },
		},
	},
	render: () => <SortableTable sticky />,
};

export const NoSort: Story = {
	name: "No sort",
	parameters: {
		docs: {
			description: { story: "Plain table without sortable headers." },
			source: { code: SRC.default },
		},
	},
	render: () =>
		wrap(
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
			</Table.Root>,
		),
};

export const Selection: Story = {
	name: "Multi-select",
	parameters: {
		docs: {
			description: {
				story: "Checkbox column with select-all, indeterminate state, and per-row toggle.",
			},
			source: { code: SRC.selection },
		},
	},
	render: () => <SelectionTable />,
};

export const SingleSelection: Story = {
	name: "Single-select",
	parameters: {
		docs: {
			description: { story: "Only one row selectable at a time." },
			source: { code: SRC.selection },
		},
	},
	render: () => <SingleSelectionTable />,
};

export const Resizable: Story = {
	name: "Resizable columns",
	parameters: {
		docs: {
			description: { story: "Drag the right edge of any header to resize. Min 60 px enforced." },
			source: { code: SRC.resizable },
		},
	},
	render: () => <ResizableTable />,
};

export const Pagination: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"23-row dataset paged 5 at a time. `Table.Pagination` is a sibling of `Table.Root` - never nested inside.",
			},
			source: { code: SRC.pagination },
		},
	},
	render: () => <PaginationTable />,
};

export const PaginationManyPages: Story = {
	name: "Pagination - many pages",
	parameters: {
		docs: {
			description: {
				story: "pageCount=20 at page 10 - demonstrates the both-ellipses truncation pattern.",
			},
			source: { code: SRC.pagination },
		},
	},
	render: () => <PaginationManyPagesDemo />,
};

export const PaginationOutsideTable: Story = {
	name: "Pagination as sibling",
	parameters: {
		docs: {
			description: {
				story:
					"Canonical do/don't: `Table.Pagination` wrapped in the same `<div>` as `Table.Root`, not inside the table itself.",
			},
			source: { code: SRC.pagination },
		},
	},
	render: () => <PaginationTable />,
};

export const Combined: Story = {
	name: "Combined - selection + resizable + pagination",
	parameters: {
		docs: {
			description: {
				story: "All three features together. Pagination is always a sibling of Table.Root.",
			},
			source: { code: SRC.combined },
		},
	},
	render: () => <CombinedTable />,
};

export const DarkMode: Story = {
	name: "Dark mode",
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 16,
					borderRadius: 8,
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				story: "Table tokens follow dark surface - header, row hover, sort indicator.",
			},
			source: { code: SRC.default },
		},
	},
	render: () => <SortableTable />,
};

export const Playground: Story = {
	parameters: {
		docs: {
			description: { story: "Toggle density and sticky header via the Controls panel." },
			source: { code: SRC.default },
		},
	},
	render: (args) => <PlaygroundTable density={args.density} sticky={args.sticky} />,
	argTypes: {
		density: { control: { type: "select" }, options: ["cozy", "comfortable", "spacious"] },
		sticky: { control: "boolean" },
	},
};
