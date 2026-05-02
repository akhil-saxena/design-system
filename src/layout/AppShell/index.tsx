import React, {
	type CSSProperties,
	type ReactElement,
	type ReactNode,
	forwardRef,
	useEffect,
	useState,
} from "react";

export interface AppShellProps {
	/** Sidebar nav component — receives collapsed + onToggleCollapse via cloneElement */
	sidebar: ReactElement<{ collapsed?: boolean; onToggleCollapse?: () => void }>;
	/** Topbar component (AppBar DS-72 or any ReactNode) */
	topbar: ReactNode;
	/** Main page content */
	main: ReactNode;
	/** Optional footer (DS-73 or any ReactNode) */
	footer?: ReactNode;
	/**
	 * localStorage key for sidebar collapse persistence.
	 * Pass null to disable persistence.
	 * @default "ds-sidebar-collapsed"
	 */
	storageKey?: string | null;
	/**
	 * Expanded sidebar width in pixels.
	 * @default 240
	 */
	sidebarWidth?: number;
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
 * AppShell (DS-71) — top-level CSS Grid layout primitive.
 *
 * Slots: topbar (sticky header), sidebar (collapsible icon rail), main (scrollable content),
 * footer (optional bottom bar).
 *
 * The sidebar slot child receives `collapsed` and `onToggleCollapse` injected via
 * React.cloneElement — no extra context or ref needed.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
	{
		sidebar,
		topbar,
		main,
		footer,
		storageKey = "ds-sidebar-collapsed",
		sidebarWidth = 240,
		className,
		style,
	},
	ref,
) {
	const [collapsed, setCollapsed] = useState<boolean>(() => readStorage(storageKey));

	useEffect(() => {
		if (storageKey === null || storageKey === undefined) return;
		if (typeof window === "undefined") return;
		try {
			window.localStorage?.setItem(storageKey, String(collapsed));
		} catch {
			// localStorage unavailable — silently ignore
		}
	}, [collapsed, storageKey]);

	const sidebarWithProps = React.cloneElement(sidebar, {
		collapsed,
		onToggleCollapse: () => setCollapsed((c) => !c),
	});

	return (
		<div
			ref={ref}
			className={["ds-atom-appshell", className].filter(Boolean).join(" ")}
			data-sidebar-collapsed={collapsed}
			style={
				{
					"--ds-sidebar-w": collapsed ? "48px" : `${sidebarWidth}px`,
					...style,
				} as CSSProperties
			}
		>
			<header className="ds-atom-appshell-topbar">{topbar}</header>
			<aside className="ds-atom-appshell-sidebar">{sidebarWithProps}</aside>
			<main className="ds-atom-appshell-main">{main}</main>
			{footer && <footer className="ds-atom-appshell-footer">{footer}</footer>}
		</div>
	);
});
