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
});
