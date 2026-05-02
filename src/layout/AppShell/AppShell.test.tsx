import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from ".";
// ─── localStorage mock ────────────────────────────────────────────────────────

let store: Record<string, string> = {};

const localStorageMock = {
	getItem: vi.fn((key: string) => store[key] ?? null),
	setItem: vi.fn((key: string, value: string) => {
		store[key] = value;
	}),
	removeItem: vi.fn((key: string) => {
		delete store[key];
	}),
	clear: vi.fn(() => {
		store = {};
	}),
	length: 0,
	key: vi.fn(() => null),
};

beforeEach(() => {
	store = {};
	vi.clearAllMocks();
	Object.defineProperty(window, "localStorage", {
		value: localStorageMock,
		writable: true,
		configurable: true,
	});
});

afterEach(() => {
	store = {};
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MockSidebar({
	collapsed,
	onToggleCollapse,
}: {
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}) {
	return (
		<div data-testid="mock-sidebar" data-collapsed={String(collapsed)}>
			<button type="button" onClick={onToggleCollapse} data-testid="toggle-btn">
				{collapsed ? "expand" : "collapse"}
			</button>
		</div>
	);
}

describe("AppShell", () => {
	// ─── Test 1: slot rendering ───────────────────────────────────────────────

	it("renders children in topbar, sidebar, and main slots", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div data-testid="topbar-content">Topbar</div>}
				main={<div data-testid="main-content">Main</div>}
			/>,
		);
		expect(screen.getByTestId("topbar-content")).toBeInTheDocument();
		expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});

	// ─── Test 2: sidebar receives collapsed=false and onToggleCollapse ────────

	it("sidebar slot receives collapsed=false and onToggleCollapse by default", () => {
		render(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		const sidebar = screen.getByTestId("mock-sidebar");
		expect(sidebar).toHaveAttribute("data-collapsed", "false");
		const toggleBtn = screen.getByTestId("toggle-btn");
		expect(toggleBtn).toBeInTheDocument();
	});

	// ─── Test 3: onToggleCollapse sets sidebar to 48px ────────────────────────

	it("clicking onToggleCollapse sets data-sidebar-collapsed=true on root", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
			/>,
		);
		const toggleBtn = screen.getByTestId("toggle-btn");
		act(() => {
			toggleBtn.click();
		});
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");
	});

	// ─── Test 4: collapsed state persists to localStorage ─────────────────────

	it("persists collapsed state to localStorage under default key", () => {
		render(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		const toggleBtn = screen.getByTestId("toggle-btn");
		act(() => {
			toggleBtn.click();
		});
		expect(localStorageMock.setItem).toHaveBeenCalledWith("ds-sidebar-collapsed", "true");
	});

	// ─── Test 5: storageKey=null disables persistence ─────────────────────────

	it("storageKey={null} — toggling does not write to localStorage", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
			/>,
		);
		const toggleBtn = screen.getByTestId("toggle-btn");
		act(() => {
			toggleBtn.click();
		});
		expect(localStorageMock.setItem).not.toHaveBeenCalled();
	});

	// ─── Test 6: custom storageKey ────────────────────────────────────────────

	it("storageKey='custom-key' persists under the custom key", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey="custom-key"
			/>,
		);
		const toggleBtn = screen.getByTestId("toggle-btn");
		act(() => {
			toggleBtn.click();
		});
		expect(localStorageMock.setItem).toHaveBeenCalledWith("custom-key", "true");
		expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
			"ds-sidebar-collapsed",
			expect.any(String),
		);
	});

	// ─── Test 7: initialises from localStorage on mount ──────────────────────

	it("initialises collapsed=true when localStorage has 'true' stored", () => {
		store["ds-sidebar-collapsed"] = "true";
		render(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		const sidebar = screen.getByTestId("mock-sidebar");
		expect(sidebar).toHaveAttribute("data-collapsed", "true");
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");
	});

	// ─── Test 8: footer slot ─────────────────────────────────────────────────

	it("footer slot renders when provided; absent when not provided", () => {
		const { rerender } = render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				footer={<div data-testid="footer-content">Footer</div>}
			/>,
		);
		expect(screen.getByTestId("footer-content")).toBeInTheDocument();

		rerender(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		expect(screen.queryByTestId("footer-content")).not.toBeInTheDocument();
	});

	// ─── Test 9: SSR safety ───────────────────────────────────────────────────

	it("does not throw when localStorage is unavailable (SSR guard)", () => {
		// Temporarily remove localStorage (simulate SSR environment)
		const originalWindow = global.window;
		// Simulate typeof window === 'undefined' by deleting localStorage getItem safety
		Object.defineProperty(window, "localStorage", {
			value: undefined,
			writable: true,
			configurable: true,
		});
		expect(() =>
			render(
				<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
			),
		).not.toThrow();
		// Restore
		Object.defineProperty(window, "localStorage", {
			value: localStorageMock,
			writable: true,
			configurable: true,
		});
	});

	// ─── Test 10: data-sidebar-collapsed attribute updates ────────────────────

	it("data-sidebar-collapsed attribute updates on toggle", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "false");

		const toggleBtn = screen.getByTestId("toggle-btn");
		act(() => {
			toggleBtn.click();
		});
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");

		act(() => {
			toggleBtn.click();
		});
		expect(root).toHaveAttribute("data-sidebar-collapsed", "false");
	});
});
