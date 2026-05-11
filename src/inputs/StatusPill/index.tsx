import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type StatusPillStage =
	| "wishlist"
	| "applied"
	| "screening"
	| "interviewing"
	| "offer"
	| "closed";

interface StatusPillBaseProps {
	/** Pipeline stage — drives bg/color tinting. */
	stage: StatusPillStage;
	/** Show trailing chevron (▾) — signals the pill is a dropdown trigger. */
	withChevron?: boolean;
	/** When true, renders as <button>. When false, renders as <span> and ignores
	 * onClick. Use false for table cells / read-only kanban cards where the pill
	 * is decorative.
	 * @default true
	 */
	interactive?: boolean;
	children: ReactNode;
}

export type StatusPillProps = StatusPillBaseProps &
	(
		| (Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof StatusPillBaseProps> & {
				interactive?: true;
		  })
		| (Omit<HTMLAttributes<HTMLSpanElement>, keyof StatusPillBaseProps> & {
				interactive: false;
		  })
	);

/**
 * StatusPill - per-stage tinted chip for Cairn-style kanban + DataGrid status columns.
 *
 * Six locked stage variants (`wishlist`, `applied`, `screening`, `interviewing`,
 * `offer`, `closed`) map to subtle tints — `wishlist`/`applied` are outlined,
 * `screening`/`interviewing` use amber tints, `offer` uses green, `closed` is muted.
 * Use the same atom in both kanban cards and DataGrid status columns so the
 * visual contract stays single-sourced.
 *
 *   <StatusPill stage="screening" withChevron onClick={openMenu}>Screening</StatusPill>
 *   <StatusPill stage="offer" interactive={false}>Offer</StatusPill>
 *
 * Visual styling lives in primitives.css under `.ds-atom-statuspill[.stage]`.
 */
export const StatusPill = forwardRef<HTMLButtonElement | HTMLSpanElement, StatusPillProps>(
	function StatusPill(
		{ stage, withChevron, interactive = true, className, children, ...rest },
		ref,
	) {
		const cls = `ds-atom-statuspill ${stage}${className ? ` ${className}` : ""}`;
		if (interactive) {
			return (
				<button
					ref={ref as React.Ref<HTMLButtonElement>}
					type="button"
					className={cls}
					data-stage={stage}
					data-interactive="true"
					{...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
				>
					{children}
					{withChevron && (
						<span className="ds-atom-statuspill-chev" aria-hidden="true">
							▾
						</span>
					)}
				</button>
			);
		}
		return (
			<span
				ref={ref as React.Ref<HTMLSpanElement>}
				className={cls}
				data-stage={stage}
				data-interactive="false"
				{...(rest as HTMLAttributes<HTMLSpanElement>)}
			>
				{children}
				{withChevron && (
					<span className="ds-atom-statuspill-chev" aria-hidden="true">
						▾
					</span>
				)}
			</span>
		);
	},
);
