import { type CSSProperties, type ReactNode, forwardRef } from "react";
import { Button } from "./Button";
import { TextInput } from "./TextInput";

export type AppBarVariant = "minimal" | "withSearch" | "default" | "centered";

export interface AppBarProps {
	/** Visual variant. @default "default" */
	variant?: AppBarVariant;
	/** When true, applies frosted-glass background + shadow. Consumer drives via scroll listener. @default false */
	scrolled?: boolean;
	/** Custom logo content. If omitted, renders a default ink box with "DS" label. */
	logo?: ReactNode;
	/** Nav links slot (default + centered variants). */
	nav?: ReactNode;
	/** Right-side actions slot (avatar, notifications, etc.). */
	actions?: ReactNode;
	/** Callback fired when the search input value changes (withSearch variant). */
	onSearchChange?: (value: string) => void;
	/** Placeholder for the search input. @default "Search..." */
	searchPlaceholder?: string;
	className?: string;
	style?: CSSProperties;
}

const DefaultLogo = () => (
	<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
		<div
			style={{
				width: 22,
				height: 22,
				borderRadius: 6,
				background: "var(--ink)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: "var(--amber)",
				fontFamily: "var(--display)",
				fontWeight: 800,
				fontSize: 13,
			}}
		>
			DS
		</div>
		<span
			style={{
				fontFamily: "var(--display)",
				fontWeight: 800,
				fontSize: 14,
				letterSpacing: "-0.02em",
			}}
		>
			Design System
		</span>
	</div>
);

/**
 * AppBar — DS-72
 *
 * Standalone sticky topbar primitive. Pass as the `topbar` slot to AppShell (DS-71).
 * Provides 4 variants: minimal, withSearch, default, centered.
 * Consumer-driven `scrolled` prop applies frosted-glass background + shadow transition.
 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(
	(
		{
			variant = "default",
			scrolled = false,
			logo,
			nav,
			actions,
			onSearchChange,
			searchPlaceholder = "Search...",
			className,
			style,
		},
		ref,
	) => {
		const scrolledStyles: CSSProperties = scrolled
			? {
					background: "rgba(255, 255, 255, 0.92)",
					backdropFilter: "blur(14px)",
					borderBottom: "1px solid var(--rule)",
					boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
				}
			: {
					background: "var(--surf-2)",
					backdropFilter: "blur(14px)",
					borderBottom: "1px solid transparent",
					boxShadow: "none",
				};

		const logoNode = logo ?? <DefaultLogo />;

		if (variant === "minimal") {
			return (
				<header
					ref={ref}
					className={`ds-atom-appbar${className ? ` ${className}` : ""}`}
					data-variant="minimal"
					data-scrolled={String(scrolled)}
					style={{ ...scrolledStyles, transition: "all 0.2s ease", ...style }}
				>
					{logoNode}
					{actions ?? <Button size="sm">Sign in</Button>}
				</header>
			);
		}

		if (variant === "centered") {
			return (
				<header
					ref={ref}
					className={`ds-atom-appbar${className ? ` ${className}` : ""}`}
					data-variant="centered"
					data-scrolled={String(scrolled)}
					style={{
						...scrolledStyles,
						transition: "all 0.2s ease",
						justifyContent: "center",
						position: "relative",
						...style,
					}}
				>
					{logoNode}
					{(nav || actions) && (
						<div style={{ position: "absolute", right: 20, display: "flex", gap: 6 }}>
							{nav}
							{actions}
						</div>
					)}
				</header>
			);
		}

		if (variant === "withSearch") {
			return (
				<header
					ref={ref}
					className={`ds-atom-appbar${className ? ` ${className}` : ""}`}
					data-variant="withSearch"
					data-scrolled={String(scrolled)}
					style={{ ...scrolledStyles, transition: "all 0.2s ease", ...style }}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
						{logoNode}
						<TextInput
							type="search"
							className="ds-atom-appbar-search"
							placeholder={searchPlaceholder}
							onChange={(e) => onSearchChange?.(e.target.value)}
						/>
					</div>
					{actions && (
						<div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
					)}
				</header>
			);
		}

		// default variant — nav links + right actions
		return (
			<header
				ref={ref}
				className={`ds-atom-appbar${className ? ` ${className}` : ""}`}
				data-variant="default"
				data-scrolled={String(scrolled)}
				style={{ ...scrolledStyles, transition: "all 0.2s ease", ...style }}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 28 }}>
					{logoNode}
					{nav && <div style={{ display: "flex", gap: 18 }}>{nav}</div>}
				</div>
				{actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
			</header>
		);
	},
);

AppBar.displayName = "AppBar";
