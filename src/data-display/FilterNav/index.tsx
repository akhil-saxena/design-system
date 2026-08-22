import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface FilterNavItem {
	/** In-app destination. See `inAppHref` — anything else renders as plain text. */
	href: string;
	label: ReactNode;
	/** Optional stable key. Defaults to the href, which is unique in practice. */
	id?: string;
}

export interface FilterNavProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
	items: FilterNavItem[];
	/** Which item is the current page. Derive it from the URL in the consumer. */
	activeHref: string;
	/**
	 * Accessible name for the `<nav>` landmark. REQUIRED: a nav without one is
	 * announced as an unnamed navigation region, which is the same lesson
	 * AppShell's banner slot produced in 01-13.
	 *
	 * MUST BE UNIQUE PER PAGE. Two navigation landmarks sharing a name are
	 * indistinguishable in a screen reader's landmark list — axe reports it as
	 * `landmark-unique`, and it failed this component's own Sizes story before the
	 * three instances were named apart.
	 */
	ariaLabel: string;
	/** Matches SegmentedControl's scale so the two are visually interchangeable. */
	size?: "sm" | "md" | "lg";
	className?: string;
}

/**
 * The subset of href shapes that become anchors (T-18-01).
 *
 * The same allow-shape rule 01-11 adopted for `FormErrorSummary`, for the same
 * reason: React does NOT block `javascript:` in `href` the way it blocks some
 * attributes, so an unfiltered consumer value would execute on click. Only
 * in-app shapes pass — a leading `/`, `#` or `.`.
 *
 * `//host` is excluded explicitly: it passes a naive leading-slash test but is
 * protocol-relative and leaves the application. The test is on the FIRST
 * character, so a leading-whitespace smuggle (`" javascript:…"`) fails too.
 *
 * FilterNav exists for prerendered in-app category routes, so nothing is lost.
 * A rejected item still renders its label as plain text — the category is still
 * named, it just is not clickable, which beats a live hostile URL.
 */
function inAppHref(href: string | undefined): string | undefined {
	if (!href || href.startsWith("//")) return undefined;
	return /^[/#.]/.test(href) ? href : undefined;
}

/**
 * FilterNav - a category filter that is a real link list (G-9).
 *
 * ## Why this is a separate component and not a prop on SegmentedControl
 *
 * The finding is emphatic: *"Not a hooks problem — an ARIA-pattern problem."*
 * `SegmentedControl` is a WAI-ARIA **radiogroup** — `role="radiogroup"` with
 * `role="radio"` children, `aria-checked` for selection, arrow keys to cycle and
 * select, and a roving tabindex. It has no navigable anchor semantics at all,
 * and an `as="nav"` prop "cannot serve radiogroup and nav/link-list ARIA
 * patterns cleanly — the roles, keyboard model and selected-state semantics all
 * differ."
 *
 * This component is the other pattern:
 *
 * | | SegmentedControl | FilterNav |
 * |---|---|---|
 * | container | `role="radiogroup"` | `<nav aria-label>` |
 * | item | `<button role="radio">` | `<a href>` |
 * | selection | `aria-checked` + `onChange` | `aria-current="page"` |
 * | keyboard | arrow keys cycle and select | Tab between links, Enter follows |
 * | JS | required (controlled state) | **none** |
 *
 * ## Zero JS is a hard requirement, not an optimisation
 *
 * PUB-04 needs prerendered `/photos/[category]` routes that are crawlable and
 * Back-button-capable. Both follow from real anchors and neither can be added
 * afterwards. So there is no state, no effect and no event handler here:
 * selection is a **prop**, derived from the URL by the consumer. If it hydrates,
 * it is the wrong component.
 *
 *   <FilterNav
 *     items={[{ href: "/photos", label: "All" }, { href: "/photos/street", label: "Street" }]}
 *     activeHref={Astro.url.pathname}
 *     ariaLabel="Photo categories"
 *   />
 *
 * ## SHARED CSS — read this before restyling either component
 *
 * The nav carries `ds-atom-segmented` and each anchor carries
 * `ds-atom-segmented-btn`, which are **SegmentedControl's** classes, reused so
 * the two are visually identical rather than similar. The active anchor also
 * carries `data-active="true"`, so it paints from the very same
 * `.ds-atom-segmented-btn[data-active]` rule the active segment does.
 *
 * `ds-atom-filternav` / `ds-atom-filternav-link` carry only what genuinely
 * differs, which is the anchor box: an `<a>` is inline and undecorated by
 * default, so the shared `height` from `[data-size]` would do nothing without a
 * `display: inline-flex` here.
 *
 * **A restyle of `.ds-atom-segmented*` changes this component too.** That
 * coupling is deliberate (visual parity is the requirement) and it is noted in
 * SegmentedControl's docstring as well, because an undocumented shared class is
 * exactly how parity breaks.
 */
export const FilterNav = forwardRef<HTMLElement, FilterNavProps>(function FilterNav(
	{ items, activeHref, ariaLabel, size = "md", className, ...rest },
	ref,
) {
	// An empty labelled landmark is noise in the landmark list.
	if (items.length === 0) return null;

	// Exactly one item may be current, even when consumer data repeats an href.
	// Two is as wrong as zero.
	const currentIndex = items.findIndex((item) => item.href === activeHref);

	return (
		<nav
			ref={ref}
			aria-label={ariaLabel}
			className={`ds-atom-segmented ds-atom-filternav${className ? ` ${className}` : ""}`}
			data-size={size}
			{...rest}
		>
			{items.map((item, i) => {
				const safe = inAppHref(item.href);
				const isCurrent = i === currentIndex;
				const key = item.id ?? `${item.href}-${i}`;
				if (safe === undefined) {
					return (
						<span
							key={key}
							className="ds-atom-segmented-btn ds-atom-filternav-link"
							data-rejected="true"
						>
							{item.label}
						</span>
					);
				}
				return (
					<a
						key={key}
						href={safe}
						className="ds-atom-segmented-btn ds-atom-filternav-link"
						// The nav pattern's selected-state semantics. Not aria-checked,
						// which belongs to the radiogroup this component deliberately is
						// not.
						aria-current={isCurrent ? "page" : undefined}
						data-active={isCurrent ? "true" : undefined}
					>
						{item.label}
					</a>
				);
			})}
		</nav>
	);
});
