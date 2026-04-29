/**
 * useTableSelection (DS-61, D-17-09) — unit tests
 *
 * Hook: returns { selectedIds, isAllSelected, isIndeterminate, isSelected, toggle, toggleAll, clear }
 * Tests: modes, indeterminate, controlled/uncontrolled, edge cases
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTableSelection } from "./useTableSelection";

// ── Harness ───────────────────────────────────────────────────────────────────

type Id = number;

function Harness({
	ids,
	mode,
	defaultSelected,
	selectedIds: controlledIds,
	onSelectionChange,
}: {
	ids: Id[];
	mode?: "single" | "multi";
	defaultSelected?: Id[];
	selectedIds?: Id[];
	onSelectionChange?: (ids: Id[]) => void;
}) {
	const { selectedIds, isAllSelected, isIndeterminate, isSelected, toggle, toggleAll, clear } =
		useTableSelection(ids, {
			mode,
			defaultSelected,
			selectedIds: controlledIds,
			onSelectionChange,
		});
	return (
		<div>
			<div data-testid="selected">{JSON.stringify(selectedIds)}</div>
			<div data-testid="isAllSelected">{String(isAllSelected)}</div>
			<div data-testid="isIndeterminate">{String(isIndeterminate)}</div>
			{ids.map((id) => (
				<div key={id} data-testid={`isSelected-${id}`}>
					{String(isSelected(id))}
				</div>
			))}
			<button onClick={() => toggle(1)} data-testid="toggle-1">
				toggle 1
			</button>
			<button onClick={() => toggle(2)} data-testid="toggle-2">
				toggle 2
			</button>
			<button onClick={() => toggle(3)} data-testid="toggle-3">
				toggle 3
			</button>
			<button onClick={() => toggleAll()} data-testid="toggleAll">
				toggle all
			</button>
			<button onClick={() => clear()} data-testid="clear">
				clear
			</button>
		</div>
	);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useTableSelection", () => {
	const ids = [1, 2, 3];

	// ── Initial state ──────────────────────────────────────────────────────

	it("default mode is multi: starts empty", () => {
		render(<Harness ids={ids} />);
		expect(screen.getByTestId("selected").textContent).toBe("[]");
		expect(screen.getByTestId("isAllSelected").textContent).toBe("false");
		expect(screen.getByTestId("isIndeterminate").textContent).toBe("false");
	});

	it("defaultSelected seeds initial state", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2]} />);
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([1, 2]);
	});

	// ── toggle in multi mode ───────────────────────────────────────────────

	it("toggle adds id when not selected", () => {
		render(<Harness ids={ids} />);
		fireEvent.click(screen.getByTestId("toggle-1"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([1]);
	});

	it("toggle removes id when already selected", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2]} />);
		fireEvent.click(screen.getByTestId("toggle-1"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([2]);
	});

	// ── single mode ────────────────────────────────────────────────────────

	it("single mode: toggle replaces previously-selected id", () => {
		render(<Harness ids={ids} mode="single" defaultSelected={[1]} />);
		fireEvent.click(screen.getByTestId("toggle-2"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([2]);
	});

	it("single mode: toggle same id deselects it", () => {
		render(<Harness ids={ids} mode="single" defaultSelected={[1]} />);
		fireEvent.click(screen.getByTestId("toggle-1"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([]);
	});

	// ── toggleAll ─────────────────────────────────────────────────────────

	it("toggleAll: empty → all selected", () => {
		render(<Harness ids={ids} />);
		fireEvent.click(screen.getByTestId("toggleAll"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([1, 2, 3]);
	});

	it("toggleAll: all → empty (deselect)", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2, 3]} />);
		fireEvent.click(screen.getByTestId("toggleAll"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([]);
	});

	it("toggleAll: partial → all selected", () => {
		render(<Harness ids={ids} defaultSelected={[1]} />);
		fireEvent.click(screen.getByTestId("toggleAll"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([1, 2, 3]);
	});

	it("toggleAll: is no-op in single mode", () => {
		render(<Harness ids={ids} mode="single" defaultSelected={[1]} />);
		fireEvent.click(screen.getByTestId("toggleAll"));
		// Single mode: no change
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([1]);
	});

	// ── derived state ──────────────────────────────────────────────────────

	it("isAllSelected=true when all ids are selected", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2, 3]} />);
		expect(screen.getByTestId("isAllSelected").textContent).toBe("true");
	});

	it("isAllSelected=false when only partial selection", () => {
		render(<Harness ids={ids} defaultSelected={[1]} />);
		expect(screen.getByTestId("isAllSelected").textContent).toBe("false");
	});

	it("isIndeterminate=true when partial selection", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2]} />);
		expect(screen.getByTestId("isIndeterminate").textContent).toBe("true");
	});

	it("isIndeterminate=false when empty", () => {
		render(<Harness ids={ids} />);
		expect(screen.getByTestId("isIndeterminate").textContent).toBe("false");
	});

	it("isIndeterminate=false when fully selected", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2, 3]} />);
		expect(screen.getByTestId("isIndeterminate").textContent).toBe("false");
	});

	it("isSelected returns true for selected id, false for others", () => {
		render(<Harness ids={ids} defaultSelected={[2]} />);
		expect(screen.getByTestId("isSelected-1").textContent).toBe("false");
		expect(screen.getByTestId("isSelected-2").textContent).toBe("true");
		expect(screen.getByTestId("isSelected-3").textContent).toBe("false");
	});

	// ── clear ──────────────────────────────────────────────────────────────

	it("clear empties selection", () => {
		render(<Harness ids={ids} defaultSelected={[1, 2]} />);
		fireEvent.click(screen.getByTestId("clear"));
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([]);
	});

	// ── controlled mode ────────────────────────────────────────────────────

	it("controlled mode: selectedIds prop wins over internal state", () => {
		const onSelectionChange = vi.fn();
		render(<Harness ids={ids} selectedIds={[3]} onSelectionChange={onSelectionChange} />);
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([3]);
	});

	it("controlled mode: toggle fires onSelectionChange", () => {
		const onSelectionChange = vi.fn();
		render(<Harness ids={ids} selectedIds={[]} onSelectionChange={onSelectionChange} />);
		fireEvent.click(screen.getByTestId("toggle-1"));
		expect(onSelectionChange).toHaveBeenCalledWith([1]);
	});

	it("controlled mode: selectedIds does not change internal state (no re-render side effect)", () => {
		const onSelectionChange = vi.fn();
		render(<Harness ids={ids} selectedIds={[2]} onSelectionChange={onSelectionChange} />);
		fireEvent.click(screen.getByTestId("toggle-1"));
		// Controlled: displayed value stays [2] since parent didn't update the prop
		expect(JSON.parse(screen.getByTestId("selected").textContent!)).toEqual([2]);
		// In multi mode: selectedIds=[2], adding 1 → [...selectedIds, 1] = [2, 1]
		expect(onSelectionChange).toHaveBeenCalledWith([2, 1]);
	});

	// ── empty ids ─────────────────────────────────────────────────────────

	it("isAllSelected=false when ids array is empty", () => {
		render(<Harness ids={[]} />);
		expect(screen.getByTestId("isAllSelected").textContent).toBe("false");
	});
});
