/**
 * Tabs (DS-62) - unit tests
 *
 * Task 1: ARIA, keyboard navigation, variants, count badges, manual activation
 * Task 2: ResizeObserver overflow menu via DSDropdown
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type TabItem, Tabs } from ".";
// ── ResizeObserver global stub (required for all tests - jsdom has no ResizeObserver) ──

let resizeCallback: ResizeObserverCallback | null = null;

// Must be set up before any Tabs render. Using module-scope beforeEach so every test
// gets a fresh mock and the callback reference is captured.
beforeEach(() => {
	resizeCallback = null;
	const MockRO = vi.fn(function (this: unknown, cb: ResizeObserverCallback) {
		resizeCallback = cb;
		return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
	});
	globalThis.ResizeObserver = MockRO as unknown as typeof ResizeObserver;
});

// ── Test fixture ──────────────────────────────────────────────────────────────

const baseTabs: TabItem[] = [
	{ id: "a", label: "Alpha", content: <div>Alpha content</div> },
	{ id: "b", label: "Beta", content: <div>Beta content</div> },
	{ id: "c", label: "Gamma", content: <div>Gamma content</div> },
];

function ControlledTabs(props: Partial<React.ComponentProps<typeof Tabs>>) {
	const [value, setValue] = useState("a");
	return (
		<Tabs tabs={baseTabs} value={value} onChange={setValue} ariaLabel="Test tabs" {...props} />
	);
}

// ── Task 1: ARIA structure ────────────────────────────────────────────────────

describe("Tabs - ARIA structure", () => {
	it("renders role=tablist with aria-orientation=horizontal", () => {
		render(<ControlledTabs />);
		const tablist = screen.getByRole("tablist");
		expect(tablist).toBeInTheDocument();
		expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
	});

	it("renders one role=tab per item", () => {
		render(<ControlledTabs />);
		const tabs = screen.getAllByRole("tab");
		expect(tabs).toHaveLength(3);
	});

	it("renders one role=tabpanel per item; hidden except active", () => {
		render(<ControlledTabs />);
		const panels = screen.getAllByRole("tabpanel", { hidden: true });
		expect(panels).toHaveLength(3);
		// First panel is active (not hidden)
		const activePanel = screen.getByRole("tabpanel");
		expect(activePanel).not.toHaveAttribute("hidden");
		// Other panels are hidden
		const hiddenPanels = panels.filter((p) => p.hasAttribute("hidden"));
		expect(hiddenPanels).toHaveLength(2);
	});

	/**
	 * F-15-6: the inactive panels were rendered with their CHILDREN OMITTED — the
	 * element present, the content not. Every panel's children now render and the
	 * inactive ones are hidden presentationally instead.
	 *
	 * These two cases are the client-side half. The server-rendered half, which is
	 * the whole point of the finding, is asserted on react-dom/server output in
	 * src/smoke.test.tsx — a client-side test proves nothing about server output.
	 */
	it("renders EVERY panel's children, not only the active panel's", () => {
		render(<ControlledTabs />);
		// getAllByText, not getByRole: the content of a `hidden` panel is correctly
		// absent from the accessibility tree, so a role query cannot see it. It is
		// in the DOM, which is what a crawler and a no-JS reader read.
		expect(screen.getByText("Alpha content")).toBeInTheDocument();
		expect(screen.getByText("Beta content")).toBeInTheDocument();
		expect(screen.getByText("Gamma content")).toBeInTheDocument();
	});

	it("exposes exactly one panel to the accessibility tree and the tab order", () => {
		// Rendering everything must not become exposing everything. `hidden` removes
		// the inactive panels from both, which is what the WAI-ARIA tabs pattern
		// requires; visibility/opacity would leave them in the tab order.
		render(<ControlledTabs />);
		const exposed = screen.getAllByRole("tabpanel");
		expect(exposed).toHaveLength(1);
		expect(exposed[0]).toHaveAttribute("aria-labelledby");
		// Nothing sets aria-hidden — `hidden` is the mechanism, and an explicit
		// aria-hidden="false" beside it would be redundant surface axe flags.
		for (const p of screen.getAllByRole("tabpanel", { hidden: true })) {
			expect(p).not.toHaveAttribute("aria-hidden");
		}
	});

	it("switching tabs moves which panel is exposed without unmounting the others", () => {
		render(<ControlledTabs />);
		fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
		const exposed = screen.getAllByRole("tabpanel");
		expect(exposed).toHaveLength(1);
		expect(exposed[0]).toContainElement(screen.getByText("Beta content"));
		// All three subtrees are still in the DOM: the panels are hidden, not torn
		// down and rebuilt, which is the cost this change accepts deliberately.
		expect(screen.getByText("Alpha content")).toBeInTheDocument();
		expect(screen.getByText("Gamma content")).toBeInTheDocument();
	});

	it("active tab has aria-selected=true, others false", () => {
		render(<ControlledTabs />);
		const [alpha, beta, gamma] = screen.getAllByRole("tab");
		expect(alpha).toHaveAttribute("aria-selected", "true");
		expect(beta).toHaveAttribute("aria-selected", "false");
		expect(gamma).toHaveAttribute("aria-selected", "false");
	});

	it("tab aria-controls matches panel id", () => {
		render(<ControlledTabs />);
		const [alpha] = screen.getAllByRole("tab");
		const panelId = alpha!.getAttribute("aria-controls")!;
		expect(document.getElementById(panelId)).toBeInTheDocument();
	});
});

