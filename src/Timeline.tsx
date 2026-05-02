/**
 * Timeline (DS-66)
 *
 * API:
 * - events: TimelineEvent[] — { id, date, label, description?, color?, onClick? }
 * - orientation: "horizontal" | "vertical" (default horizontal)
 * - ariaLabel: string (default "Timeline")
 * - className / style passthrough
 *
 * Implementation:
 * - <ol> + <li> + <time dateTime=...> per WAI-ARIA time-sequence display
 * - Amber dot + connector line between events via CSS ::after pseudo-element (no extra DOM)
 * - Read-only by default; focusable + keyboard-activatable when event.onClick provided
 * - Dark-mode tokens applied — dot is amber, line is rule, label is ink
 */
import { type CSSProperties, forwardRef } from "react";

export interface TimelineEvent {
	id: string | number;
	date: Date | string; // string interpreted as ISO
	label: string;
	description?: string;
	color?: string; // dot color override (default amber via CSS var)
	onClick?: () => void; // makes the event focusable + keyboard-activatable
}

export interface TimelineProps {
	/** Ordered array of events rendered as dots connected by a line. */
	events: TimelineEvent[];
	/** Layout direction of the timeline.
	 * @default "horizontal"
	 */
	orientation?: "horizontal" | "vertical";
	/** Additional className applied to the root `<ol>` element. */
	className?: string;
	/** Inline styles applied to the root `<ol>` element. */
	style?: CSSProperties;
	/** Accessible label for the `<ol>` list.
	 * @default "Timeline"
	 */
	ariaLabel?: string;
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

function toDate(d: Date | string): Date {
	return d instanceof Date ? d : new Date(d);
}

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
	{ events, orientation = "horizontal", className, style, ariaLabel = "Timeline" },
	ref,
) {
	return (
		<ol
			ref={ref}
			aria-label={ariaLabel}
			className={`ds-atom-timeline${className ? ` ${className}` : ""}`}
			style={style}
			data-orientation={orientation}
		>
			{events.map((ev) => {
				const dateObj = toDate(ev.date);
				const iso = dateObj.toISOString();
				const formatted = DATE_FMT.format(dateObj);

				const dot = (
					<span
						className="ds-atom-timeline-dot"
						style={ev.color ? { background: ev.color } : undefined}
						aria-hidden="true"
					/>
				);

				const inner = (
					<>
						{dot}
						<time dateTime={iso} className="ds-atom-timeline-date">
							{formatted}
						</time>
						<span className="ds-atom-timeline-label">{ev.label}</span>
						{ev.description ? (
							<span className="ds-atom-timeline-desc">{ev.description}</span>
						) : null}
					</>
				);

				return (
					<li key={ev.id} className="ds-atom-timeline-event">
						{ev.onClick ? (
							<button type="button" onClick={ev.onClick} className="ds-atom-timeline-trigger">
								{inner}
							</button>
						) : (
							inner
						)}
					</li>
				);
			})}
		</ol>
	);
});
