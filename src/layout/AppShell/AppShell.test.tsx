import { act, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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

	it("storageKey={null} - toggling does not write to localStorage", () => {
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

// ─── E2: collapsed as an INPUT ────────────────────────────────────────────────
//
// The finding, precisely: `collapsed` was an output only. There was no prop, and
// `cloneElement` unconditionally overwrote whatever `collapsed` the sidebar child
// carried. These cases pin the precedence order down as a decision rather than
// letting it stay emergent:
//
//   1. `collapsed` on AppShell            (controlled — AppShell never self-mutates)
//   2. the sidebar child's own `collapsed` (uncontrolled only — E2's literal defect)
//   3. `defaultCollapsed`                 (initial seed only)
//   4. the `storageKey` value             (initial seed only)
//   5. false
//
// jsdom implements no CSS, so nothing here can speak to the *width*. That claim
// lives in tests/visual/appshell-cascade.spec.ts, in a real browser.

describe("AppShell — controlled collapse (E2)", () => {
	it("collapsed={true} renders collapsed and does not self-mutate on toggle", () => {
		const onCollapsedChange = vi.fn();
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={true}
				onCollapsedChange={onCollapsedChange}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");
		expect(screen.getByTestId("mock-sidebar")).toHaveAttribute("data-collapsed", "true");

		act(() => {
			screen.getByTestId("toggle-btn").click();
		});

		// Still collapsed: a controlled component reports, it does not decide.
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");
		expect(onCollapsedChange).toHaveBeenCalledTimes(1);
		expect(onCollapsedChange).toHaveBeenCalledWith(false);
	});

	it("collapsed={false} stays expanded on toggle", () => {
		const onCollapsedChange = vi.fn();
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={false}
				onCollapsedChange={onCollapsedChange}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "false");

		act(() => {
			screen.getByTestId("toggle-btn").click();
		});

		expect(root).toHaveAttribute("data-sidebar-collapsed", "false");
		expect(onCollapsedChange).toHaveBeenCalledWith(true);
	});

	it("collapsed wins over a stored value and over defaultCollapsed", () => {
		store["ds-sidebar-collapsed"] = "true";
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={false}
				defaultCollapsed={true}
			/>,
		);
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"false",
		);
	});

	it("a controlled shell does not need onCollapsedChange to stay pinned", () => {
		// Deliberately unlike Lightbox, which requires BOTH value and handler.
		// Pinning a boolean without observing it is a legitimate consumer intent
		// (`collapsed={isNarrow}` driven entirely by a media query), and requiring a
		// handler would silently hand control back on the first toggle.
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={true}
			/>,
		);
		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"true",
		);
	});

	it("a controlled shell does not write to localStorage", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={true}
			/>,
		);
		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(localStorageMock.setItem).not.toHaveBeenCalled();
	});
});

describe("AppShell — uncontrolled collapse (E2)", () => {
	it("defaultCollapsed starts collapsed and then toggles freely", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				defaultCollapsed
				storageKey={null}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell");
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");

		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(root).toHaveAttribute("data-sidebar-collapsed", "false");

		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(root).toHaveAttribute("data-sidebar-collapsed", "true");
	});

	it("defaultCollapsed beats a stored value — and therefore defeats persistence", () => {
		// The precedence the plan fixed at planning time, with its cost written down
		// as a test rather than left to be discovered: `defaultCollapsed` outranks the
		// persisted value on EVERY mount, so passing it alongside a live `storageKey`
		// discards the user's last choice on every reload. Pass one or the other.
		store["ds-sidebar-collapsed"] = "true";
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				defaultCollapsed={false}
			/>,
		);
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"false",
		);
	});

	it("the stored value seeds the shell when defaultCollapsed is omitted", () => {
		store["ds-sidebar-collapsed"] = "true";
		render(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"true",
		);
	});

	it("defaultCollapsed applies when there is nothing stored", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				defaultCollapsed
			/>,
		);
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"true",
		);
	});

	it("uncontrolled: the sidebar child's own collapsed prop is no longer overwritten", () => {
		// THE literal E2 defect. cloneElement passed `collapsed` unconditionally, so
		// a child that declared its own state had it silently replaced on every
		// render. The shell adopts the child's value rather than merely leaving the
		// child alone — a 48px rail inside a 240px grid column is a visible layout
		// bug, so the two must agree.
		render(
			<AppShell
				sidebar={<MockSidebar collapsed={true} />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
			/>,
		);
		expect(screen.getByTestId("mock-sidebar")).toHaveAttribute("data-collapsed", "true");
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"true",
		);
	});

	it("controlled: AppShell's collapsed beats the sidebar child's own prop", () => {
		render(
			<AppShell
				sidebar={<MockSidebar collapsed={true} />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed={false}
			/>,
		);
		expect(screen.getByTestId("mock-sidebar")).toHaveAttribute("data-collapsed", "false");
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"false",
		);
	});

	it("onCollapsedChange also fires when uncontrolled", () => {
		const onCollapsedChange = vi.fn();
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
				onCollapsedChange={onCollapsedChange}
			/>,
		);
		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(onCollapsedChange).toHaveBeenCalledWith(true);
		expect(document.querySelector(".ds-atom-appshell")).toHaveAttribute(
			"data-sidebar-collapsed",
			"true",
		);
	});
});