// ── Task 1: Click activation ──────────────────────────────────────────────────

describe("Tabs - click activation", () => {
	it("clicking a tab fires onChange with that tab id", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={baseTabs} value="a" onChange={onChange} ariaLabel="T" />);
		fireEvent.click(screen.getAllByRole("tab")[1]!);
		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("clicking a disabled tab does NOT fire onChange", () => {
		const onChange = vi.fn();
		const tabs: TabItem[] = [
			{ id: "a", label: "Alpha", content: null },
			{ id: "b", label: "Beta", content: null, disabled: true },
		];
		render(<Tabs tabs={tabs} value="a" onChange={onChange} ariaLabel="T" />);
		fireEvent.click(screen.getAllByRole("tab")[1]!);
		expect(onChange).not.toHaveBeenCalled();
	});
});

// ── Task 1: Keyboard navigation (automatic mode) ──────────────────────────────

describe("Tabs - keyboard navigation (automatic)", () => {
	it("ArrowRight cycles to next tab and calls onChange", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={baseTabs} value="a" onChange={onChange} ariaLabel="T" />);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowRight" });
		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("ArrowLeft from first tab wraps to last tab", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={baseTabs} value="a" onChange={onChange} ariaLabel="T" />);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowLeft" });
		expect(onChange).toHaveBeenCalledWith("c");
	});

	it("Home jumps to first tab", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={baseTabs} value="c" onChange={onChange} ariaLabel="T" />);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "Home" });
		expect(onChange).toHaveBeenCalledWith("a");
	});

	it("End jumps to last tab", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={baseTabs} value="a" onChange={onChange} ariaLabel="T" />);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "End" });
		expect(onChange).toHaveBeenCalledWith("c");
	});

	it("ArrowRight skips disabled tabs", () => {
		const onChange = vi.fn();
		const tabs: TabItem[] = [
			{ id: "a", label: "Alpha", content: null },
			{ id: "b", label: "Beta", content: null, disabled: true },
			{ id: "c", label: "Gamma", content: null },
		];
		render(<Tabs tabs={tabs} value="a" onChange={onChange} ariaLabel="T" />);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowRight" });
		// Should skip "b" (disabled) and go to "c"
		expect(onChange).toHaveBeenCalledWith("c");
	});
});

// ── Task 1: Manual activation mode ───────────────────────────────────────────

