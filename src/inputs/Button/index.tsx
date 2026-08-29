import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	type CSSProperties,
	type ElementType,
	type ReactNode,
	forwardRef,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * The anchor attributes a Button needs once it can BE an anchor (D-5).
 *
 * Picked rather than intersected with the whole of AnchorHTMLAttributes, because
 * `type` is declared by both — `"submit" | "reset" | "button"` on a button and a
 * free `string` on an anchor — and intersecting them yields a `type` that accepts
 * neither. Nothing here collides: ButtonHTMLAttributes declares `form`,
 * `formAction`, `formTarget`, `name`, `value`, `type` and `disabled`, and none of
 * those seven names appear below.
 */
type AnchorNavigationProps = Pick<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"href" | "target" | "rel" | "download" | "hrefLang" | "ping" | "referrerPolicy"
>;

/**
 * Props for the Button primitive.
 *
 * Extends all native `<button>` attributes (`onClick`, `type`, `aria-*`, etc) via spread,
 * plus the anchor navigation attributes that `as="a"` makes meaningful.
 */
export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		AnchorNavigationProps {
	/**
	 * Override the rendered element, mirroring `Link`'s prop of the same name.
	 *
	 * The case this exists for is a control with the VISUAL contract of a button
	 * and the SEMANTIC contract of a link: a hero call-to-action that navigates, a
	 * "Download the PDF" that hands over a file. Before this prop, a consumer
	 * meeting that case had two options — ship it as a text `Link`, which is what
	 * it looks like, or hand-roll the button's fill in app CSS, which is what a
	 * design system exists to prevent.
	 *
	 * ## `disabled` does not survive the swap, and is translated rather than dropped
	 *
	 * `disabled` is a button attribute. An anchor has none: React would render
	 * `disabled=""` on the `<a>`, the browser would ignore it, and the control
	 * would look disabled while remaining focusable, clickable and navigable. That
	 * is worse than not offering `as` at all, so on any element other than a
	 * native `<button>` a disabled (or `loading`) Button instead gets
	 * `aria-disabled="true"`, loses its `href` — an anchor without one is not a
	 * link, is not focusable and has no link role — is pinned to `tabIndex={-1}`,
	 * and has its `onClick` withheld. primitives.css matches
	 * `[aria-disabled="true"]` alongside `:disabled`, so it also *looks* disabled
	 * and stops responding to hover.
	 *
	 * ## `type` is never emitted on a non-button
	 *
	 * The default `type="button"` exists so a Button inside a form cannot submit
	 * it. On an anchor, `type` means something entirely different — the MIME type
	 * of the linked resource — so emitting `"button"` there would be a false claim
	 * about a file. It is suppressed for anything that is not a native `<button>`,
	 * and an explicit `type` is suppressed with it: `ButtonProps` types `type` as
	 * `"submit" | "reset" | "button"`, inherited from `ButtonHTMLAttributes`, and
	 * none of those three is a MIME type. Widening the union so an anchor could
	 * carry `type="application/pdf"` would cost typo-safety on the common case to
	 * buy an attribute almost nothing needs; a consumer who genuinely wants it
	 * should reach for `Link`, which is typed as an anchor throughout.
	 *
	 * ## `loading` is unchanged
	 *
	 * `aria-busy` is a global ARIA attribute, valid on every element, so the
	 * loading state announces identically on a button and an anchor.
	 *
	 * @default "button"
	 */
	as?: ElementType;
	/**
	 * Visual variant.
	 *
	 * - `primary` - brand amber CTA. Use for the most-prominent action per surface.
	 * - `secondary` - outlined cream surface. Use for second-priority actions.
	 * - `ghost` - transparent, text-only. Use for tertiary, icon-only, or cancel-in-modal.
	 * - `danger` - red destructive. Use for Delete, Remove, Archive, anything irreversible.
	 *
	 * @default "primary"
	 */
	variant?: ButtonVariant;
	/**
	 * Size token. Most contexts use `md`. Use `xs`/`sm` for dense rows or chip-adjacent UI.
	 *
	 * @default "md"
	 */
	size?: ButtonSize;
	/**
	 * When true, replaces the icon with a spinner, sets `aria-busy` and disables
	 * interaction. The label is deliberately left untouched so the button's
	 * accessible name is stable across the loading transition — `getByRole
	 * ("button", { name: "Save" })` keeps matching, and screen readers don't
	 * re-announce a renamed control.
	 */
	loading?: boolean;
	/** Optional icon rendered before the label. Pass a sized `<Icon>` or lucide component. */
	icon?: ReactNode;
}

