import { type CSSProperties, type ReactNode, forwardRef } from "react";
import { Button } from "../../inputs/Button";
import { TextInput } from "../../inputs/TextInput";
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
				// Fixed dark chip, not var(--ink): --ink is a theme-aware *text* token
				// that becomes #ededed in dark mode, so the amber mark on it dropped to
				// 1.83:1. A brand mark should not invert — pinning the chip keeps amber
				// at 8.1:1 in both themes.
				background: "#1c1c1a",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				// var(--amber-vivid), not var(--amber). The chip above is PINNED, so its
				// foreground must not follow the mode either — and --amber does, under any
				// brand whose accent inverts. Monochrome's does: at the ink end it measures
				// 1.10 on this chip in light mode. --amber-vivid is the accent value that
				// is declared identically in both of a theme's blocks, which is the exact
				// property a pinned surface needs. It reads 5.26 in both monochrome modes,
				// and it is #f59e0b in the default brand in both modes — the same value
				// --amber resolved to here, so that brand renders byte-identically.
				// This is finding G3, closed at the component rather than by holding a
				// whole theme's accent inside a band that suited nothing else.
				color: "var(--amber-vivid)",
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
 * AppBar - DS-72
 *
 * Standalone sticky topbar primitive. Pass as the `topbar` slot to AppShell (DS-71).
 * Provides 4 variants: minimal, withSearch, default, centered.
 * Consumer-driven `scrolled` prop applies frosted-glass background + shadow transition.
 *
 * ## The bar's layout groups are styled, not inline (D-21)
 *
 * The logo+nav lead, the nav group inside it and the actions group are rendered
 * by AppBar, not passed in — so a consumer has no element to select and no prop
 * to reach them with. They used to carry `display`, `align-items` and `gap` as
 * INLINE styles, which no consumer stylesheet can beat at any specificity, and
 * a site built on this bar consequently overflowed a 344px viewport by 14px on
 * every route with no lever short of `!important` reaching into the component's
 * internals. They now carry `.ds-atom-appbar-lead`, `.ds-atom-appbar-nav` and
 * `.ds-atom-appbar-actions`, styled from primitives.css, and the stylesheet
 * tightens both gaps below 380px. Override either from your own sheet:
 *
 * ```css
 * .ds-atom-appbar-nav { gap: 8px; }
 * ```
 *
 * ## Reading the bar's height: `--ds-appbar-h`
 *
 * A full-viewport section placed under the bar has to subtract the bar's height,
 * and before this property existed there was no way to ask for that number. The
 * consumer that produced the finding wrote `--hm-nav: 87px` — a devtools
 * measurement pasted into a page stylesheet, correct on the day and silently
 * wrong after any change to the bar's padding, type or logo.
 *
 * ```css
 * .landing {
 *   min-height: calc(100svh - var(--ds-appbar-h));
 * }
 * ```
 *
 * A bare `100svh` there is not "close enough": it pushes the section's bottom
 * edge below the fold by exactly the height of the bar above it.
 *
 * The property is declared on `.ds-atom-appbar` in primitives.css — on the
 * class, not inline on the element. That is deliberate and it is the whole point:
 * an inline custom property is fixed at construction, so no media query can
 * drive it. Because this one lives on the class, the coarse-pointer touch-target
 * block re-declares it when the 44px floor grows the bar, and a consumer can
 * override it for their own bar with `.my-bar { --ds-appbar-h: 64px }`.
 *
 * ### The one thing it does not promise
 *
 * `--ds-appbar-h` is the bar's **floor**, applied as `min-height`, and it is the
 * bar's exact height whenever the `logo`, `nav` and `actions` slots fit on one
 * row — which is what a topbar is. It cannot be an oracle: those three slots take
 * arbitrary `ReactNode`s, so the rendered height is content-determined, and CSS
 * custom properties are inputs to layout rather than readings of it. Overfill a
 * slot until the row wraps and the bar will be taller than the property says.
 * If you need the guarantee, constrain your slot content — or set
 * `--ds-appbar-h` yourself and let the bar follow it.
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
					style={{ ...scrolledStyles, ...style }}
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
						justifyContent: "center",
						position: "relative",
						...style,
					}}
				>
					{logoNode}
					{(nav || actions) && (
						<div className="ds-atom-appbar-actions">
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
					style={{ ...scrolledStyles, ...style }}
				>
					<div className="ds-atom-appbar-lead">
						{logoNode}
						<TextInput
							type="search"
							className="ds-atom-appbar-search"
							placeholder={searchPlaceholder}
							onChange={(e) => onSearchChange?.(e.target.value)}
						/>
					</div>
					{actions && <div className="ds-atom-appbar-actions">{actions}</div>}
				</header>
			);
		}

		// default variant - nav links + right actions
		return (
			<header
				ref={ref}
				className={`ds-atom-appbar${className ? ` ${className}` : ""}`}
				data-variant="default"
				data-scrolled={String(scrolled)}
				style={{ ...scrolledStyles, ...style }}
			>
				<div className="ds-atom-appbar-lead">
					{logoNode}
					{nav && <div className="ds-atom-appbar-nav">{nav}</div>}
				</div>
				{actions && <div className="ds-atom-appbar-actions">{actions}</div>}
			</header>
		);
	},
);

AppBar.displayName = "AppBar";