describe("Tabs - manual activation mode", () => {
	it("ArrowRight moves focus but does NOT call onChange in manual mode", () => {
		const onChange = vi.fn();
		render(
			<Tabs tabs={baseTabs} value="a" onChange={onChange} ariaLabel="T" activationMode="manual" />,
		);
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowRight" });
		expect(onChange).not.toHaveBeenCalled();
	});
});

// ── Task 1: Count badge ───────────────────────────────────────────────────────

describe("Tabs - count badge", () => {
	it("renders count badge when count is set", () => {
		const tabs: TabItem[] = [
			{ id: "a", label: "Alpha", count: 42, content: null },
			{ id: "b", label: "Beta", content: null },
		];
		render(<Tabs tabs={tabs} value="a" onChange={vi.fn()} ariaLabel="T" />);
		expect(screen.getByText("42")).toBeInTheDocument();
	});

	it("does NOT render count badge when count is absent", () => {
		render(<ControlledTabs />);
		// No count badges in base tabs
		const counts = document.querySelectorAll(".ds-atom-tabs-count");
		expect(counts).toHaveLength(0);
	});
});

// ── Task 1: Visual variants ───────────────────────────────────────────────────

describe("Tabs - variants", () => {
	it("defaults to underline variant (data-variant=underline on root)", () => {
		render(<ControlledTabs />);
		const root = document.querySelector(".ds-atom-tabs");
		expect(root).toHaveAttribute("data-variant", "underline");
	});

	it("pill variant applies data-variant=pill on root", () => {
		render(<ControlledTabs variant="pill" />);
		const root = document.querySelector(".ds-atom-tabs");
		expect(root).toHaveAttribute("data-variant", "pill");
	});
});

// ── Task 2: ResizeObserver overflow menu ─────────────────────────────────────

const manyTabs: TabItem[] = [
	{ id: "1", label: "Tab One", content: <div>One</div> },
	{ id: "2", label: "Tab Two", content: <div>Two</div> },
	{ id: "3", label: "Tab Three", content: <div>Three</div> },
	{ id: "4", label: "Tab Four", content: <div>Four</div> },
	{ id: "5", label: "Tab Five", content: <div>Five</div> },
	{ id: "6", label: "Tab Six", content: <div>Six</div> },
];

/** Helper - simulate a narrow container so tabs overflow */
function simulateOverflow() {
	const tablist = document.querySelector("[role='tablist']")!;
	Object.defineProperty(tablist, "clientWidth", { value: 200, configurable: true });
	const tabButtons = tablist.querySelectorAll<HTMLButtonElement>("[role='tab']");
	for (const btn of tabButtons) {
		Object.defineProperty(btn, "offsetWidth", { value: 60, configurable: true });
	}
	act(() => {
		resizeCallback?.(
			[{ contentRect: { width: 200 } } as ResizeObserverEntry],
			{} as ResizeObserver,
		);
	});
}

describe("Tabs - overflow menu (ResizeObserver)", () => {
	it("does NOT render More button when all tabs fit", () => {
		render(<Tabs tabs={manyTabs} value="1" onChange={vi.fn()} ariaLabel="T" />);
		// Default: visibleCount = tabs.length, no more button
		expect(screen.queryByRole("button", { name: /more tabs/i })).not.toBeInTheDocument();
	});

	it("renders More button when tabs overflow (simulated via ResizeObserver)", () => {
		render(<Tabs tabs={manyTabs} value="1" onChange={vi.fn()} ariaLabel="T" />);
		simulateOverflow();
		expect(screen.getByRole("button", { name: /more tabs/i })).toBeInTheDocument();
	});

	it("clicking More button opens the overflow dropdown", () => {
		render(<Tabs tabs={manyTabs} value="1" onChange={vi.fn()} ariaLabel="T" />);
		simulateOverflow();

		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		fireEvent.click(moreBtn);

		// DSDropdown content should appear (hidden tabs via menu role)
		expect(screen.getByRole("menu")).toBeInTheDocument();
	});

	it("clicking a hidden tab in the menu fires onChange and closes menu", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={manyTabs} value="1" onChange={onChange} ariaLabel="T" />);
		simulateOverflow();

		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		fireEvent.click(moreBtn);

		// Find and click the first hidden tab's button inside menuitem
		const menuItems = screen.getAllByRole("menuitem");
		const firstHiddenBtn = menuItems[0]!.querySelector("button")!;
		fireEvent.click(firstHiddenBtn);

		expect(onChange).toHaveBeenCalled();
		// Menu should close
		expect(screen.queryByRole("menu")).not.toBeInTheDocument();
	});
});

