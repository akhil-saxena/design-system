import React, {
	type CSSProperties,
	type ReactElement,
	type ReactNode,
	forwardRef,
	useEffect,
	useState,
} from "react";

export interface AppShellProps {
	/** Sidebar nav component - receives collapsed + onToggleCollapse via cloneElement */
	sidebar: ReactElement<{ collapsed?: boolean; onToggleCollapse?: () => void }>;
	/** Topbar component (AppBar DS-72 or any ReactNode) */
	topbar: ReactNode;
	/** Main page content */
	main: ReactNode;
	/** Optional footer (DS-73 or any ReactNode) */
	footer?: ReactNode;
	/**
	 * Collapsed state, CONTROLLED.
	 *
	 * Supplying this makes `AppShell` a controlled component: it renders the value
	 * you pass and never mutates it, so the sidebar's own toggle reports through
	 * `onCollapsedChange` instead of changing anything. Persistence is skipped while
	 * controlled — the state belongs to the caller, and writing it would fight the
	 * caller on the next mount.
	 *
	 * Omit it for the previous behaviour (uncontrolled + localStorage).
	 */
	collapsed?: boolean;
	/**
	 * Opening collapsed state for the UNCONTROLLED shell. Read once, on mount.
	 *
	 * It outranks the persisted value, so passing it alongside a live `storageKey`
	 * means the user's last choice is discarded on every reload. Pass one or the
	 * other, not both.
	 *
	 * It is also the SSR-deterministic way to open collapsed: `readStorage` returns
	 * `false` on a server (there is no `window`), so a *persisted* `true` renders
	 * expanded on the server and collapsed on the client — a real hydration
	 * disagreement. `defaultCollapsed` + `storageKey={null}` renders the same on
	 * both sides.
	 */
	defaultCollapsed?: boolean;
	/**
	 * Called with the requested next value whenever the sidebar's toggle fires, in
	 * BOTH modes — controlled (where it is the only effect) and uncontrolled (where
	 * it is an observation alongside the internal state change).
	 */
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * localStorage key for sidebar collapse persistence.
	 * Pass null to disable persistence.
	 * @default "ds-sidebar-collapsed"
	 */
	storageKey?: string | null;
	/**
	 * Expanded sidebar width in pixels, written as an INLINE custom property.
	 *
	 * **The tradeoff, because it is not guessable.** Passing this is an explicit
	 * author-level instruction, so it wins — and an inline custom property is fixed
	 * at construction, so it also makes `--ds-sidebar-w` unreachable from CSS. A
	 * media query, a container query or a future density axis has no selector to
	 * re-declare it from. If you pass `sidebarWidth` and then wonder why your media
	 * query does nothing, this is why.
	 *
	 * **Omit it to get a width CSS can drive.** With the prop absent nothing is
	 * written inline, and `.ds-atom-appshell` in `primitives.css` declares
	 * `--ds-sidebar-w: 240px` (48px under `[data-sidebar-collapsed="true"]`) at class
	 * level, where any rule can reach it:
	 *
	 * ```css
	 * // in a sheet loaded AFTER the design system's primitives.css
	 * @media (min-width: 673px) and (max-width: 1023px) {
	 *   .ds-atom-appshell { --ds-sidebar-w: 208px; }
	 * }
	 * ```
	 *
	 * `.ds-atom-appshell` is `(0,1,0)` on both sides, so a consumer rule TIES with
	 * the library's own and source order decides. If you cannot guarantee your sheet
	 * comes last, add a class — `.my-app .ds-atom-appshell` — and it wins from any
	 * position. The collapsed value is declared at `(0,2,0)`, so overriding the rail
	 * needs `.ds-atom-appshell[data-sidebar-collapsed="true"]`.
	 *
	 * @default 240 — declared in primitives.css, not here
	 */
	sidebarWidth?: number;
	/**
	 * Optional persistent strip between the topbar and main (G-8).
	 *
	 * Rendered as its own labelled `<section>` spanning the full width, so it is a
	 * landmark a screen-reader user can reach directly instead of walking the
	 * topbar. Nothing is rendered when this is absent — no empty region is added to
	 * an existing consumer's accessibility tree.
	 *
	 * It sits outside `.ds-atom-appshell-main`, which is the only scroll container,
	 * so it persists while main content scrolls.
	 */
	banner?: ReactNode;
	/**
	 * Accessible name for the `banner` region.
	 *
	 * The slot only closes G-8 if it is labelled: an unnamed `<section>` is not
	 * exposed as a landmark by most screen readers, which would silently reproduce
	 * the finding ("it has no landmark of its own") with a `<section>` in place of a
	 * `<div>`. The default keeps the region reachable; override it whenever the strip
	 * is not status-shaped.
	 *
	 * `role="banner"` is deliberately NOT used: that role means the page header and
	 * must be unique, and the topbar already is it.
	 *
	 * @default "Status"
	 */
	bannerLabel?: string;
	className?: string;
	style?: CSSProperties;
}

function readStorage(storageKey: string | null | undefined): boolean {
	if (storageKey === null || storageKey === undefined) return false;
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage?.getItem(storageKey) === "true";
	} catch {
		return false;
	}
}