// ─── E2: --ds-sidebar-w must not be an inline style ───────────────────────────

describe("AppShell — the sidebar width is reachable from CSS (E2)", () => {
	it("writes NO inline --ds-sidebar-w when sidebarWidth is omitted", () => {
		// The whole finding in one assertion. An inline custom property is fixed at
		// construction, so no media query, container query or density axis can
		// re-declare it — which is why UI-SPEC's 208px compact sidebar "needed zero
		// declarations because it is unreachable at all".
		render(
			<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />,
		);
		const root = document.querySelector(".ds-atom-appshell") as HTMLElement;
		expect(root.getAttribute("style") ?? "").not.toContain("--ds-sidebar-w");
	});

	it("writes NO inline --ds-sidebar-w when collapsed either", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				collapsed
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell") as HTMLElement;
		expect(root.getAttribute("style") ?? "").not.toContain("--ds-sidebar-w");
	});

	it("an explicit sidebarWidth IS still written inline, as an author-level override", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				sidebarWidth={208}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell") as HTMLElement;
		expect(root.style.getPropertyValue("--ds-sidebar-w")).toBe("208px");
	});

	it("sidebarWidth still yields the 48px rail when collapsed", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				sidebarWidth={208}
				collapsed
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell") as HTMLElement;
		expect(root.style.getPropertyValue("--ds-sidebar-w")).toBe("48px");
	});

	it("a consumer style prop is still merged and still wins", () => {
		render(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				style={{ background: "red" }}
			/>,
		);
		const root = document.querySelector(".ds-atom-appshell") as HTMLElement;
		expect(root.style.background).toBe("red");
	});
});

// ─── SSR / hydration ─────────────────────────────────────────────────────────

describe("AppShell — server-rendered markup", () => {
	/**
	 * AppShell is the admin's frame. A hydration mismatch here is total rather
	 * than local, so the server pass and the first client pass are asserted to
	 * agree element-for-element.
	 *
	 * Note what "unchanged" can and cannot mean here. The inline
	 * `style="--ds-sidebar-w:240px"` is GONE from the default markup, deliberately
	 * — that removal is the point of this plan. What must not change is the
	 * structure, the class names, the element order and the collapse attribute.
	 */
	const shell = (
		<AppShell sidebar={<MockSidebar />} topbar={<div>Topbar</div>} main={<div>Main</div>} />
	);

	it("the server pass matches the first client pass exactly", () => {
		const server = renderToStaticMarkup(shell);
		const { container } = render(shell);
		expect(container.innerHTML).toBe(server);
	});

	it("the uncontrolled default server-renders expanded, with no inline width", () => {
		const server = renderToStaticMarkup(shell);
		expect(server).toContain('data-sidebar-collapsed="false"');
		expect(server).not.toContain("--ds-sidebar-w");
		expect(server).not.toContain("style=");
	});

	it("the structure is topbar, sidebar, main — in that order, with the same classes", () => {
		const server = renderToStaticMarkup(shell);
		const order = [...server.matchAll(/class="(ds-atom-appshell[a-z-]*)"/g)].map((m) => m[1]);
		expect(order).toEqual([
			"ds-atom-appshell",
			"ds-atom-appshell-topbar",
			"ds-atom-appshell-sidebar",
			"ds-atom-appshell-main",
		]);
		expect(server.startsWith('<div class="ds-atom-appshell" data-sidebar-collapsed="false">')).toBe(
			true,
		);
	});

	it("defaultCollapsed + storageKey={null} is the SSR-deterministic combination", () => {
		// readStorage's `typeof window === "undefined"` guard means a real server
		// always renders `false`, so a stored `true` produces a genuine server/client
		// disagreement on the first paint. defaultCollapsed is the way to state an
		// opening posture that both passes agree on.
		const pinned = (
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				defaultCollapsed
				storageKey={null}
			/>
		);
		const server = renderToStaticMarkup(pinned);
		const { container } = render(pinned);
		expect(server).toContain('data-sidebar-collapsed="true"');
		expect(container.innerHTML).toBe(server);
	});

	it("does not read localStorage during a server pass with storageKey={null}", () => {
		renderToStaticMarkup(
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
			/>,
		);
		expect(localStorageMock.getItem).not.toHaveBeenCalled();
		expect(localStorageMock.setItem).not.toHaveBeenCalled();
	});
});

