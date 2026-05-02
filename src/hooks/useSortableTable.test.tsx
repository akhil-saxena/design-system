/**
 * useSortableTable (DS-61, D-17-07) - unit tests
 *
 * Hook: returns { sorted, sortCol, sortDir, toggleSort }
 * Tests: toggle, comparator, defaults, stable sort, null handling
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSortableTable } from "./useSortableTable";

// ── Fixture ───────────────────────────────────────────────────────────────────

type Row = { id: number; name: string; age: number | null };

const rows: Row[] = [
	{ id: 1, name: "Bob", age: 30 },
	{ id: 2, name: "Alice", age: 25 },
	{ id: 3, name: "Carol", age: 35 },
];

// ── Harness ───────────────────────────────────────────────────────────────────

function Harness({
	defaultCol,
	defaultDir,
	customComparator,
	inputRows = rows,
}: {
	defaultCol?: keyof Row;
	defaultDir?: "asc" | "desc";
	customComparator?: (a: Row, b: Row, col: keyof Row) => number;
	inputRows?: Row[];
}) {
	const { sorted, sortCol, sortDir, toggleSort } = useSortableTable(inputRows, {
		defaultCol,
		defaultDir,
		comparator: customComparator,
	});
	return (
		<div>
			<div data-testid="col">{String(sortCol)}</div>
			<div data-testid="dir">{sortDir}</div>
			<ul>
				{sorted.map((r) => (
					<li key={r.id} data-testid="row" data-id={r.id}>
						{r.name}
					</li>
				))}
			</ul>
			<button onClick={() => toggleSort("name")}>sort-name</button>
			<button onClick={() => toggleSort("age")}>sort-age</button>
		</div>
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useSortableTable", () => {
	it("returns rows unchanged when no defaultCol (sortCol is null)", () => {
		render(<Harness />);
		expect(screen.getByTestId("col").textContent).toBe("null");
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		expect(items).toEqual(["Bob", "Alice", "Carol"]);
	});

	it("defaultCol option seeds initial sorted order (asc)", () => {
		render(<Harness defaultCol="name" />);
		expect(screen.getByTestId("col").textContent).toBe("name");
		expect(screen.getByTestId("dir").textContent).toBe("asc");
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		expect(items).toEqual(["Alice", "Bob", "Carol"]);
	});

	it("defaultDir='desc' applies descending order for defaultCol", () => {
		render(<Harness defaultCol="name" defaultDir="desc" />);
		expect(screen.getByTestId("dir").textContent).toBe("desc");
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		expect(items).toEqual(["Carol", "Bob", "Alice"]);
	});

	it("toggleSort flips asc → desc on same column", () => {
		render(<Harness defaultCol="name" />);
		expect(screen.getByTestId("dir").textContent).toBe("asc");
		fireEvent.click(screen.getByText("sort-name"));
		expect(screen.getByTestId("dir").textContent).toBe("desc");
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		expect(items).toEqual(["Carol", "Bob", "Alice"]);
	});

	it("toggleSort flips desc → asc on same column", () => {
		render(<Harness defaultCol="name" defaultDir="desc" />);
		fireEvent.click(screen.getByText("sort-name"));
		expect(screen.getByTestId("dir").textContent).toBe("asc");
	});

	it("toggleSort changes col and resets dir to asc", () => {
		render(<Harness defaultCol="name" defaultDir="desc" />);
		// Switch to age col - dir should reset to asc
		fireEvent.click(screen.getByText("sort-age"));
		expect(screen.getByTestId("col").textContent).toBe("age");
		expect(screen.getByTestId("dir").textContent).toBe("asc");
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		// age asc: Alice(25), Bob(30), Carol(35)
		expect(items).toEqual(["Alice", "Bob", "Carol"]);
	});

	it("asc and desc directions sort oppositely", () => {
		const { unmount: u1 } = render(<Harness defaultCol="name" defaultDir="asc" />);
		const asc = screen.getAllByTestId("row").map((el) => el.textContent);
		u1();
		render(<Harness defaultCol="name" defaultDir="desc" />);
		const desc = screen.getAllByTestId("row").map((el) => el.textContent);
		expect(desc).toEqual([...asc].reverse());
	});

	it("custom comparator overrides default", () => {
		// custom comparator: reverse-alphabetical by name
		const revComp = (a: Row, b: Row, col: keyof Row) => {
			const av = a[col] as string;
			const bv = b[col] as string;
			return av > bv ? -1 : av < bv ? 1 : 0;
		};
		render(<Harness defaultCol="name" customComparator={revComp} />);
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		// reverse-alphabetical: Carol, Bob, Alice (desc ordering by custom)
		expect(items).toEqual(["Carol", "Bob", "Alice"]);
	});

	it("null values sort first (before non-null)", () => {
		const rowsWithNull: Row[] = [
			{ id: 1, name: "Bob", age: 30 },
			{ id: 2, name: "Alice", age: null },
			{ id: 3, name: "Carol", age: 25 },
		];
		render(<Harness defaultCol="age" inputRows={rowsWithNull} />);
		const items = screen.getAllByTestId("row").map((el) => el.textContent);
		// null sorts first, then Carol(25), Bob(30)
		expect(items[0]).toBe("Alice"); // null age → first
	});

	it("sort is stable: equal-value rows preserve original order", () => {
		const sameAge: Row[] = [
			{ id: 1, name: "Bob", age: 30 },
			{ id: 2, name: "Alice", age: 30 },
			{ id: 3, name: "Carol", age: 30 },
		];
		render(<Harness defaultCol="age" inputRows={sameAge} />);
		// All equal → stable sort preserves insertion order
		const ids = screen.getAllByTestId("row").map((el) => el.getAttribute("data-id"));
		expect(ids).toEqual(["1", "2", "3"]);
	});
});