/**
 * AppShell (DS-71) - top-level CSS Grid layout primitive.
 *
 * Slots: topbar (sticky header), banner (optional persistent strip), sidebar
 * (collapsible icon rail), main (scrollable content), footer (optional bottom bar).
 *
 * ## Collapsed is an input as well as an output
 *
 * Precedence, decided rather than emergent. Highest first:
 *
 *   1. `collapsed`                         — controlled; AppShell never self-mutates
 *   2. the sidebar child's own `collapsed`  — uncontrolled only
 *   3. `defaultCollapsed`                   — initial seed only
 *   4. the `storageKey` value                — initial seed only
 *   5. `false`
 *
 * **Controlled when `collapsed != null` alone**, which is deliberately unlike
 * `Lightbox` — it requires BOTH `activeIndex` and `onIndexChange`. For an index, a
 * value with no handler is almost always a mistake (navigation would appear
 * broken). For a boolean, pinning without observing is a real intent:
 * `collapsed={isNarrow}` driven entirely by a media query has nothing to observe,
 * and requiring a handler would hand control back on the first toggle — the exact
 * class of silent state loss E2 describes.
 *
 * **Rule 2 is E2's literal defect.** `cloneElement` used to inject `collapsed`
 * unconditionally, so a sidebar that declared its own state had it replaced on
 * every render. The child's value now wins while AppShell is uncontrolled, and the
 * shell ADOPTS it for `data-sidebar-collapsed` rather than merely leaving the child
 * alone: a 48px rail inside a 240px grid column is a visible layout bug, so the two
 * must agree.
 *
 * `onToggleCollapse` is still injected unconditionally, replacing any the child
 * carried. That is asymmetric with `collapsed` and intentionally so — it is
 * AppShell's report channel, not consumer state, and composing it with a child
 * handler that flips child-owned state would desync the two.
 *
 * ## The sidebar width lives in CSS
 *
 * `--ds-sidebar-w` is declared on `.ds-atom-appshell` in `primitives.css`, NOT as an
 * inline style on the root. An inline custom property is fixed at construction:
 * there is no selector for a media query to re-declare it from, which is why
 * UI-SPEC's 208px compact sidebar was measured as unreachable. See `sidebarWidth`
 * for the one case that is still written inline, and why.
 *
 * ## There is no built-in breakpoint
 *
 * `primitives.css` used to hide the sidebar below 767px. That is removed: 767 was
 * not a boundary in any device matrix, and it bisected this project's device class 3
 * (673-884px), so one class of device rendered two different layouts. The consumer
 * knows its device classes; a shared library does not. To restore the old posture,
 * two declarations — and they hold with or without the banner row, because they
 * collapse the column rather than rewriting the grid areas:
 *
 * ```css
 * @media (max-width: 672px) {
 *   .ds-atom-appshell { --ds-sidebar-w: 0px; }
 *   .ds-atom-appshell-sidebar { display: none; }
 * }
 * ```
 *
 * For a collapsed rail instead of no sidebar at all, one declaration:
 * `.ds-atom-appshell { --ds-sidebar-w: 48px; }` inside the band.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
	{
		sidebar,
		topbar,
		main,
		footer,
		collapsed: collapsedProp,
		defaultCollapsed,
		onCollapsedChange,
		storageKey = "ds-sidebar-collapsed",
		sidebarWidth,
		banner,
		bannerLabel = "Status",
		className,
		style,
	},
	ref,
) {
	const isControlled = collapsedProp != null;

	const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
		// Seeded from `collapsed` when controlled, so a consumer that later drops the
		// prop resumes from the last controlled value rather than from stale storage.
		if (collapsedProp != null) return collapsedProp;
		if (defaultCollapsed != null) return defaultCollapsed;
		return readStorage(storageKey);
	});

	// Rule 2 of the precedence list: the child's own prop, read off the element the
	// consumer passed rather than off the clone.
	const childCollapsed = sidebar.props?.collapsed;
	const collapsed = isControlled ? collapsedProp : (childCollapsed ?? internalCollapsed);

	useEffect(() => {
		// A controlled shell's state is the caller's; persisting it would fight the
		// caller on the next mount.
		if (isControlled) return;
		if (storageKey === null || storageKey === undefined) return;
		if (typeof window === "undefined") return;
		try {
			window.localStorage?.setItem(storageKey, String(collapsed));
		} catch {
			// localStorage unavailable - silently ignore
		}
	}, [isControlled, collapsed, storageKey]);

	const sidebarWithProps = React.cloneElement(sidebar, {
		collapsed,
		onToggleCollapse: () => {
			const next = !collapsed;
			if (!isControlled) setInternalCollapsed(next);
			onCollapsedChange?.(next);
		},
	});

	// Written inline ONLY when the consumer asked for a specific width. With
	// `sidebarWidth` omitted the property is left to `.ds-atom-appshell`, where a
	// media query can reach it — see the prop's own doc comment for the tradeoff.
	const widthStyle =
		sidebarWidth == null
			? undefined
			: ({ "--ds-sidebar-w": collapsed ? "48px" : `${sidebarWidth}px` } as CSSProperties);

	// `undefined` rather than `{}` so the default render emits no style attribute at
	// all; an empty one would still be a markup change for every existing consumer.
	const mergedStyle =
		widthStyle || style ? ({ ...widthStyle, ...style } as CSSProperties) : undefined;

	return (
		<div
			ref={ref}
			className={["ds-atom-appshell", className].filter(Boolean).join(" ")}
			data-sidebar-collapsed={collapsed}
			style={mergedStyle}
		>
			<header className="ds-atom-appshell-topbar">{topbar}</header>
			{banner && (
				<section className="ds-atom-appshell-banner" aria-label={bannerLabel}>
					{banner}
				</section>
			)}
			<aside className="ds-atom-appshell-sidebar">{sidebarWithProps}</aside>
			<main className="ds-atom-appshell-main">{main}</main>
			{footer && <footer className="ds-atom-appshell-footer">{footer}</footer>}
		</div>
	);
});