// ─── G-8: the banner slot ─────────────────────────────────────────────────────
//
// The finding's complaint is not layout, it is that D-15's persistent pipeline
// strip "has no landmark of its own", so a screen-reader user could only reach it
// by walking the topbar. The slot only closes G-8 if the region is independently
// reachable — hence the role assertions rather than a class-name assertion.
//
// Grid GEOMETRY for all four banner x footer combinations is in
// tests/visual/appshell-cascade.spec.ts: jsdom lays nothing out, so an empty
// explicit grid row that leaves a visible gap is invisible here.

describe("AppShell — the banner slot (G-8)", () => {
	const shellWith = (props: Record<string, unknown>) => (
		<AppShell
			sidebar={<MockSidebar />}
			topbar={<div data-testid="topbar-content">Topbar</div>}
			main={<div data-testid="main-content">Main</div>}
			storageKey={null}
			{...props}
		/>
	);

	it("renders the banner between the topbar and main, in its own element", () => {
		const { container } = render(
			shellWith({ banner: <div data-testid="banner-content">Processing</div> }),
		);
		expect(screen.getByTestId("banner-content")).toBeInTheDocument();

		const root = container.querySelector(".ds-atom-appshell") as HTMLElement;
		const order = [...root.children].map((el) => el.tagName.toLowerCase());
		expect(order).toEqual(["header", "section", "aside", "main"]);
	});

	it("is a labelled landmark, reachable without walking the topbar", () => {
		render(shellWith({ banner: <div>Processing</div>, bannerLabel: "Photo pipeline" }));
		const region = screen.getByRole("region", { name: "Photo pipeline" });
		expect(region.tagName.toLowerCase()).toBe("section");
		expect(region).toHaveClass("ds-atom-appshell-banner");
		// Not nested inside the topbar — that IS the finding.
		expect(region.closest(".ds-atom-appshell-topbar")).toBeNull();
		expect(region.closest(".ds-atom-appshell-main")).toBeNull();
	});

	it("has a default accessible name, so an unlabelled slot is still a landmark", () => {
		// An unnamed <section> is not exposed as a landmark by most screen readers,
		// which would reproduce G-8 with a <section> in place of a <div>.
		render(shellWith({ banner: <div>Processing</div> }));
		expect(screen.getByRole("region", { name: "Status" })).toBeInTheDocument();
	});

	it("never uses role=banner — the topbar is the page header and it must be unique", () => {
		const { container } = render(shellWith({ banner: <div>Processing</div> }));
		expect(container.querySelector('[role="banner"]')).toBeNull();
		// <header> as a direct child of the shell already maps to the banner role;
		// a second one would be a duplicate landmark.
		expect(container.querySelectorAll("header").length).toBe(1);
	});

	it("renders NO element at all when banner is absent", () => {
		// An always-present empty region would add a landmark to every existing
		// consumer's accessibility tree.
		const { container } = render(shellWith({}));
		expect(container.querySelector(".ds-atom-appshell-banner")).toBeNull();
		expect(container.querySelector("section")).toBeNull();
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
		const root = container.querySelector(".ds-atom-appshell") as HTMLElement;
		expect([...root.children].map((el) => el.tagName.toLowerCase())).toEqual([
			"header",
			"aside",
			"main",
		]);
	});

	it("all four banner x footer combinations render the right elements", () => {
		const cases: [boolean, boolean, string[]][] = [
			[false, false, ["header", "aside", "main"]],
			[false, true, ["header", "aside", "main", "footer"]],
			[true, false, ["header", "section", "aside", "main"]],
			[true, true, ["header", "section", "aside", "main", "footer"]],
		];
		for (const [withBanner, withFooter, expected] of cases) {
			const { container, unmount } = render(
				shellWith({
					banner: withBanner ? <div>Processing</div> : undefined,
					footer: withFooter ? <div>Footer</div> : undefined,
				}),
			);
			const root = container.querySelector(".ds-atom-appshell") as HTMLElement;
			expect(
				[...root.children].map((el) => el.tagName.toLowerCase()),
				`banner=${withBanner} footer=${withFooter}`,
			).toEqual(expected);
			unmount();
		}
	});

	it("the banner survives a collapse toggle and a re-render", () => {
		// It is a *persistent* strip: the point of the slot is that it is not
		// re-mounted by whatever the shell does around it.
		render(shellWith({ banner: <div data-testid="banner-content">Processing</div> }));
		const before = screen.getByTestId("banner-content");
		act(() => {
			screen.getByTestId("toggle-btn").click();
		});
		expect(screen.getByTestId("banner-content")).toBe(before);
	});

	it("server-renders the banner in the same place as the client does", () => {
		const withBanner = (
			<AppShell
				sidebar={<MockSidebar />}
				topbar={<div>Topbar</div>}
				main={<div>Main</div>}
				storageKey={null}
				banner={<div>Processing</div>}
				bannerLabel="Photo pipeline"
			/>
		);
		const server = renderToStaticMarkup(withBanner);
		const { container } = render(withBanner);
		expect(container.innerHTML).toBe(server);
		expect(server).toContain(
			'<section class="ds-atom-appshell-banner" aria-label="Photo pipeline">',
		);
	});
});
