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
import { DataGrid, type DataGridColumn, type DataGridRow, dataGridPresets } from "./index";

const COLS: DataGridColumn[] = [
	{ key: "company", label: "Company", width: 150, sortable: true },
	{ key: "role", label: "Role", width: 180, sortable: true },
	{ key: "status", label: "Status", width: 110 },
	{ key: "salary", label: "Salary", width: 100, sortable: true, align: "right" },
	{ key: "priority", label: "Priority", width: 90 },
];

/** COLS, with the two job-domain presets opted into explicitly. */
const COLS_PRESET: DataGridColumn[] = COLS.map((c) =>
	c.key === "status"
		? { ...c, render: dataGridPresets.statusBadge }
		: c.key === "priority"
			? { ...c, render: dataGridPresets.priorityDot }
			: c,
);

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
		// 01-14: these three cases used to need no `render`, because a column keyed
		// exactly `status` or `priority` was routed through a private job-domain
		// lookup automatically. The mappings survive as opt-in presets; the columns
		// below are what opting in looks like, and "no longer routes a column keyed
		// status through the job-domain badge map" covers the half that was removed.
		it("renders one Badge (status) per data row", () => {
			const { container } = render(<DataGrid columns={COLS_PRESET} rows={ROWS} />);
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
			const { container } = render(<DataGrid columns={COLS_PRESET} rows={ROWS} />);
			const dots = container.querySelectorAll('[data-part="priority-dot"]');
			expect(dots.length).toBe(ROWS.length);
		});

		it("priority dot uses red-vivid for high priority", () => {
			const { container } = render(<DataGrid columns={COLS_PRESET} rows={ROWS.slice(0, 1)} />);
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

		it("ArrowDown into the checkbox column focuses the inner checkbox input (not the td)", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			expect(wrapper).not.toBeNull();
			// Start at header row col 1; ArrowLeft → checkbox column (col 0), ArrowDown → first body row.
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowLeft" });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			const active = document.activeElement as HTMLElement;
			expect(active.tagName).toBe("INPUT");
			expect((active as HTMLInputElement).type).toBe("checkbox");
		});

		it("Space toggles selection once focus is delegated to the row checkbox", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} onSelectionChange={onSelectionChange} />,
			);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowLeft" });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			const active = document.activeElement as HTMLElement;
			fireEvent.keyDown(active, { key: " " });
			expect(onSelectionChange).toHaveBeenCalled();
		});

		it("ArrowUp from the first body row moves focus into the columnheader row", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			// Default focused cell is the header row (col 1, a sortable column).
			// Move down into the body, then back up into the header row.
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowUp" });
			const active = document.activeElement as HTMLElement;
			// Focus should now be on a columnheader cell in the header row.
			expect(active.closest("thead")).not.toBeNull();
			expect(active.getAttribute("role")).toBe("columnheader");
		});

		it("Enter on a focused sortable columnheader triggers a sort", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			// Header row col 1 (Company, sortable) is the initial roving cell.
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowUp" });
			const header = document.activeElement as HTMLElement;
			expect(header.getAttribute("role")).toBe("columnheader");
			fireEvent.keyDown(header, { key: "Enter" });
			expect(header.textContent).toMatch(/▲|▼/);
		});
	});

	// ── 01-14: E7 / F-13-1 / F-13-2 ───────────────────────────────────────────
	//
	// Five hardcoded values became props. Every case below exists because the
	// value it asserts used to be unreachable from outside the component.

	describe("density (E7)", () => {
		it("passes a consumer density through to the inner table", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} density="cozy" />);
			expect(container.querySelector("table")?.getAttribute("data-density")).toBe("cozy");
		});

		it("still renders comfortable when density is omitted", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			expect(container.querySelector("table")?.getAttribute("data-density")).toBe("comfortable");
		});

		it("accepts every density the inner Table accepts, so the passthrough cannot drift", () => {
			for (const d of ["cozy", "comfortable", "spacious"] as const) {
				const { container } = render(<DataGrid columns={COLS} rows={ROWS} density={d} />);
				expect(container.querySelector("table")?.getAttribute("data-density")).toBe(d);
			}
		});
	});

	describe("selectable (E7)", () => {
		it("renders neither the select-all cell nor any row checkbox when false", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} selectable={false} />);
			expect(container.querySelectorAll(".ds-atom-table-selectcell").length).toBe(0);
			expect(container.querySelectorAll('input[type="checkbox"]').length).toBe(0);
		});

		it("drops exactly one cell from the header and from every body row", () => {
			const on = render(<DataGrid columns={COLS} rows={ROWS} />);
			const off = render(<DataGrid columns={COLS} rows={ROWS} selectable={false} />);
			const heads = (c: HTMLElement) => c.querySelectorAll("thead tr th").length;
			const firstRow = (c: HTMLElement) =>
				(c.querySelectorAll("tbody tr")[0] as HTMLElement).children.length;
			expect(heads(on.container)).toBe(COLS.length + 1);
			expect(heads(off.container)).toBe(COLS.length);
			expect(firstRow(on.container)).toBe(COLS.length + 1);
			expect(firstRow(off.container)).toBe(COLS.length);
		});

		it("keeps header and body cell counts equal with the selection column off", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} selectable={false} />);
			const heads = container.querySelectorAll("thead tr th").length;
			for (const tr of container.querySelectorAll("tbody tr")) {
				expect(tr.children.length).toBe(heads);
			}
		});

		it("keeps the loading row's colSpan aligned with the visible column count", () => {
			const off = render(<DataGrid columns={COLS} rows={[]} loading selectable={false} />);
			expect(off.container.querySelector("td")?.getAttribute("colspan")).toBe(String(COLS.length));
			const on = render(<DataGrid columns={COLS} rows={[]} loading />);
			expect(on.container.querySelector("td")?.getAttribute("colspan")).toBe(
				String(COLS.length + 1),
			);
		});

		it("never calls onSelectionChange when the selection column is off", () => {
			const onSelectionChange = vi.fn();
			const { container } = render(
				<DataGrid
					columns={COLS}
					rows={ROWS}
					selectable={false}
					onSelectionChange={onSelectionChange}
				/>,
			);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			const cell = (container.querySelectorAll("tbody tr")[0] as HTMLElement)
				.children[0] as HTMLElement;
			cell.focus();
			fireEvent.keyDown(cell, { key: " " });
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: " " });
			expect(onSelectionChange).not.toHaveBeenCalled();
			expect(container.querySelector(".ds-atom-datagrid-bulkbar")).toBeNull();
		});

		it("moves the roving focus origin to the first data column when the checkbox column is gone", () => {
			// The +1 offset in the roving model is the checkbox column. With it gone
			// the offset must go too, or every arrow key lands one column right.
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} selectable={false} />);
			const wrapper = container.querySelector<HTMLDivElement>(".ds-atom-datagrid");
			fireEvent.keyDown(wrapper as HTMLDivElement, { key: "ArrowDown" });
			const active = document.activeElement as HTMLElement;
			expect(active.tagName).toBe("TD");
			expect(active.textContent).toBe("Stripe");
		});
	});

	describe("ariaLabel (F-13-1)", () => {
		it("puts a consumer-supplied accessible name on the grid", () => {
			render(<DataGrid columns={COLS} rows={ROWS} ariaLabel="Photos" />);
			expect(screen.getByRole("grid", { name: "Photos" })).toBeInTheDocument();
		});

		it("does not announce itself as a job-application table when the name is omitted", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} />);
			const label = container.querySelector("table")?.getAttribute("aria-label");
			expect(label).not.toBe("Job applications");
			// A grid with no accessible name at all is worse than a generic one.
			expect(label).toBeTruthy();
		});
	});

	describe("pagination (F-13-3)", () => {
		it("renders no pager when pagination is false", () => {
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} pagination={false} totalPages={3} page={1} />,
			);
			expect(container.querySelector("nav")).toBeNull();
			expect(container.querySelector(".ds-atom-pagination-btn")).toBeNull();
		});

		it("keeps the row count in the footer with the pager suppressed", () => {
			const { container } = render(<DataGrid columns={COLS} rows={ROWS} pagination={false} />);
			expect(container.querySelector(".ds-atom-datagrid-footer-count")?.textContent).toBe(
				`${ROWS.length} rows`,
			);
		});

		it("lets a single-page grid suppress the pager without losing onPageChange", () => {
			// pagination is independent of the paging props: a consumer may own its
			// own pager and still want DataGrid's page callbacks wired.
			const onPageChange = vi.fn();
			const { container } = render(
				<DataGrid
					columns={COLS}
					rows={ROWS}
					pagination={false}
					totalPages={1}
					page={1}
					onPageChange={onPageChange}
				/>,
			);
			expect(container.querySelector("nav")).toBeNull();
			expect(onPageChange).not.toHaveBeenCalled();
		});

		it("still renders the pager when pagination is omitted", () => {
			const { container } = render(
				<DataGrid columns={COLS} rows={ROWS} totalPages={3} page={1} onPageChange={vi.fn()} />,
			);
			expect(container.querySelector("nav")).not.toBeNull();
		});
	});

	describe("the new props are inert at their defaults", () => {
		it("passing every new prop at its documented default renders identically to passing none", () => {
			// The regression guard for the whole change: every existing call site
			// passes none of these, so the default render must not move.
			const none = render(<DataGrid columns={COLS} rows={ROWS} totalPages={3} page={1} />);
			const explicit = render(
				<DataGrid
					columns={COLS}
					rows={ROWS}
					totalPages={3}
					page={1}
					density="comfortable"
					selectable={true}
					pagination={true}
					ariaLabel="Data grid"
				/>,
			);
			// React's useId counter advances between the two renders, so the
			// checkbox ids differ by construction. Everything else must match.
			const norm = (h: string) => h.replace(/_r_[0-9a-z]+_/g, "_id_");
			expect(norm(explicit.container.innerHTML)).toBe(norm(none.container.innerHTML));
		});
	});

	describe("ReactNode cells (F-13-2)", () => {
		const PLAIN: DataGridColumn[] = [
			{ key: "company", label: "Company", width: 150 },
			{ key: "status", label: "Status", width: 110 },
		];

		it("renders a React element cell value as that element, not its string coercion", () => {
			const rows: DataGridRow[] = [
				{ id: 1, company: <em data-testid="node">Stripe</em>, status: "queued" },
			];
			render(<DataGrid columns={PLAIN} rows={rows} />);
			const el = screen.getByTestId("node");
			expect(el.tagName).toBe("EM");
			expect(document.body.textContent).not.toContain("[object Object]");
		});

		it("renders string, number, null and undefined cell values exactly as before", () => {
			const cols: DataGridColumn[] = [
				{ key: "s", label: "S", width: 80 },
				{ key: "n", label: "N", width: 80 },
				{ key: "z", label: "Z", width: 80 },
				{ key: "nul", label: "Nul", width: 80 },
				{ key: "und", label: "Und", width: 80 },
			];
			const rows: DataGridRow[] = [{ id: 1, s: "text", n: 42, z: 0, nul: null, und: undefined }];
			const { container } = render(<DataGrid columns={cols} rows={rows} selectable={false} />);
			const cells = Array.from(container.querySelectorAll("tbody tr td")).map(
				(td) => td.textContent,
			);
			expect(cells).toEqual(["text", "42", "0", "", ""]);
		});

		it("lets a column's render() put a Badge in ANY column, not only one keyed status", () => {
			const cols: DataGridColumn[] = [
				{
					key: "company",
					label: "Company",
					width: 150,
					render: (v) => <span data-testid="anycol-badge">{String(v)}</span>,
				},
			];
			render(<DataGrid columns={cols} rows={[{ id: 1, company: "Stripe" }]} />);
			expect(screen.getByTestId("anycol-badge").textContent).toBe("Stripe");
		});

		it("no longer routes a column keyed status through the job-domain badge map", () => {
			// The finding: a consumer's `status` column silently became a
			// job-application badge, and every value outside the four job keys
			// collapsed to tone="neutral".
			const { container } = render(
				<DataGrid
					columns={PLAIN}
					rows={[{ id: 1, company: "Stripe", status: "interviewing" }]}
					selectable={false}
				/>,
			);
			const cell = container.querySelectorAll("tbody tr td")[1] as HTMLElement;
			expect(cell.textContent).toBe("interviewing");
			expect(cell.children.length).toBe(0);
		});

		it("no longer routes a column keyed priority through the job-domain dot map", () => {
			const cols: DataGridColumn[] = [{ key: "priority", label: "Priority", width: 90 }];
			const { container } = render(
				<DataGrid columns={cols} rows={[{ id: 1, priority: "high" }]} selectable={false} />,
			);
			const cell = container.querySelector("tbody tr td") as HTMLElement;
			expect(cell.textContent).toBe("high");
			expect(cell.querySelector('[data-part="priority-dot"]')).toBeNull();
		});

		it("reproduces the old badge behaviour for a column that opts into the preset", () => {
			const cols: DataGridColumn[] = [
				{ key: "status", label: "Status", width: 110, render: dataGridPresets.statusBadge },
			];
			render(
				<DataGrid
					columns={cols}
					rows={[
						{ id: 1, status: "interviewing" },
						{ id: 2, status: "applied" },
						{ id: 3, status: "offer" },
						{ id: 4, status: "rejected" },
					]}
				/>,
			);
			for (const label of ["Interview", "Applied", "Offer", "Rejected"]) {
				expect(screen.getByText(label)).toBeInTheDocument();
			}
		});

		it("reproduces the old priority-dot behaviour for a column that opts into the preset", () => {
			const cols: DataGridColumn[] = [
				{ key: "priority", label: "Priority", width: 90, render: dataGridPresets.priorityDot },
			];
			const { container } = render(
				<DataGrid columns={cols} rows={[{ id: 1, priority: "high" }]} />,
			);
			const dot = container.querySelector<HTMLElement>('[data-part="priority-dot"]');
			expect(dot).not.toBeNull();
			expect(dot?.style.background).toContain("--red-vivid");
		});

		it("renders an opted-in status value outside the four job keys as that value", () => {
			const cols: DataGridColumn[] = [
				{ key: "status", label: "Status", width: 110, render: dataGridPresets.statusBadge },
			];
			render(<DataGrid columns={cols} rows={[{ id: 1, status: "published" }]} />);
			expect(screen.getByText("published")).toBeInTheDocument();
		});
	});
});
