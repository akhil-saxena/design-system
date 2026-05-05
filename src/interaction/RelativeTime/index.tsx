import { type HTMLAttributes, forwardRef, useEffect, useState } from "react";

export interface RelativeTimeProps extends HTMLAttributes<HTMLTimeElement> {
	/** Date to format. Accepts Date object, ISO string, or Unix ms timestamp. */
	date: Date | string | number;
	/** Optional prefix rendered in --ink-4 color before the relative string (e.g. "Applied"). */
	prefix?: string;
	/** Recompute interval in ms. Pass 0 to disable live updates. @default 60000 */
	updateInterval?: number;
}

function format(d: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffMin = Math.floor(diffMs / 60_000);
	const diffH = Math.floor(diffMin / 60);
	const diffD = Math.floor(diffH / 24);
	if (diffMin < 0) return `in ${Math.abs(diffMin)}m`;
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffH < 24) return `${diffH}h ago`;
	if (diffD < 30) return `${diffD}d ago`;
	return d.toLocaleDateString();
}

export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(
	function RelativeTime(
		{ date, prefix, updateInterval = 60_000, className, style, ...rest },
		ref,
	) {
		const d = new Date(date);
		const [rel, setRel] = useState(() => format(d));

		useEffect(() => {
			setRel(format(new Date(date)));
			if (updateInterval === 0) return;
			const id = globalThis.setInterval(
				() => setRel(format(new Date(date))),
				updateInterval,
			);
			return () => globalThis.clearInterval(id);
		}, [date, updateInterval]);

		return (
			<time
				ref={ref}
				dateTime={d.toISOString()}
				title={d.toLocaleString()}
				className={`ds-atom-relative-time${className ? ` ${className}` : ""}`}
				style={style}
				{...rest}
			>
				{prefix ? (
					<span style={{ color: "var(--ink-4)" }}>{prefix} </span>
				) : null}
				{rel}
			</time>
		);
	},
);
