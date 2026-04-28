import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type AlertBannerTone = "info" | "success" | "warning" | "error";

export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	open: boolean;
	onDismiss?: () => void;
	tone?: AlertBannerTone;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
	dismissible?: boolean;
}

const TONE_ICON: Record<AlertBannerTone, ReactNode> = {
	info: <Info size={16} aria-hidden="true" />,
	success: <CheckCircle2 size={16} aria-hidden="true" />,
	warning: <AlertTriangle size={16} aria-hidden="true" />,
	error: <XCircle size={16} aria-hidden="true" />,
};

const baseStyle: CSSProperties = {
	boxSizing: "border-box",
	display: "flex",
};

/**
 * AlertBanner — inline-flow controlled tone banner (D-410, D-411).
 *
 *   <AlertBanner
 *     open={showTrialBanner}
 *     onDismiss={() => setShowTrialBanner(false)}
 *     tone="warning"
 *     title="Trial ends in 3 days"
 *     description="Upgrade now to keep your data."
 *   />
 *
 *   <AlertBanner open tone="success" title="Saved as draft" />   // non-dismissible
 *
 * Controlled — caller manages `open`. Returns `null` when `open === false`.
 * NO auto-dismiss (different from Toast). For ephemeral feedback use Toast (DS-40).
 *
 * Layout: `[icon] [title + description-or-children] [dismiss-X-when-dismissible]`.
 * Tone via `data-variant` (Card pattern); CSS attribute selectors in primitives.css
 * apply tone-tinted bg + border + icon-color.
 *
 * `dismissible` defaults to `!!onDismiss` — passing `onDismiss` shows the X by default.
 * Force-hide with `dismissible={false}` (consumer wants to control close another way).
 */
export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(function AlertBanner(
	{
		open,
		onDismiss,
		tone = "info",
		title,
		description,
		children,
		dismissible,
		className,
		style,
		...rest
	},
	ref,
) {
	if (!open) return null;
	const showDismiss = dismissible ?? Boolean(onDismiss);
	const body = children ?? description;
	return (
		<div
			ref={ref}
			className={`ds-atom-banner${className ? ` ${className}` : ""}`}
			data-variant={tone}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			<span className="ds-atom-banner-icon" aria-hidden="true">
				{TONE_ICON[tone]}
			</span>
			<div className="ds-atom-banner-body">
				<div className="ds-atom-banner-title">{title}</div>
				{body ? <div className="ds-atom-banner-desc">{body}</div> : null}
			</div>
			{showDismiss ? (
				<button
					type="button"
					className="ds-atom-banner-close"
					aria-label="Dismiss"
					onClick={onDismiss}
				>
					<X size={14} aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
});
