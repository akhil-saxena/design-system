import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	/**
	 * Optional icon rendered above the title. Pass a lucide icon or any SVG at **40×40**.
	 * Omit for minimal inline empty states where an icon would add visual noise.
	 */
	icon?: ReactNode;
	/**
	 * Primary heading. Required. Rendered in the display font at 600 weight.
	 * Keep to one short sentence — "No applications yet", "Nothing matched".
	 */
	title: ReactNode;
	/**
	 * Secondary line below the title. Use to explain why the state occurred or
	 * suggest the next action. Rendered in `--ink-3` (flips with dark mode).
	 */
	description?: ReactNode;
	/**
	 * CTA slot. Pass one or two `<Button>` elements (or any ReactNode).
	 * Rendered as a flex row below the description.
	 * Common patterns: single primary Button, primary + ghost pair.
	 */
	children?: ReactNode;
}

const baseStyle: CSSProperties = {
	boxSizing: "border-box",
};

/**
 * EmptyState — centered display for empty/no-data/first-run states (DS-44, D-421).
 *
 *   <EmptyState
 *     icon={<Inbox size={40} />}
 *     title="No applications yet"
 *     description="Add your first job to get started."
 *   >
 *     <Button>Add application</Button>
 *   </EmptyState>
 *
 * Centered vertical stack: icon → title → description → children-as-CTA.
 * Children slot accepts arbitrary JSX — single Button, primary+secondary
 * Buttons in a row, link, or any combination.
 *
 * NO compound API (no `<EmptyState.Icon>`, `<EmptyState.Action>`).
 * Structured props for icon/title/description; children for CTA actions.
 *
 * Padding `var(--space-8)` outer; gap `var(--space-3)` between stack
 * elements; max-width 360px on text content (consumer can override via
 * `style` or wrapping container width).
 *
 * `description` color uses `var(--ink-3)` token — flips with theme.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
	{ icon, title, description, children, className, style, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			className={["ds-atom-empty", className].filter(Boolean).join(" ")}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			{icon ? (
				<div className="ds-atom-empty-icon" aria-hidden="true">
					{icon}
				</div>
			) : null}
			<div className="ds-atom-empty-title">{title}</div>
			{description ? <div className="ds-atom-empty-desc">{description}</div> : null}
			{children ? <div className="ds-atom-empty-actions">{children}</div> : null}
		</div>
	);
});
