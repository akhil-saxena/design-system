import { type CSSProperties, useEffect, useRef } from "react";

export interface RollingNumberProps {
	value: number;
	format?: (value: number) => string;
	prefix?: string;
	suffix?: string;
	ariaLabel?: string;
	className?: string;
	style?: CSSProperties;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function RollingNumber({
	value,
	format,
	prefix,
	suffix,
	ariaLabel,
	className,
	style,
}: RollingNumberProps) {
	const core = format ? format(value) : String(value);
	const display = `${prefix ?? ""}${core}${suffix ?? ""}`;

	const firstRender = useRef(true);
	useEffect(() => {
		firstRender.current = false;
	}, []);

	const stripTransitionStyle: CSSProperties = firstRender.current ? { transition: "none" } : {};

	return (
		<span
			className={`ds-atom-rolling${className ? ` ${className}` : ""}`}
			style={style}
			aria-live="polite"
			aria-label={ariaLabel ?? display}
		>
			{display.split("").map((char, i) => {
				if (/[0-9]/.test(char)) {
					const digit = Number.parseInt(char, 10);
					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: digit-by-position rendering, key by index is correct
							key={`d-${i}`}
							className="ds-atom-rolling-cell"
							aria-hidden="true"
						>
							<span
								className="ds-atom-rolling-strip"
								style={{
									transform: `translateY(${-digit * 22}px)`,
									...stripTransitionStyle,
								}}
							>
								{DIGITS.map((n) => (
									<span key={n}>{n}</span>
								))}
							</span>
						</span>
					);
				}
				return (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: char-by-position rendering, key by index is correct
						key={`s-${i}`}
						className="ds-atom-rolling-static"
						aria-hidden="true"
					>
						{char}
					</span>
				);
			})}
		</span>
	);
}
