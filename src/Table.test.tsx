/**
 * Table (DS-61, Part 1) — unit tests
 *
 * Chrome: Root, Header, HeaderCell, Body, Row, Cell
 * Sort: sortable HeaderCell with aria-sort, chevron indicator, click + keyboard
 * Density: data-density attribute on Root
 * Sticky: data-sticky attribute on Root
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRoot,
	TableRow,
} from "./Table";

// ── Smoke: Basic rendering ────────────────────────────────────────────────────

describe("Table.Root (TableRoot)", () => {
	it("renders a <table> element", () => {
		render(
			<TableRoot>
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toBeInTheDocument();
	});

	it("applies .ds-atom-table class", () => {
		render(
			<TableRoot>
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveClass("ds-atom-table");
	});

	it("sets data-density='comfortable' by default", () => {
		render(
			<TableRoot>
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveAttribute("data-density", "comfortable");
	});

	it("sets data-density='cozy' when density='cozy'", () => {
		render(
			<TableRoot density="cozy">
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveAttribute("data-density", "cozy");
	});

	it("sets data-density='spacious' when density='spacious'", () => {
		render(
			<TableRoot density="spacious">
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveAttribute("data-density", "spacious");
	});

	it("sets data-sticky='true' when sticky prop is provided", () => {
		render(
			<TableRoot sticky>
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveAttribute("data-sticky", "true");
	});

	it("does NOT render data-sticky when sticky is falsy", () => {
		render(
			<TableRoot>
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).not.toHaveAttribute("data-sticky");
	});

	it("passes aria-label from ariaLabel prop", () => {
		render(
			<TableRoot ariaLabel="User list">
				<tbody />
			</TableRoot>,
		);
		expect(document.querySelector("table")).toHaveAttribute("aria-label", "User list");
	});

	it("also works via compound alias Table.Root", () => {
		render(
			<Table.Root>
				<tbody />
			</Table.Root>,
		);
		expect(document.querySelector("table")).toBeInTheDocument();
	});
});

// ── Header / Body / Row / Cell smoke ─────────────────────────────────────────

describe("Table subcomponents", () => {
	it("Table.Header renders <thead>", () => {
		render(
			<table>
				<TableHeader>
					<tr>
						<th>Name</th>
					</tr>
				</TableHeader>
			</table>,
		);
		expect(document.querySelector("thead")).toBeInTheDocument();
	});

	it("Table.Body renders <tbody>", () => {
		render(
			<table>
				<TableBody>
					<tr>
						<td>Alice</td>
					</tr>
				</TableBody>
			</table>,
		);
		expect(document.querySelector("tbody")).toBeInTheDocument();
	});

	it("Table.Row renders <tr>", () => {
		render(
			<table>
				<tbody>
					<TableRow>
						<td>Alice</td>
					</TableRow>
				</tbody>
			</table>,
		);
		expect(document.querySelector("tr")).toBeInTheDocument();
	});

	it("Table.Cell renders <td>", () => {
		render(
			<table>
				<tbody>
					<tr>
						<TableCell>Alice</TableCell>
					</tr>
				</tbody>
			</table>,
		);
		expect(document.querySelector("td")).toHaveTextContent("Alice");
	});
});

// ── HeaderCell: non-sortable ──────────────────────────────────────────────────

describe("Table.HeaderCell — non-sortable", () => {
	it("renders a plain <th> without sortable prop", () => {
		render(
			<table>
				<thead>
					<tr>
						<TableHeaderCell>Name</TableHeaderCell>
					</tr>
				</thead>
			</table>,
		);
		const th = document.querySelector("th");
		expect(th).toBeInTheDocument();
		expect(th).not.toHaveAttribute("tabindex");
		expect(th).not.toHaveAttribute("aria-sort");
	});
});

// ── HeaderCell: sortable ──────────────────────────────────────────────────────

describe("Table.HeaderCell — sortable", () => {
	function SortableHeader({
		sortDir = null,
		onToggleSort = vi.fn(),
	}: {
		sortDir?: "asc" | "desc" | null;
		onToggleSort?: () => void;
	}) {
		return (
			<table>
				<thead>
					<tr>
						<TableHeaderCell sortable sortDir={sortDir} onToggleSort={onToggleSort}>
							Name
						</TableHeaderCell>
					</tr>
				</thead>
			</table>
		);
	}

	it("renders tabIndex=0 and role=columnheader when sortable", () => {
		render(<SortableHeader />);
		const th = document.querySelector("th");
		expect(th).toHaveAttribute("tabindex", "0");
		expect(th).toHaveAttribute("role", "columnheader");
	});

	it("sets aria-sort='ascending' when sortDir='asc'", () => {
		render(<SortableHeader sortDir="asc" />);
		expect(document.querySelector("th")).toHaveAttribute("aria-sort", "ascending");
	});

	it("sets aria-sort='descending' when sortDir='desc'", () => {
		render(<SortableHeader sortDir="desc" />);
		expect(document.querySelector("th")).toHaveAttribute("aria-sort", "descending");
	});

	it("sets aria-sort='none' when sortDir=null", () => {
		render(<SortableHeader sortDir={null} />);
		expect(document.querySelector("th")).toHaveAttribute("aria-sort", "none");
	});

	it("renders ▲ indicator for asc", () => {
		render(<SortableHeader sortDir="asc" />);
		expect(document.querySelector(".ds-atom-table-sort-indicator")).toHaveTextContent("▲");
	});

	it("renders ▼ indicator for desc", () => {
		render(<SortableHeader sortDir="desc" />);
		expect(document.querySelector(".ds-atom-table-sort-indicator")).toHaveTextContent("▼");
	});

	it("renders empty indicator when sortDir=null", () => {
		render(<SortableHeader sortDir={null} />);
		expect(document.querySelector(".ds-atom-table-sort-indicator")).toHaveTextContent("");
	});

	it("fires onToggleSort on click", () => {
		const handler = vi.fn();
		render(<SortableHeader onToggleSort={handler} />);
		fireEvent.click(document.querySelector("th")!);
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("fires onToggleSort on Enter key", () => {
		const handler = vi.fn();
		render(<SortableHeader onToggleSort={handler} />);
		fireEvent.keyDown(document.querySelector("th")!, { key: "Enter" });
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("fires onToggleSort on Space key", () => {
		const handler = vi.fn();
		render(<SortableHeader onToggleSort={handler} />);
		fireEvent.keyDown(document.querySelector("th")!, { key: " " });
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("does NOT fire onToggleSort on other keys", () => {
		const handler = vi.fn();
		render(<SortableHeader onToggleSort={handler} />);
		fireEvent.keyDown(document.querySelector("th")!, { key: "Escape" });
		expect(handler).not.toHaveBeenCalled();
	});
});

// ── Compound namespace shape ──────────────────────────────────────────────────

describe("Table namespace object", () => {
	it("exposes all compound members", () => {
		expect(Table.Root).toBeDefined();
		expect(Table.Header).toBeDefined();
		expect(Table.HeaderCell).toBeDefined();
		expect(Table.Body).toBeDefined();
		expect(Table.Row).toBeDefined();
		expect(Table.Cell).toBeDefined();
	});

	it("exposes SelectAllCell, SelectCell, Pagination members (Plan 17-11)", () => {
		expect(Table.SelectAllCell).toBeDefined();
		expect(Table.SelectCell).toBeDefined();
		expect(Table.Pagination).toBeDefined();
	});
});

// ── Table.Root: multiSelectable ───────────────────────────────────────────────

describe("Table.Root multiSelectable", () => {
	it("sets aria-multiselectable=true when multiSelectable prop provided", () => {
		render(
			<Table.Root multiSelectable>
				<tbody />
			</Table.Root>,
		);
		expect(document.querySelector("table")).toHaveAttribute("aria-multiselectable", "true");
	});

	it("does not set aria-multiselectable when prop is absent", () => {
		render(
			<Table.Root>
				<tbody />
			</Table.Root>,
		);
		expect(document.querySelector("table")).not.toHaveAttribute("aria-multiselectable");
	});
});

// ── Table.Row: selected ───────────────────────────────────────────────────────

describe("Table.Row selected", () => {
	it("sets aria-selected=true and data-selected=true when selected prop provided", () => {
		render(
			<table>
				<tbody>
					<Table.Row selected>
						<td>x</td>
					</Table.Row>
				</tbody>
			</table>,
		);
		const row = document.querySelector("tr");
		expect(row).toHaveAttribute("aria-selected", "true");
		expect(row).toHaveAttribute("data-selected", "true");
	});

	it("does not set aria-selected when selected is absent", () => {
		render(
			<table>
				<tbody>
					<Table.Row>
						<td>x</td>
					</Table.Row>
				</tbody>
			</table>,
		);
		expect(document.querySelector("tr")).not.toHaveAttribute("aria-selected");
	});
});

// ── Table.HeaderCell: resizable ───────────────────────────────────────────────

describe("Table.HeaderCell resizable", () => {
	it("renders a resize handle span when resizable prop is set", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.HeaderCell resizable>Name</Table.HeaderCell>
					</tr>
				</thead>
			</table>,
		);
		expect(document.querySelector(".ds-atom-table-resize-handle")).toBeInTheDocument();
	});

	it("resize handle has aria-hidden=true (visual affordance only, no semantic role)", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.HeaderCell resizable>Name</Table.HeaderCell>
					</tr>
				</thead>
			</table>,
		);
		const handle = document.querySelector(".ds-atom-table-resize-handle");
		expect(handle).toHaveAttribute("aria-hidden", "true");
		// No role — biome a11y/useSemanticElements forbids role="separator" on <span>;
		// the handle is a purely visual drag affordance, not a semantic separator.
		expect(handle).not.toHaveAttribute("role");
	});

	it("does not render resize handle when resizable is absent", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.HeaderCell>Name</Table.HeaderCell>
					</tr>
				</thead>
			</table>,
		);
		expect(document.querySelector(".ds-atom-table-resize-handle")).not.toBeInTheDocument();
	});

	it("calls onResizeStart when pointer-down fires on the resize handle", () => {
		const onResizeStart = vi.fn();
		render(
			<table>
				<thead>
					<tr>
						<Table.HeaderCell resizable onResizeStart={onResizeStart}>
							Name
						</Table.HeaderCell>
					</tr>
				</thead>
			</table>,
		);
		const handle = document.querySelector(".ds-atom-table-resize-handle")!;
		fireEvent.pointerDown(handle);
		expect(onResizeStart).toHaveBeenCalledTimes(1);
	});
});

// ── Table.SelectAllCell ───────────────────────────────────────────────────────

describe("Table.SelectAllCell", () => {
	it("renders a <th> with the Checkbox inside", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.SelectAllCell
							isAllSelected={false}
							isIndeterminate={false}
							onToggleAll={vi.fn()}
						/>
					</tr>
				</thead>
			</table>,
		);
		expect(document.querySelector("th")).toBeInTheDocument();
		expect(document.querySelector("input[type=checkbox]")).toBeInTheDocument();
	});

	it("checkbox is checked when isAllSelected=true", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.SelectAllCell
							isAllSelected={true}
							isIndeterminate={false}
							onToggleAll={vi.fn()}
						/>
					</tr>
				</thead>
			</table>,
		);
		expect(document.querySelector("input[type=checkbox]")).toBeChecked();
	});

	it("has aria-label 'Select all rows' by default", () => {
		render(
			<table>
				<thead>
					<tr>
						<Table.SelectAllCell
							isAllSelected={false}
							isIndeterminate={false}
							onToggleAll={vi.fn()}
						/>
					</tr>
				</thead>
			</table>,
		);
		expect(document.querySelector("input[type=checkbox]")).toHaveAttribute(
			"aria-label",
			"Select all rows",
		);
	});

	it("fires onToggleAll when checkbox changes", () => {
		const onToggleAll = vi.fn();
		render(
			<table>
				<thead>
					<tr>
						<Table.SelectAllCell
							isAllSelected={false}
							isIndeterminate={false}
							onToggleAll={onToggleAll}
						/>
					</tr>
				</thead>
			</table>,
		);
		fireEvent.click(document.querySelector("input[type=checkbox]")!);
		expect(onToggleAll).toHaveBeenCalledTimes(1);
	});
});

// ── Table.SelectCell ──────────────────────────────────────────────────────────

describe("Table.SelectCell", () => {
	it("renders a <td> with Checkbox inside", () => {
		render(
			<table>
				<tbody>
					<tr>
						<Table.SelectCell selected={false} onToggle={vi.fn()} />
					</tr>
				</tbody>
			</table>,
		);
		expect(document.querySelector("td")).toBeInTheDocument();
		expect(document.querySelector("input[type=checkbox]")).toBeInTheDocument();
	});

	it("checkbox is checked when selected=true", () => {
		render(
			<table>
				<tbody>
					<tr>
						<Table.SelectCell selected={true} onToggle={vi.fn()} />
					</tr>
				</tbody>
			</table>,
		);
		expect(document.querySelector("input[type=checkbox]")).toBeChecked();
	});

	it("fires onToggle when checkbox changes", () => {
		const onToggle = vi.fn();
		render(
			<table>
				<tbody>
					<tr>
						<Table.SelectCell selected={false} onToggle={onToggle} />
					</tr>
				</tbody>
			</table>,
		);
		fireEvent.click(document.querySelector("input[type=checkbox]")!);
		expect(onToggle).toHaveBeenCalledTimes(1);
	});
});

// ── Table.Pagination ──────────────────────────────────────────────────────────

describe("Table.Pagination", () => {
	it("renders a <nav> with aria-label='Pagination'", () => {
		render(<Table.Pagination page={1} pageCount={5} onPageChange={vi.fn()} />);
		expect(document.querySelector("nav")).toHaveAttribute("aria-label", "Pagination");
	});

	it("prev button is disabled when page=1", () => {
		render(<Table.Pagination page={1} pageCount={5} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Previous page")).toBeDisabled();
	});

	it("next button is disabled when page=pageCount", () => {
		render(<Table.Pagination page={5} pageCount={5} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Next page")).toBeDisabled();
	});

	it("prev button is enabled when page>1", () => {
		render(<Table.Pagination page={2} pageCount={5} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
	});

	it("next button is enabled when page<pageCount", () => {
		render(<Table.Pagination page={2} pageCount={5} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Next page")).not.toBeDisabled();
	});

	it("calls onPageChange with page-1 when prev clicked", () => {
		const onPageChange = vi.fn();
		render(<Table.Pagination page={3} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByLabelText("Previous page"));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it("calls onPageChange with page+1 when next clicked", () => {
		const onPageChange = vi.fn();
		render(<Table.Pagination page={3} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByLabelText("Next page"));
		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	it("renders all pages 1..pageCount when pageCount<=7", () => {
		render(<Table.Pagination page={1} pageCount={5} onPageChange={vi.fn()} />);
		for (let i = 1; i <= 5; i++) {
			expect(screen.getByLabelText(`Page ${i}`)).toBeInTheDocument();
		}
	});

	it("renders truncated [1,2,3,4,5,...,N] when current is near start (page=3, count=20)", () => {
		render(<Table.Pagination page={3} pageCount={20} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 20")).toBeInTheDocument();
		// Should have exactly one ellipsis
		expect(document.querySelectorAll(".ds-atom-table-pagination-ellipsis")).toHaveLength(1);
	});

	it("renders truncated [1,...,N-4,N-3,N-2,N-1,N] when current is near end (page=18, count=20)", () => {
		render(<Table.Pagination page={18} pageCount={20} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 16")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 20")).toBeInTheDocument();
		expect(document.querySelectorAll(".ds-atom-table-pagination-ellipsis")).toHaveLength(1);
	});

	it("renders both ellipses when current is in the middle (page=10, count=20)", () => {
		render(<Table.Pagination page={10} pageCount={20} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 9")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 10")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 11")).toBeInTheDocument();
		expect(screen.getByLabelText("Page 20")).toBeInTheDocument();
		expect(document.querySelectorAll(".ds-atom-table-pagination-ellipsis")).toHaveLength(2);
	});

	it("active page button has aria-current='page'", () => {
		render(<Table.Pagination page={3} pageCount={5} onPageChange={vi.fn()} />);
		expect(screen.getByLabelText("Page 3")).toHaveAttribute("aria-current", "page");
		expect(screen.getByLabelText("Page 1")).not.toHaveAttribute("aria-current");
	});

	it("renders pagination summary when total and pageSize are provided", () => {
		render(
			<Table.Pagination page={2} pageCount={5} onPageChange={vi.fn()} pageSize={5} total={23} />,
		);
		// page 2, pageSize 5: rows 6–10 of 23
		expect(document.querySelector(".ds-atom-table-pagination-summary")).toHaveTextContent(
			"6–10 of 23",
		);
	});

	it("calls onPageChange with clicked page number", () => {
		const onPageChange = vi.fn();
		render(<Table.Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
		fireEvent.click(screen.getByLabelText("Page 3"));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});
});
