/**
 * Tabs (DS-62) — unit tests
 *
 * Task 1: ARIA, keyboard navigation, variants, count badges, manual activation
 * Task 2: ResizeObserver overflow menu via DSDropdown
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type TabItem, Tabs } from ".";
// ── ResizeObserver global stub (required for all tests — jsdom has no ResizeObserver) ──

let resizeCallback: ResizeObserverCallback | null = null;

// Must be set up before any Tabs render. Using module-scope beforeEach so every test
// gets a fresh mock and the callback reference is captured.
beforeEach(() => {
	resizeCallback = null;
	const MockRO = vi.fn(function (this: unknown, cb: ResizeObserverCallback) {
		resizeCallback = cb;
		return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
	});
	// @ts-expect-error assigning mock class to global
	globalThis.ResizeObserver = MockRO;
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

describe("Tabs — ARIA structure", () => {
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

describe("Tabs — click activation", () => {
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

describe("Tabs — keyboard navigation (automatic)", () => {
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

describe("Tabs — manual activation mode", () => {
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

describe("Tabs — count badge", () => {
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

describe("Tabs — variants", () => {
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

/** Helper — simulate a narrow container so tabs overflow */
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

describe("Tabs — overflow menu (ResizeObserver)", () => {
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
