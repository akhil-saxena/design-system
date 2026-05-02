// @akhil-saxena/design-system/illustrations — DS-81 spot illustrations.
// 24 named SVG React components. Import individually for tree-shaking:
//   import { MailSent } from '@akhil-saxena/design-system/illustrations'
import type { CSSProperties } from "react";

export interface IllustrationProps {
	width?: number;
	height?: number;
	className?: string;
	style?: CSSProperties;
}

export function MailSent({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="40" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="30"
				y="32"
				width="60"
				height="40"
				rx="3"
				fill="var(--cream-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path d="M30 32 L60 56 L90 32" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
			<circle cx="60" cy="20" r="6" fill="var(--amber)" />
			<path
				d="M48 18 L60 14 L72 18"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function Documents({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="40" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="35"
				y="22"
				width="42"
				height="52"
				rx="3"
				fill="var(--ink)"
				opacity=".15"
				transform="rotate(-6 56 48)"
			/>
			<rect
				x="40"
				y="20"
				width="42"
				height="52"
				rx="3"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line x1="48" y1="32" x2="74" y2="32" stroke="var(--ink)" strokeWidth="1.5" />
			<line x1="48" y1="40" x2="68" y2="40" stroke="var(--ink)" strokeWidth="1.5" />
			<line x1="48" y1="48" x2="74" y2="48" stroke="var(--ink)" strokeWidth="1.5" />
			<circle cx="86" cy="58" r="10" fill="var(--amber)" />
			<path
				d="M82 58 L85 61 L91 55"
				stroke="var(--cream)"
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function Rocket({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="82" rx="34" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M60 18 Q72 30 72 50 L72 64 L48 64 L48 50 Q48 30 60 18Z"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="60" cy="42" r="6" fill="var(--amber)" />
			<path d="M48 56 L40 70 L48 64Z M72 56 L80 70 L72 64Z" fill="var(--amber)" />
			<path
				d="M52 70 Q60 82 68 70"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<circle cx="30" cy="30" r="2" fill="var(--ink)" />
			<circle cx="90" cy="36" r="1.5" fill="var(--ink)" />
			<circle cx="22" cy="50" r="1.5" fill="var(--ink)" />
		</svg>
	);
}

export function Celebrate({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="36" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M40 70 L20 30 L60 50 Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M30 40 L40 38 M28 50 L38 48 M30 60 L40 58"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<circle cx="80" cy="20" r="3" fill="var(--amber)" />
			<circle cx="92" cy="36" r="2.5" fill="var(--blue)" />
			<circle cx="76" cy="44" r="2" fill="var(--red)" />
			<circle cx="100" cy="52" r="2.5" fill="var(--amber)" />
			<path
				d="M82 28 L86 24 M96 30 L100 28 M84 38 L88 42"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function Lightbulb({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="22" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M60 14 Q44 14 44 30 Q44 40 50 46 L50 60 L70 60 L70 46 Q76 40 76 30 Q76 14 60 14Z"
				fill="var(--amber)"
				opacity=".25"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path d="M50 60 L70 60 L70 64 L50 64 Z M52 64 L68 64 L66 70 L54 70 Z" fill="var(--ink)" />
			<path
				d="M30 30 L20 30 M90 30 L100 30 M36 16 L28 12 M84 16 L92 12 M36 44 L28 48 M84 44 L92 48"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function Idea({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="24" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle
				cx="60"
				cy="40"
				r="20"
				fill="var(--amber)"
				opacity=".3"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M52 50 L52 60 L68 60 L68 50"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line x1="50" y1="64" x2="70" y2="64" stroke="var(--ink)" strokeWidth="1.5" />
			<line x1="54" y1="68" x2="66" y2="68" stroke="var(--ink)" strokeWidth="1.5" />
			<path
				d="M60 30 L60 38 M52 36 L57 40 M68 36 L63 40"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M22 30 L30 30 M90 30 L98 30 M28 16 L34 22 M92 16 L86 22"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IllustrationSearch({
	width = 120,
	height = 120,
	className,
	style,
}: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="32" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle cx="50" cy="42" r="20" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.5" />
			<circle cx="50" cy="42" r="14" fill="var(--amber)" opacity=".2" />
			<line
				x1="64"
				y1="56"
				x2="80"
				y2="72"
				stroke="var(--ink)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<path
				d="M44 38 Q50 32 56 38"
				stroke="var(--ink)"
				strokeWidth="1.5"
				fill="none"
				strokeLinecap="round"
			/>
			<circle cx="46" cy="44" r="1.5" fill="var(--ink)" />
			<circle cx="54" cy="44" r="1.5" fill="var(--ink)" />
		</svg>
	);
}

export function Plant({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="28" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M40 76 L48 56 L72 56 L80 76 Z"
				fill="var(--cream-3)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path d="M60 56 L60 30" stroke="var(--ink)" strokeWidth="2" />
			<path
				d="M60 40 Q44 36 40 22 Q56 22 60 38 Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M60 32 Q76 28 80 14 Q64 14 60 30 Z"
				fill="var(--amber)"
				opacity=".7"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

export function Cloud({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="34" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M40 56 Q26 56 26 44 Q26 32 40 32 Q42 22 56 22 Q72 22 74 36 Q90 36 90 50 Q90 60 78 60 L42 60 Q40 60 40 56"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M50 66 L46 76 M60 66 L56 76 M70 66 L66 76"
				stroke="var(--amber)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function EmptyBox({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="36" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M30 46 L60 30 L90 46 L90 72 L30 72 Z"
				fill="var(--cream-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M30 46 L60 60 L90 46"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<line x1="60" y1="30" x2="60" y2="60" stroke="var(--ink)" strokeWidth="1.5" />
			<path
				d="M44 22 L40 14 M76 22 L80 14 M60 18 L60 10"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function ConnectionLost({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="32" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M30 50 Q60 20 90 50"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2"
				strokeDasharray="4 3"
				opacity=".4"
			/>
			<path d="M40 56 Q60 38 80 56" fill="none" stroke="var(--ink)" strokeWidth="2" opacity=".7" />
			<circle cx="60" cy="68" r="4" fill="var(--ink)" />
			<line
				x1="20"
				y1="20"
				x2="100"
				y2="76"
				stroke="var(--red)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IllustrationError({
	width = 120,
	height = 120,
	className,
	style,
}: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="28" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle cx="60" cy="44" r="26" fill="var(--cream-2)" stroke="var(--ink)" strokeWidth="1.5" />
			<circle cx="60" cy="44" r="26" fill="var(--red)" opacity=".15" />
			<line
				x1="50"
				y1="34"
				x2="70"
				y2="54"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="70"
				y1="34"
				x2="50"
				y2="54"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function Inbox({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="36" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M28 50 L36 30 L84 30 L92 50 L92 72 L28 72 Z"
				fill="var(--cream-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M28 50 L46 50 L50 56 L70 56 L74 50 L92 50"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="48"
				y="14"
				width="24"
				height="14"
				rx="2"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line x1="52" y1="20" x2="68" y2="20" stroke="var(--ink)" strokeWidth="1.5" />
		</svg>
	);
}

export function GraphUp({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="40" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="20"
				y="20"
				width="80"
				height="50"
				rx="2"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<polyline
				points="28,60 40,52 52,42 64,46 76,32 88,24"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<polyline
				points="28,60 40,52 52,42 64,46 76,32 88,24 88,62 28,62"
				fill="var(--amber)"
				opacity=".18"
				stroke="none"
			/>
			<circle cx="88" cy="24" r="3" fill="var(--amber)" />
		</svg>
	);
}

export function Chart({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="38" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<line x1="22" y1="70" x2="98" y2="70" stroke="var(--ink)" strokeWidth="1.5" />
			<line x1="22" y1="14" x2="22" y2="70" stroke="var(--ink)" strokeWidth="1.5" />
			<rect
				x="32"
				y="50"
				width="12"
				height="20"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="50"
				y="36"
				width="12"
				height="34"
				fill="var(--amber)"
				opacity=".7"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="68"
				y="44"
				width="12"
				height="26"
				fill="var(--amber)"
				opacity=".5"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect x="86" y="22" width="12" height="48" fill="var(--ink)" />
		</svg>
	);
}

export function CalendarEvent({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="32" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="28"
				y="22"
				width="64"
				height="50"
				rx="3"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path d="M28 32 L92 32" stroke="var(--ink)" strokeWidth="1.5" />
			<line
				x1="40"
				y1="18"
				x2="40"
				y2="28"
				stroke="var(--ink)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<line
				x1="80"
				y1="18"
				x2="80"
				y2="28"
				stroke="var(--ink)"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<rect x="50" y="42" width="20" height="14" rx="2" fill="var(--amber)" />
		</svg>
	);
}

export function Team({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="82" rx="40" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle cx="40" cy="40" r="10" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1.5" />
			<path
				d="M22 76 Q22 60 40 60 Q58 60 58 76 Z"
				fill="var(--cream-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="80" cy="44" r="8" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.5" />
			<path
				d="M64 76 Q64 62 80 62 Q96 62 96 76 Z"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

export function Thinking({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="26" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle
				cx="60"
				cy="44"
				r="20"
				fill="var(--amber)"
				opacity=".25"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="54" cy="42" r="1.5" fill="var(--ink)" />
			<circle cx="66" cy="42" r="1.5" fill="var(--ink)" />
			<path
				d="M55 52 Q60 56 65 52"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M84 28 L92 22 M88 38 L96 36"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<circle cx="98" cy="24" r="3" fill="var(--amber)" />
		</svg>
	);
}

export function Lock({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="26" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="40"
				y="42"
				width="40"
				height="32"
				rx="3"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M48 42 L48 30 Q48 18 60 18 Q72 18 72 30 L72 42"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2"
			/>
			<circle cx="60" cy="56" r="4" fill="var(--ink)" />
			<line x1="60" y1="56" x2="60" y2="64" stroke="var(--ink)" strokeWidth="2" />
		</svg>
	);
}

export function Puzzle({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="32" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M30 30 L52 30 Q52 22 60 22 Q68 22 68 30 L90 30 L90 50 Q82 50 82 58 Q82 66 90 66 L90 76 L30 76 Z"
				fill="var(--amber)"
				opacity=".6"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function Workflow({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="40" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect
				x="14"
				y="34"
				width="22"
				height="20"
				rx="3"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="49"
				y="34"
				width="22"
				height="20"
				rx="3"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="84"
				y="34"
				width="22"
				height="20"
				rx="3"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line x1="36" y1="44" x2="49" y2="44" stroke="var(--ink)" strokeWidth="1.5" />
			<line x1="71" y1="44" x2="84" y2="44" stroke="var(--ink)" strokeWidth="1.5" />
			<polygon points="44,40 49,44 44,48" fill="var(--ink)" />
			<polygon points="79,40 84,44 79,48" fill="var(--ink)" />
		</svg>
	);
}

export function Travel({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="36" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<path
				d="M22 56 Q60 32 100 56 L96 64 Q60 44 26 64 Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<circle cx="60" cy="48" r="4" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.5" />
			<path d="M14 70 L106 70" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="3 3" />
			<circle cx="32" cy="20" r="3" fill="var(--amber)" />
			<circle cx="88" cy="24" r="2" fill="var(--ink)" />
		</svg>
	);
}

export function IllustrationSuccess({
	width = 120,
	height = 120,
	className,
	style,
}: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="28" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<circle cx="60" cy="44" r="26" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1.5" />
			<path
				d="M48 44 L56 52 L72 36"
				fill="none"
				stroke="var(--cream)"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="20" cy="22" r="2" fill="var(--ink)" />
			<circle cx="100" cy="30" r="2" fill="var(--ink)" />
			<circle cx="14" cy="50" r="1.5" fill="var(--ink)" />
		</svg>
	);
}

export function PhoneScreen({ width = 120, height = 120, className, style }: IllustrationProps) {
	return (
		<svg
			viewBox="0 0 120 90"
			width={width}
			height={height}
			className={className}
			style={style}
			aria-hidden="true"
		>
			<ellipse cx="60" cy="80" rx="20" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			<rect x="44" y="14" width="32" height="60" rx="5" fill="var(--ink)" />
			<rect x="46" y="20" width="28" height="46" rx="2" fill="var(--amber)" opacity=".3" />
			<rect x="50" y="26" width="20" height="4" rx="1" fill="var(--cream)" />
			<rect x="50" y="34" width="14" height="3" rx="1" fill="var(--cream)" opacity=".7" />
			<rect x="50" y="42" width="20" height="14" rx="2" fill="var(--cream)" opacity=".5" />
			<circle cx="60" cy="71" r="1.5" fill="var(--cream)" />
		</svg>
	);
}
