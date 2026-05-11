import { type CSSProperties, type ReactNode, forwardRef } from "react";

export interface SplitHeroProps {
	/** Left/aside content — typically a marketing or brand panel on a dark surface. */
	aside: ReactNode;
	/** Right/main content — typically the form, body, or interactive payload. */
	main: ReactNode;
	/** Aside-to-main column ratio, e.g. "1fr 1fr" (default) or "1.15fr 1fr". @default "1fr 1fr" */
	ratio?: string;
	/** Aside background color. @default "var(--ink)" */
	asideBackground?: string;
	/** Main background color. @default "var(--cream)" */
	mainBackground?: string;
	/** When viewport ≤ this breakpoint (px), stack vertically (aside on top). @default 900 */
	stackBelow?: number;
	/** When viewport ≤ this breakpoint (px), hide the aside entirely. @default 600 */
	hideAsideBelow?: number;
	/** Optional className for the root element. */
	className?: string;
	/** Optional style for the root element. */
	style?: CSSProperties;
}

/**
 * Two-column page chrome for marketing / auth / onboarding surfaces.
 *
 * - Desktop (`> stackBelow`): aside | main, side-by-side.
 * - Tablet (`≤ stackBelow`, `> hideAsideBelow`): stacked vertically.
 * - Mobile (`≤ hideAsideBelow`): aside hidden, main fills the viewport.
 *
 * The root is `height: 100vh; overflow: hidden;` so the aside cannot push the
 * page taller than the viewport; the `main` slot internally allows scroll for
 * long forms. At the stacked breakpoints the clamp releases so the page
 * scrolls naturally.
 *
 * @example
 * <SplitHero
 *   aside={<HeroPanel kicker="WELCOME BACK" headline="Sign in to your trail." />}
 *   main={<SignInForm />}
 * />
 */
export const SplitHero = forwardRef<HTMLElement, SplitHeroProps>(function SplitHero(
	{
		aside,
		main,
		ratio = "1fr 1fr",
		asideBackground = "var(--ink)",
		mainBackground = "var(--cream)",
		stackBelow = 900,
		hideAsideBelow = 600,
		className,
		style,
	},
	ref,
) {
	// Inline styles for non-responsive bits; media-query rules ride on the
	// data-attributes via a one-off <style> tag emitted alongside the component.
	const rootStyle: CSSProperties = {
		height: "100vh",
		display: "grid",
		gridTemplateColumns: ratio,
		background: mainBackground,
		overflow: "hidden",
		...style,
	};
	const asideStyle: CSSProperties = {
		display: "flex",
		height: "100%",
		overflow: "hidden",
		background: asideBackground,
	};
	const mainStyle: CSSProperties = {
		background: mainBackground,
		padding: "48px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		gap: 20,
		overflowY: "auto",
	};

	// Stable id so the component-scoped media-query <style> doesn't collide
	// across multiple SplitHero instances on the same page (unlikely but safe).
	const id = `dssh-${stackBelow}-${hideAsideBelow}`;

	return (
		<>
			<style>{`
				@media (max-width: ${stackBelow}px) {
					.${id} {
						height: auto !important;
						min-height: 100vh;
						grid-template-columns: 1fr !important;
						grid-template-rows: auto 1fr;
						overflow: visible !important;
					}
					.${id} > [data-slot="aside"] {
						height: auto;
						min-height: auto;
						overflow: visible;
					}
					.${id} > [data-slot="main"] {
						padding: 40px 32px;
						justify-content: flex-start;
						overflow-y: visible;
					}
				}
				@media (max-width: ${hideAsideBelow}px) {
					.${id} {
						grid-template-rows: 1fr;
					}
					.${id} > [data-slot="aside"] {
						display: none;
					}
					.${id} > [data-slot="main"] {
						padding: 24px;
						gap: 16px;
					}
				}
			`}</style>
			<main
				ref={ref}
				className={`ds-layout-splithero ${id}${className ? ` ${className}` : ""}`}
				style={rootStyle}
			>
				<div data-slot="aside" style={asideStyle}>
					{aside}
				</div>
				<div data-slot="main" style={mainStyle}>
					{main}
				</div>
			</main>
		</>
	);
});
