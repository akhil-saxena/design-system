import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table } from "../data-display/Table";

/**
 * The ARIA grid keyboard contract on Table.
 *
 * Table declares `role="grid"` whenever `multiSelectable` is set — it must, since
 * `aria-multiselectable` is invalid on a plain `table` role. Declaring `grid` also
 * promises arrow-key navigation, and Table implemented none of it: every focusable
 * cell was its own tab stop and no arrow key did anything.
 */
function Grid({ multiSelectable = true }: { multiSelectable?: boolean }) {
	return (
		<Table.Root ariaLabel="Users" multiSelectable={multiSelectable}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Role</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>Ada</Table.Cell>
					<Table.Cell>Admin</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Grace</Table.Cell>
					<Table.Cell>Editor</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	);
}

const grid = () => screen.getByRole("grid");
const cell = (text: string) => screen.getByText(text);

describe("Table grid keyboard navigation", () => {
	it("exposes exactly one tab stop, not one per cell", () => {
		const { container } = render(<Grid />);
		expect(container.querySelectorAll("[tabindex='0']")).toHaveLength(1);
	});

	it("moves between columns and rows with the arrow keys", () => {
		render(<Grid />);
		fireEvent.keyDown(grid(), { key: "ArrowRight" });
		expect(document.activeElement).toBe(cell("Role"));
		fireEvent.keyDown(grid(), { key: "ArrowDown" });
		expect(document.activeElement).toBe(cell("Admin"));
		fireEvent.keyDown(grid(), { key: "ArrowLeft" });
		expect(document.activeElement).toBe(cell("Ada"));
	});

	it("treats header and body as one continuous grid", () => {
		// ArrowUp from the first body row must reach the column header rather than
		// dead-ending at the top of <tbody>.
		render(<Grid />);
		fireEvent.keyDown(grid(), { key: "ArrowDown" });
		expect(document.activeElement).toBe(cell("Ada"));
		fireEvent.keyDown(grid(), { key: "ArrowUp" });
		expect(document.activeElement).toBe(cell("Name"));
	});

	it("does not run past the edges", () => {
		render(<Grid />);
		for (let i = 0; i < 5; i++) fireEvent.keyDown(grid(), { key: "ArrowUp" });
		expect(document.activeElement).toBe(cell("Name"));
		for (let i = 0; i < 9; i++) fireEvent.keyDown(grid(), { key: "ArrowDown" });
		expect(document.activeElement).toBe(cell("Grace"));
	});

	it("Home and End move within the row; Ctrl extends to the grid", () => {
		render(<Grid />);
		fireEvent.keyDown(grid(), { key: "End" });
		expect(document.activeElement).toBe(cell("Role"));
		fireEvent.keyDown(grid(), { key: "Home" });
		expect(document.activeElement).toBe(cell("Name"));
		fireEvent.keyDown(grid(), { key: "End", ctrlKey: true });
		expect(document.activeElement).toBe(cell("Editor"));
		fireEvent.keyDown(grid(), { key: "Home", ctrlKey: true });
		expect(document.activeElement).toBe(cell("Name"));
	});

	it("leaves keys it does not own alone", () => {
		// Tab, Enter, Space and typing must still reach the cell and its controls.
		render(<Grid />);
		const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
		grid().dispatchEvent(e);
		expect(e.defaultPrevented).toBe(false);
	});

	it("stays inert on a plain table, which is static content", () => {
		// Without role="grid" the arrow keys belong to the screen reader's own
		// reading cursor; hijacking them would be a regression, not a feature.
		const { container } = render(<Grid multiSelectable={false} />);
		expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
		fireEvent.keyDown(container.querySelector("table") as HTMLElement, { key: "ArrowDown" });
		expect(document.activeElement).toBe(document.body);
	});
});