// ── Task: overflow keyboard reachability (a11y fix) ──────────────────────────

/**
 * Deterministic partial overflow: set the ROOT clientWidth (measure() reads the
 * root, not the tablist) so a known number of tabs stay visible. With root=200,
 * MORE_WIDTH=44 and tab=60 → available=156 fits exactly 2 tabs ("1","2");
 * "3".."6" overflow into the More menu.
 */
function simulatePartialOverflow() {
	const root = document.querySelector(".ds-atom-tabs") as HTMLElement;
	const tablist = document.querySelector("[role='tablist']") as HTMLElement;
	Object.defineProperty(root, "clientWidth", { value: 200, configurable: true });
	const tabButtons = tablist.querySelectorAll<HTMLButtonElement>("[role='tab']");
	for (const btn of tabButtons) {
		Object.defineProperty(btn, "offsetWidth", { value: 60, configurable: true });
	}
	act(() => {
		resizeCallback?.(
			[{ contentRect: { width: 200 } } as ResizeObserverEntry],
			{} as ResizeObserver,
		);
	});
}

describe("Tabs - overflow keyboard reachability", () => {
	it("when the active tab overflows into More, the More button is tabbable (tabIndex=0)", () => {
		// value "6" is hidden in the overflow menu when narrowed (only "1","2" fit).
		render(<Tabs tabs={manyTabs} value="6" onChange={vi.fn()} ariaLabel="T" />);
		simulatePartialOverflow();
		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		expect(moreBtn).toHaveAttribute("tabindex", "0");
		// And no visible tab is tabbable in that case.
		const visibleTabs = screen.getAllByRole("tab");
		for (const t of visibleTabs) {
			expect(t).toHaveAttribute("tabindex", "-1");
		}
	});

	it("when the active tab is visible, More is NOT in the Tab order (tabIndex=-1)", () => {
		render(<Tabs tabs={manyTabs} value="1" onChange={vi.fn()} ariaLabel="T" />);
		simulatePartialOverflow();
		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		expect(moreBtn).toHaveAttribute("tabindex", "-1");
	});

	it("ArrowRight from the last visible tab moves focus to the More button (roving stop)", () => {
		// "2" is the last visible tab (only "1","2" fit).
		render(
			<Tabs tabs={manyTabs} value="2" onChange={vi.fn()} ariaLabel="T" activationMode="manual" />,
		);
		simulatePartialOverflow();
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowRight" });
		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		expect(document.activeElement).toBe(moreBtn);
	});

	it("ArrowRight with overflow activates the correct adjacent visible tab (no off-by-N)", () => {
		const onChange = vi.fn();
		render(<Tabs tabs={manyTabs} value="1" onChange={onChange} ariaLabel="T" />);
		simulatePartialOverflow();
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "ArrowRight" });
		// From visible tab "1" the next visible tab is "2".
		expect(onChange).toHaveBeenCalledWith("2");
	});

	it("End jumps focus to the More button when tabs overflow", () => {
		render(
			<Tabs tabs={manyTabs} value="1" onChange={vi.fn()} ariaLabel="T" activationMode="manual" />,
		);
		simulatePartialOverflow();
		const tablist = screen.getByRole("tablist");
		fireEvent.keyDown(tablist, { key: "End" });
		const moreBtn = screen.getByRole("button", { name: /more tabs/i });
		expect(document.activeElement).toBe(moreBtn);
	});
});