const baseStyle: CSSProperties = {
	// Type and radius resolve through the token scales rather than raw px. Button
	// was the least token-compliant component in the system despite being the
	// flagship: fontSize 10/11/12/13 and borderRadius 5/7/9, none of which sat on
	// --text-* or --radius-*. The nearest scale steps move each value by at most
	// 0.5px (type) and 1px (radius), so the buttons look the same while becoming
	// re-themable by overriding a token.
	//
	// `padding` and `gap` deliberately stay in px: 7/14 and 6 are not on the 4px
	// spacing grid, and snapping them would change button height and label
	// spacing visibly. Worth revisiting as a deliberate design change.
	fontSize: "var(--text-sm)",
	padding: "7px 14px",
	borderRadius: "var(--radius-md)",
	fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "var(--space-1)",
	cursor: "pointer",
	fontFamily: "var(--font-body)",
	whiteSpace: "nowrap",
	outline: "none",
	// `transition` is intentionally absent: .ds-atom-btn in primitives.css owns
	// it, enumerating the exact properties (transform/background/border/color/
	// box-shadow/filter) instead of `all`, and pairs it with a
	// prefers-reduced-motion guard. Declaring `transition: all` inline would win
	// over the stylesheet and silently defeat both.
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
	// Primary = brand amber CTA. Use for the most-prominent action in any context.
	primary: {
		background: "var(--amber)",
		color: "var(--ink-inverse)",
		borderColor: "var(--amber-d)",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
	// Secondary = clean white outlined surface. Use for second-priority actions.
	// Previous translucent glass (var(--g-bg) + backdrop-filter) rendered as a
	// muted grey over cream and looked disabled/greyed-out. Plain white + wire
	// border reads crisply on any background. Dark-mode override in primitives.css
	// flips background to translucent-white over dark surfaces.
	//
	// The --wire border colour is NOT set here. It lives in primitives.css on
	// `.ds-atom-btn[data-variant="secondary"]`, together with the 1px base border
	// that used to sit in baseStyle. Inline, it outranked the whole Button section
	// of the stylesheet — the secondary and dark-secondary hover rules declared a
	// border-color that could never apply, and no consumer could restyle the edge
	// without !important. It is the right token; it was in the wrong layer.
	secondary: {
		background: "var(--panel)",
		color: "var(--ink-2)",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
	// Ghost = transparent, text-only. Use for tertiary / icon-only / cancel-in-modal.
	// Color flips via `:root.dark .ds-atom-btn[data-variant="ghost"]` in primitives.css.
	ghost: {
		background: "transparent",
		borderColor: "transparent",
		color: "var(--ink-2)",
	},
	// Danger = rich crimson, deliberately fixed rather than tokenised: --red flips
	// to a pale pink in dark mode (#f0a4a0) because it is tuned as a *text*
	// colour, which would leave the white label at 2.0:1 on the fill. Holding the
	// crimson in both themes keeps the label at 4.83:1. Same rationale as the
	// primary amber fill (8.14:1 against --ink-inverse).
	danger: {
		background: "#dc2626",
		color: "#fff",
		borderColor: "#b91c1c",
		fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
	},
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
	xs: {
		fontSize: "var(--text-2xs)",
		padding: "3px var(--space-2)",
		borderRadius: "var(--radius-sm)",
	},
	sm: { fontSize: "var(--text-xs)", padding: "5px 10px" },
	md: {},
	// lg aligns with OAuthButton's shape so primary CTAs and OAuth buttons
	// stack at the same height (44px) on auth/onboarding forms. fontSize: 13
	// matches OAuthButton; padding swapped from 10px 20px (~40px implicit
	// height) to explicit 0 20px + height 44px for a deterministic match.
	// Every value here lands exactly on a token step except the radius, which moves
	// 9px → 8px.
	lg: {
		fontSize: "var(--text-base)",
		height: "var(--space-11)",
		padding: "0 var(--space-5)",
		borderRadius: "var(--radius-md)",
		fontWeight: "var(--weight-bold)" as CSSProperties["fontWeight"],
	},
};

/**
 * Primary action element. Use exactly one `primary` per surface as the main CTA;
 * pair with `secondary` or `ghost` for adjacent actions; reserve `danger` for
 * destructive operations that cannot be undone.
 *
 * Accepts all native `<button>` props via spread (including `onClick`, `aria-*`,
 * `type`, `form`). Forwards a ref to the underlying element.
 *
 * @example
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="secondary" size="sm">Cancel</Button>
 * <Button variant="danger" icon={<Trash2 size={14} />}>Delete</Button>
 * <Button variant="primary" loading>Saving…</Button>
 */
export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
	{
		as,
		variant = "primary",
		size = "md",
		loading,
		icon,
		children,
		style,
		disabled,
		className,
		type,
		href,
		onClick,
		tabIndex,
		...rest
	},
	ref,
) {
	const Tag = (as ?? "button") as ElementType;
	// The string "button" and nothing else. A custom component passed as `as`
	// might well render a native button underneath, but this component cannot
	// know that, and guessing wrong is what puts a live `disabled` attribute on
	// something that ignores it. Treating every non-string and every other tag as
	// "not a native button" fails towards the ARIA path, which is inert on a real
	// button too — merely redundant rather than broken.
	const isNativeButton = Tag === "button";
	const inert = Boolean(disabled || loading);

	if (process.env.NODE_ENV !== "production" && href !== undefined && isNativeButton) {
		console.warn(
			'Button: `href` was passed but the element renders as <button>, which has no href. Pass as="a" to render a link. The href has been dropped rather than emitted as an invalid attribute.',
		);
	}

	// `disabled` and `type` are button-only attributes; emitting either on an
	// anchor is invalid HTML that the browser ignores, which is precisely how a
	// "disabled" link stays clickable. `type` is dropped entirely on a non-button
	// rather than forwarded, because the three values ButtonProps admits are the
	// button union and none of them means anything on an <a>.
	const nativeButtonProps = isNativeButton ? { disabled: inert, type: type ?? "button" } : {};

	// Spread AFTER `...rest`, deliberately, and empty in every other case. These
	// four are the entire behavioural content of "disabled" on an element that has
	// no disabled attribute, and a consumer who spreads props over the top of them
	// gets a control that reads disabled and behaves live. Nothing else in this
	// component is protected this way, because nothing else is a safety property.
	const inertProps =
		!isNativeButton && inert
			? { "aria-disabled": true as const, tabIndex: -1, href: undefined, onClick: undefined }
			: {};

	return (
		<Tag
			ref={ref}
			className={`ds-atom-btn${className ? ` ${className}` : ""}`}
			data-variant={variant}
			data-loading={loading ? "true" : undefined}
			// aria-busy marks the control as mid-operation. Previously the only
			// signal was a decorative, aria-hidden spinner plus `disabled`, so the
			// transition into a loading state was silent to assistive tech. It is a
			// GLOBAL ARIA attribute, so it carries across the `as` swap unchanged.
			aria-busy={loading || undefined}
			// Withheld while inert on every element, not only the ones that cannot
			// express `disabled`. A native disabled button would not fire it anyway;
			// stating it once here is what makes the anchor path correct without a
			// second branch.
			onClick={inert ? undefined : onClick}
			href={isNativeButton ? undefined : href}
			tabIndex={tabIndex}
			{...nativeButtonProps}
			style={{
				...baseStyle,
				...sizeStyles[size],
				...variantStyles[variant],
				...style,
			}}
			{...rest}
			{...inertProps}
		>
			{loading ? <Spinner /> : icon}
			{children}
		</Tag>
	);
});

function Spinner() {
	return <span className="ds-atom-btn-spinner" aria-hidden="true" />;
}
