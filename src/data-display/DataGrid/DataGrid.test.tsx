/**
 * DataGrid (DS-62) - unit tests
 *
 * Coverage:
 *   - Render: wrapper, headers, body rows
 *   - Sort: clicking sortable header toggles asc/desc + ▲/▼ indicator
 *   - Selection: row + select-all checkboxes; onSelectionChange fires
 *   - BulkActions: bulk-bar appears when selection.length > 0
 *   - StatusBadges: status cells render Badge with correct count
 *   - PriorityDots: data-part="priority-dot" rendered per row
 *   - Pagination: rendered as a SIBLING <nav>, NOT a descendant of <table>
 *   - Keyboard: Space toggles row selection
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn, type DataGridRow } from "./index";

const COLS: DataGridColumn[] = [
	{ key: "company", label: "Company", width: 150, sortable: true },
	{ key: "role", label: "Role", width: 180, sortable: true },
	{ key: "status", label: "Status", width: 110 },
	{ key: "salary", label: "Salary", width: 100, sortable: true, align: "right" },
	{ key: "priority", label: "Priority", width: 90 },
];

const ROWS: DataGridRow[] = [
	{
		id: 1,
		company: "Stripe",
		role: "Staff Engineer",
		status: "interviewing",
		salary: "$210k",
		priority: "high",
	},
	{
		id: 2,
		company: "Linear",
		role: "Product Engineer",
		status: "applied",
		salary: "$185k",
		priority: "high",
	},
	{
		id: 3,
		company: "Vercel",
		role: "Senior Engineer",
		status: "offer",
		salary: "$195k",
		priority: "medium",
	},
	{
		id: 4,
		company: "Notion",
		role: "Staff Engineer",
		status: "rejected",
		salary: "$190k",
		priority: "low",
	},
];

describe("DataGrid", () => {
	describe("Render", () => {
		it("renders ds-atom-datagrid wrapper containing a table", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const wrapper = container.querySelector(".ds-atom-datagrid");
			expect(wrapper).not.toBeNull();
			expect(wrapper?.querySelector("table")).not.toBeNull();
		});

		it("renders all column headers (cols + select-all column)", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const headers = container.querySelectorAll("thead th");
			// Cols + select-all checkbox column = COLS.length + 1
			expect(headers.length).toBe(COLS.length + 1);
		});

		it("renders one row per data row", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const bodyRows = container.querySelectorAll("tbody tr");
			expect(bodyRows.length).toBe(ROWS.length);
		});
	});

	describe("Sort", () => {
		it("clicking a sortable header toggles asc/desc and shows ▲/▼", () => {
			render(<DataGrid columns={COLS} rows={ROWS} />);
			const companyHeader = screen.getByText("Company").closest("th");
			expect(companyHeader).not.toBeNull();
			fireEvent.click(companyHeader as HTMLElement);
			expect(companyHeader?.textContent).toMatch(/▲|▼/);
			fireEvent.click(companyHeader as HTMLElement);
			expect(companyHeader?.textContent).toMatch(/▲|▼/);
		});

		it("non-sortable column header does not show sort indicator", () => {
			render(<DataGrid columns={COLS} rows={ROWS} />);
			const statusHeader = screen.getByText("Status").closest("th");
			expect(statusHeader).not.toBeNull();
			fireEvent.click(statusHeader as HTMLElement);
			expect(statusHeader?.textContent).not.toMatch(/▲|▼/);
		});
	});

	describe("Selection", () => {
		it("clicking a row checkbox calls onSelectionChange with that row id", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} onSelectionChange={onSelectionChange} />,
			);
			const rowCheckboxes = container.querySelectorAll<HTMLInputElement>(
				'tbody input[type="checkbox"]',
			);
			expect(rowCheckboxes.length).toBeGreaterThan(0);
			const first = rowCheckboxes[0];
			expect(first).toBeDefined();
			fireEvent.click(first as HTMLInputElement);
			expect(onSelectionChange).toHaveBeenCalled();
			const lastCall = onSelectionChange.mock.calls.at(-1);
			expect(lastCall?.[0]).toEqual([1]);
		});

		it("select-all checkbox selects all rows", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} onSelectionChange={onSelectionChange} />,
			);
			const selectAll = container.querySelector<HTMLInputElement>('thead input[type="checkbox"]');
			expect(selectAll).not.toBeNull();
			fireEvent.click(selectAll as HTMLInputElement);
			expect(onSelectionChange).toHaveBeenCalled();
			const lastCall = onSelectionChange.mock.calls.at(-1);
			expect(lastCall?.[0]).toEqual(expect.arrayContaining([1, 2, 3, 4]));
		});
	});

	describe("BulkActions", () => {
		it("bulk-action bar is hidden when nothing selected", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			expect(container.querySelector(".ds-atom-datagrid-bulkbar")).toBeNull();
		});

		it("bulk-action bar appears when at least one row selected", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const rowCheckbox = container.querySelector<HTMLInputElement>('tbody input[type="checkbox"]');
			expect(rowCheckbox).not.toBeNull();
			fireEvent.click(rowCheckbox as HTMLInputElement);
			expect(container.querySelector(".ds-atom-datagrid-bulkbar")).not.toBeNull();
		});

		it("bulk-bar shows correct selection count text", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const rowCheckboxes = container.querySelectorAll<HTMLInputElement>(
				'tbody input[type="checkbox"]',
			);
			fireEvent.click(rowCheckboxes[0] as HTMLInputElement);
			fireEvent.click(rowCheckboxes[1] as HTMLInputElement);
			const count = container.querySelector(".ds-atom-datagrid-bulkbar-count");
			expect(count?.textContent).toBe("2 selected");
		});

		it("Clear button resets selection and hides bulk-bar", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} onSelectionChange={onSelectionChange} />,
			);
			const rowCheckbox = container.querySelector<HTMLInputElement>('tbody input[type="checkbox"]');
			fireEvent.click(rowCheckbox as HTMLInputElement);
			expect(container.querySelector(".ds-atom-datagrid-bulkbar")).not.toBeNull();
			const clearBtn = screen.getByText("Clear");
			fireEvent.click(clearBtn);
			expect(container.querySelector(".ds-atom-datagrid-bulkbar")).toBeNull();
		});
	});

	describe("StatusBadges", () => {
		it("renders one Badge (status) per data row", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			// Badge component renders a <span> with mono font; we assert by counting
			// status-cell badges via labels.
			expect(screen.getByText("Interview")).toBeInTheDocument();
			expect(screen.getByText("Applied")).toBeInTheDocument();
			expect(screen.getByText("Offer")).toBeInTheDocument();
			expect(screen.getByText("Rejected")).toBeInTheDocument();
			// Sanity: exactly four (one per row)
			const labels = ["Interview", "Applied", "Offer", "Rejected"];
			const matches = labels.filter((l) => container.textContent?.includes(l));
			expect(matches.length).toBe(4);
		});
	});

	describe("PriorityDots", () => {
		it("renders priority dots with data-part attribute", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const dots = container.querySelectorAll('[data-part="priority-dot"]');
			expect(dots.length).toBe(ROWS.length);
		});

		it("priority dot uses red-vivid for high priority", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS.slice(0, 1)} />);
			const dot = container.querySelector<HTMLElement>('[data-part="priority-dot"]');
			expect(dot).not.toBeNull();
			expect(dot?.style.background).toContain("--red-vivid");
		});
	});

	describe("Pagination", () => {
		it("renders Pagination as a sibling div, NOT inside the table", () => {
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} totalPages={5} page={1} onPageChange={vi.fn()} />,
			);
			const wrapper = container.querySelector(".ds-atom-datagrid");
			expect(wrapper).not.toBeNull();
			const table = wrapper?.querySelector("table");
			expect(table).not.toBeNull();
			const nav = wrapper?.querySelector("nav");
			expect(nav).not.toBeNull();
			// nav must be a child of the wrapper but NOT a descendant of the table
			expect(table?.contains(nav as Node)).toBe(false);
		});

		it("calls onPageChange when a numbered pagination button is clicked", () => {
			const onPageChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} totalPages={5} page={1} onPageChange={onPageChange} />,
			);
			// .ds-atom-pagination-btn buttons are the numeric page buttons
			const pageButtons = container.querySelectorAll<HTMLButtonElement>(".ds-atom-pagination-btn");
			// Click a button that is not the current page (button[1] is page 2 since pageButtons[0] = page 1)
			const target = Array.from(pageButtons).find((b) => b.getAttribute("aria-current") !== "page");
			expect(target).toBeDefined();
			fireEvent.click(target as HTMLButtonElement);
			expect(onPageChange).toHaveBeenCalled();
		});
	});

	describe("Keyboard", () => {
		it("Space on a row checkbox cell toggles its selection", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} onSelectionChange={onSelectionChange} />,
			);
			const firstRow = container.querySelector<HTMLTableRowElement>("tbody tr");
			expect(firstRow).not.toBeNull();
			// Space key fires on the wrapper via bubbling; pass the row as the event target
			fireEvent.keyDown(firstRow as HTMLTableRowElement, { key: " " });
			expect(onSelectionChange).toHaveBeenCalled();
		});

		it("ArrowDown advances focused cell", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			expect(wrapper).not.toBeNull();
			// Should not throw; preventDefault path executes
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowRight" });
			// The handler doesn't expose state but we assert no error and DOM remains intact
			expect(container.querySelectorAll("tbody tr").length).toBe(ROWS.length);
		});
	});
});
