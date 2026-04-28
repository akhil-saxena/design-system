import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	icon?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
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
			className={`ds-atom-empty${className ? ` ${className}` : ""}`}
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
