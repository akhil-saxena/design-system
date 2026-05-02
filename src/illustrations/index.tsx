// @akhil-saxena/design-system/illustrations — DS-81 spot illustrations.
// 24 named SVG React components. Import individually for tree-shaking:
//   import { MailSent } from '@akhil-saxena/design-system/illustrations'
//
// Surface fills: use --ds-illust-bg / --ds-illust-bg-2 (defined in tokens.css).
// In light mode these resolve to cream-2 / cream-3; in dark mode to
// translucent white so shapes stay visible on dark backgrounds.
import type { CSSProperties } from "react";

export interface IllustrationProps {
	readonly width?: number;
	readonly height?: number;
	readonly className?: string;
	readonly style?: CSSProperties;
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
			<ellipse cx="60" cy="82" rx="38" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Envelope body */}
			<rect
				x="22"
				y="28"
				width="64"
				height="44"
				rx="3"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Envelope flap V */}
			<path
				d="M22 28 L54 54 L60 58 L66 54 L98 28"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Envelope bottom fold lines */}
			<path
				d="M22 72 L46 50 M98 72 L74 50"
				stroke="var(--ink)"
				strokeWidth="1"
				opacity=".3"
				strokeLinecap="round"
			/>
			{/* Amber send arrow */}
			<circle cx="88" cy="20" r="8" fill="var(--amber)" />
			<path
				d="M84 20 L91 20 M88 16 L92 20 L88 24"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
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
			<ellipse cx="60" cy="82" rx="38" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Back doc (rotated) */}
			<rect
				x="36"
				y="22"
				width="40"
				height="50"
				rx="3"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".7"
				transform="rotate(-5 56 47)"
			/>
			{/* Front doc */}
			<rect
				x="42"
				y="18"
				width="40"
				height="50"
				rx="3"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line
				x1="50"
				y1="30"
				x2="74"
				y2="30"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".5"
				strokeLinecap="round"
			/>
			<line
				x1="50"
				y1="37"
				x2="70"
				y2="37"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".5"
				strokeLinecap="round"
			/>
			<line
				x1="50"
				y1="44"
				x2="74"
				y2="44"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".5"
				strokeLinecap="round"
			/>
			<line
				x1="50"
				y1="51"
				x2="66"
				y2="51"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".5"
				strokeLinecap="round"
			/>
			{/* Amber check badge */}
			<circle cx="84" cy="56" r="10" fill="var(--amber)" stroke="var(--cream)" strokeWidth="2" />
			<path
				d="M79 56 L82 59 L89 52"
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
			<ellipse cx="60" cy="83" rx="30" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Rocket body */}
			<path
				d="M60 12 Q74 24 74 48 L74 64 L46 64 L46 48 Q46 24 60 12Z"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Window */}
			<circle
				cx="60"
				cy="38"
				r="7"
				fill="var(--amber)"
				opacity=".8"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="60" cy="38" r="3.5" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1" />
			{/* Fins */}
			<path
				d="M46 54 L34 68 L46 62Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M74 54 L86 68 L74 62Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Flame */}
			<path
				d="M52 66 Q56 76 60 80 Q64 76 68 66"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			{/* Stars */}
			<circle cx="26" cy="26" r="2" fill="var(--ink)" />
			<circle cx="94" cy="20" r="1.5" fill="var(--ink)" />
			<circle cx="18" cy="48" r="1.5" fill="var(--ink)" />
			<circle cx="100" cy="44" r="1" fill="var(--ink)" />
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
			<ellipse cx="60" cy="82" rx="36" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Party popper */}
			<path
				d="M36 72 L16 28 L58 48 Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M26 40 L36 38 M24 50 L34 48 M26 60 L36 58"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Confetti dots */}
			<circle cx="78" cy="18" r="4" fill="var(--amber)" />
			<circle cx="94" cy="34" r="3" fill="var(--blue-vivid)" opacity=".8" />
			<circle cx="76" cy="42" r="2.5" fill="var(--red-vivid)" opacity=".8" />
			<circle cx="102" cy="50" r="3" fill="var(--amber)" opacity=".7" />
			<circle cx="88" cy="56" r="2" fill="var(--green-vivid)" opacity=".8" />
			{/* Confetti streamers */}
			<path
				d="M80 26 L86 20 M98 28 L102 22 M84 40 L90 44 M106 42 L110 38"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".4"
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
			<ellipse cx="60" cy="82" rx="22" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Bulb glow */}
			<path
				d="M60 12 Q42 12 42 30 Q42 42 50 48 L50 62 L70 62 L70 48 Q78 42 78 30 Q78 12 60 12Z"
				fill="var(--amber)"
				opacity=".35"
			/>
			{/* Bulb outline */}
			<path
				d="M60 12 Q42 12 42 30 Q42 42 50 48 L50 62 L70 62 L70 48 Q78 42 78 30 Q78 12 60 12Z"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Base segments */}
			<path
				d="M50 62 L70 62 L70 67 L50 67 Z"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M52 67 L68 67 L65 72 L55 72 Z"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Filament */}
			<path
				d="M55 44 Q60 36 65 44"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Rays */}
			<path
				d="M28 30 L20 30 M92 30 L100 30 M34 14 L28 8 M86 14 L92 8 M34 46 L28 52 M86 46 L92 52"
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
			<ellipse cx="60" cy="82" rx="24" ry="3" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Head circle */}
			<circle
				cx="60"
				cy="38"
				r="22"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Amber brain/idea glow */}
			<circle cx="60" cy="38" r="14" fill="var(--amber)" opacity=".3" />
			{/* Thought bubbles */}
			<circle
				cx="86"
				cy="22"
				r="6"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle
				cx="95"
				cy="14"
				r="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle
				cx="102"
				cy="8"
				r="2.5"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1"
			/>
			{/* Face — neutral curious expression */}
			<circle cx="53" cy="36" r="2" fill="var(--ink)" />
			<circle cx="67" cy="36" r="2" fill="var(--ink)" />
			<path
				d="M55 44 Q60 46 65 44"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Neck / torso hint */}
			<path
				d="M52 58 L52 66 L68 66 L68 58"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
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
			<ellipse cx="54" cy="82" rx="32" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Magnifying glass lens */}
			<circle
				cx="48"
				cy="40"
				r="22"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="48" cy="40" r="15" fill="var(--amber)" opacity=".15" />
			{/* Text lines suggesting content being searched */}
			<line
				x1="40"
				y1="34"
				x2="56"
				y2="34"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".5"
			/>
			<line
				x1="40"
				y1="40"
				x2="54"
				y2="40"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".5"
			/>
			<line
				x1="40"
				y1="46"
				x2="56"
				y2="46"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".5"
			/>
			{/* Amber highlight line (active search hit) */}
			<line
				x1="40"
				y1="40"
				x2="54"
				y2="40"
				stroke="var(--amber)"
				strokeWidth="3"
				strokeLinecap="round"
				opacity=".55"
			/>
			{/* Handle */}
			<line
				x1="64"
				y1="56"
				x2="82"
				y2="74"
				stroke="var(--ink)"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
			{/* Sparkle accent */}
			<circle cx="88" cy="22" r="3.5" fill="var(--amber)" />
			<circle cx="96" cy="32" r="2" fill="var(--amber)" opacity=".5" />
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
			<ellipse cx="60" cy="82" rx="28" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Pot */}
			<path
				d="M42 58 L48 74 L72 74 L78 58 Z"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path d="M38 56 L82 56" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
			{/* Stem */}
			<path d="M60 56 L60 30" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
			{/* Left leaf */}
			<path
				d="M60 42 Q44 38 40 22 Q56 22 60 40 Z"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Right leaf */}
			<path
				d="M60 32 Q76 28 80 12 Q64 12 60 30 Z"
				fill="var(--amber)"
				opacity=".75"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Soil line */}
			<line x1="44" y1="58" x2="76" y2="58" stroke="var(--ink)" strokeWidth="1" opacity=".3" />
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
			<ellipse cx="64" cy="82" rx="36" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Sun */}
			<circle cx="22" cy="22" r="10" fill="var(--amber)" opacity=".85" />
			<path
				d="M22 9 L22 5 M32 14 L35 11 M36 22 L40 22 M32 30 L35 33 M22 35 L22 39 M12 30 L9 33 M8 22 L4 22 M12 14 L9 11"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Cloud — smooth multi-bump shape */}
			<path
				d="M32 66 Q18 66 18 52 Q18 40 30 38 Q32 26 46 28 Q50 18 62 22 Q70 16 80 22 Q92 20 94 34 Q104 36 104 50 Q104 66 90 66 Z"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
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
			<ellipse cx="60" cy="82" rx="38" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Box back face */}
			<path
				d="M30 46 L60 30 L90 46 L90 74 L30 74 Z"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Box top crease */}
			<path
				d="M30 46 L60 62 L90 46"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<line x1="60" y1="30" x2="60" y2="62" stroke="var(--ink)" strokeWidth="1.5" opacity=".5" />
			{/* Open flaps */}
			<path
				d="M40 30 L44 18 M80 30 L76 18"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".5"
			/>
			{/* Amber sparkle — empty/waiting */}
			<circle cx="60" cy="22" r="3" fill="var(--amber)" />
			<path
				d="M44 20 L40 12 M76 20 L80 12"
				stroke="var(--amber)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".7"
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
			<ellipse cx="60" cy="82" rx="34" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* WiFi arcs — faded/broken */}
			<path
				d="M20 52 Q60 14 100 52"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2"
				strokeDasharray="4 3"
				opacity=".3"
			/>
			<path
				d="M32 58 Q60 34 88 58"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2"
				opacity=".55"
				strokeLinecap="round"
			/>
			<path
				d="M44 64 Q60 50 76 64"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2"
				opacity=".8"
				strokeLinecap="round"
			/>
			{/* Connection dot */}
			<circle cx="60" cy="70" r="4" fill="var(--ink)" />
			{/* Red slash — disconnected */}
			<line
				x1="20"
				y1="18"
				x2="100"
				y2="78"
				stroke="var(--red-vivid)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="22"
				y1="16"
				x2="102"
				y2="76"
				stroke="var(--cream)"
				strokeWidth="1"
				strokeLinecap="round"
				opacity=".5"
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
			<ellipse cx="60" cy="82" rx="30" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Background circle */}
			<circle
				cx="60"
				cy="42"
				r="28"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="60" cy="42" r="28" fill="var(--red-vivid)" opacity=".12" />
			{/* X mark */}
			<line
				x1="47"
				y1="30"
				x2="73"
				y2="54"
				stroke="var(--red-vivid)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<line
				x1="73"
				y1="30"
				x2="47"
				y2="54"
				stroke="var(--red-vivid)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			{/* Small decorative dots */}
			<circle cx="20" cy="20" r="2" fill="var(--ink)" opacity=".3" />
			<circle cx="100" cy="28" r="1.5" fill="var(--ink)" opacity=".3" />
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
			<ellipse cx="60" cy="82" rx="38" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Tray body */}
			<path
				d="M24 52 L34 28 L86 28 L96 52 L96 74 L24 74 Z"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Tray shelf divider */}
			<path
				d="M24 52 L44 52 Q48 58 60 58 Q72 58 76 52 L96 52"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Envelope in tray */}
			<rect
				x="42"
				y="36"
				width="36"
				height="24"
				rx="2"
				fill="var(--cream)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M42 36 L60 50 L78 36"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Amber notification dot */}
			<circle cx="80" cy="24" r="6" fill="var(--amber)" />
			<path
				d="M79 20 L79 24 L82 24"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
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
			<ellipse cx="60" cy="82" rx="40" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Chart card */}
			<rect
				x="18"
				y="16"
				width="84"
				height="56"
				rx="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Grid lines */}
			<line x1="26" y1="54" x2="94" y2="54" stroke="var(--ink)" strokeWidth="1" opacity=".15" />
			<line x1="26" y1="44" x2="94" y2="44" stroke="var(--ink)" strokeWidth="1" opacity=".15" />
			<line x1="26" y1="34" x2="94" y2="34" stroke="var(--ink)" strokeWidth="1" opacity=".15" />
			{/* Area fill */}
			<polyline
				points="26,58 38,50 52,40 66,44 80,28 94,20 94,62 26,62"
				fill="var(--amber)"
				opacity=".2"
				stroke="none"
			/>
			{/* Trend line */}
			<polyline
				points="26,58 38,50 52,40 66,44 80,28 94,20"
				fill="none"
				stroke="var(--amber)"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* End dot */}
			<circle cx="94" cy="20" r="4" fill="var(--amber)" stroke="var(--cream)" strokeWidth="1.5" />
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
			<ellipse cx="60" cy="82" rx="40" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Axes */}
			<line
				x1="20"
				y1="14"
				x2="20"
				y2="72"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<line
				x1="20"
				y1="72"
				x2="100"
				y2="72"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Bars */}
			<rect
				x="30"
				y="54"
				width="14"
				height="18"
				fill="var(--amber)"
				opacity=".5"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="50"
				y="40"
				width="14"
				height="32"
				fill="var(--amber)"
				opacity=".7"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<rect
				x="70"
				y="48"
				width="14"
				height="24"
				fill="var(--amber)"
				opacity=".6"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Tallest / accent bar — amber full opacity */}
			<rect
				x="90"
				y="22"
				width="8"
				height="50"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
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
			<ellipse cx="60" cy="82" rx="34" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Calendar body */}
			<rect
				x="24"
				y="20"
				width="72"
				height="56"
				rx="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Header bar */}
			<rect x="24" y="20" width="72" height="16" rx="4" fill="var(--ink)" />
			<rect x="24" y="28" width="72" height="8" rx="0" fill="var(--ink)" />
			{/* Calendar pin hooks */}
			<line
				x1="40"
				y1="14"
				x2="40"
				y2="26"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="80"
				y1="14"
				x2="80"
				y2="26"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			{/* Day grid dots */}
			{[36, 50, 64, 78, 92].map((x) => (
				<circle key={x} cx={x} cy="48" r="2" fill="var(--ink)" opacity=".25" />
			))}
			{[36, 50, 64, 78, 92].map((x) => (
				<circle key={x} cx={x} cy="60" r="2" fill="var(--ink)" opacity=".25" />
			))}
			{/* Amber event block */}
			<rect x="48" y="42" width="28" height="14" rx="3" fill="var(--amber)" />
			<rect x="48" y="42" width="5" height="14" rx="3" fill="var(--amber-d)" />
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
			<ellipse cx="60" cy="82" rx="42" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Back person (right) */}
			<circle
				cx="76"
				cy="40"
				r="10"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M58 76 Q58 60 76 60 Q94 60 94 76 Z"
				fill="var(--ds-illust-bg-2)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Front person (left — amber accent) */}
			<circle
				cx="44"
				cy="38"
				r="12"
				fill="var(--amber)"
				opacity=".85"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<path
				d="M20 76 Q20 58 44 58 Q68 58 68 76 Z"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Connection dot */}
			<circle cx="60" cy="52" r="3" fill="var(--amber)" />
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
			<ellipse cx="58" cy="82" rx="28" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Head */}
			<circle
				cx="58"
				cy="44"
				r="22"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="58" cy="44" r="22" fill="var(--amber)" opacity=".2" />
			{/* Face — neutral thinking expression */}
			<circle cx="51" cy="41" r="2" fill="var(--ink)" />
			<circle cx="65" cy="41" r="2" fill="var(--ink)" />
			<path
				d="M53 50 Q58 48 63 50"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Hand under chin */}
			<path
				d="M58 66 L58 72 Q54 74 46 70"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			{/* Thought bubbles */}
			<circle
				cx="86"
				cy="30"
				r="5"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle
				cx="96"
				cy="20"
				r="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle
				cx="104"
				cy="12"
				r="2.5"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1"
			/>
			<circle cx="96" cy="36" r="3" fill="var(--amber)" opacity=".5" />
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
			<ellipse cx="60" cy="82" rx="28" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Shackle */}
			<path
				d="M46 42 L46 28 Q46 14 60 14 Q74 14 74 28 L74 42"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			{/* Lock body */}
			<rect
				x="36"
				y="40"
				width="48"
				height="36"
				rx="5"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Keyhole */}
			<circle cx="60" cy="54" r="5" fill="var(--ink)" />
			<rect x="57" y="54" width="6" height="8" rx="1" fill="var(--ink)" />
			{/* Shine highlight */}
			<path
				d="M40 46 Q48 44 52 50"
				fill="none"
				stroke="var(--cream)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".4"
			/>
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
			<ellipse cx="60" cy="82" rx="34" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Main puzzle shape */}
			<path
				d="M28 28 L52 28 Q52 20 60 20 Q68 20 68 28 L92 28 L92 50 Q100 50 100 58 Q100 66 92 66 L92 76 L28 76 L28 54 Q20 54 20 46 Q20 38 28 38 Z"
				fill="var(--amber)"
				opacity=".9"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			{/* Inner detail lines */}
			<line x1="28" y1="52" x2="92" y2="52" stroke="var(--ink)" strokeWidth="1" opacity=".25" />
			<line x1="60" y1="28" x2="60" y2="76" stroke="var(--ink)" strokeWidth="1" opacity=".25" />
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
			<ellipse cx="60" cy="82" rx="42" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Node 1 */}
			<rect
				x="10"
				y="32"
				width="26"
				height="22"
				rx="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line
				x1="17"
				y1="40"
				x2="29"
				y2="40"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".4"
				strokeLinecap="round"
			/>
			<line
				x1="17"
				y1="46"
				x2="25"
				y2="46"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".4"
				strokeLinecap="round"
			/>
			{/* Connector 1→2 */}
			<line
				x1="36"
				y1="43"
				x2="47"
				y2="43"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".6"
			/>
			<polygon points="44,39 50,43 44,47" fill="var(--ink)" opacity=".6" />
			{/* Node 2 — amber accent */}
			<rect
				x="47"
				y="32"
				width="26"
				height="22"
				rx="4"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<circle cx="60" cy="43" r="5" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.5" />
			{/* Connector 2→3 */}
			<line
				x1="73"
				y1="43"
				x2="84"
				y2="43"
				stroke="var(--ink)"
				strokeWidth="1.5"
				strokeLinecap="round"
				opacity=".6"
			/>
			<polygon points="81,39 87,43 81,47" fill="var(--ink)" opacity=".6" />
			{/* Node 3 */}
			<rect
				x="84"
				y="32"
				width="26"
				height="22"
				rx="4"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			<line
				x1="91"
				y1="40"
				x2="103"
				y2="40"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".4"
				strokeLinecap="round"
			/>
			<line
				x1="91"
				y1="46"
				x2="99"
				y2="46"
				stroke="var(--ink)"
				strokeWidth="1.5"
				opacity=".4"
				strokeLinecap="round"
			/>
		</svg>
	);
}

// Travel redesigned as a rolling suitcase — clearer concept than the previous abstract shape
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
			<ellipse cx="60" cy="82" rx="32" ry="4" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Handle */}
			<path
				d="M48 30 L48 22 Q48 14 60 14 Q72 14 72 22 L72 30"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			{/* Body */}
			<rect
				x="30"
				y="30"
				width="60"
				height="44"
				rx="5"
				fill="var(--ds-illust-bg)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Amber center band */}
			<rect x="30" y="42" width="60" height="14" fill="var(--amber)" opacity=".3" />
			{/* Center seam */}
			<line x1="60" y1="30" x2="60" y2="74" stroke="var(--ink)" strokeWidth="1" opacity=".2" />
			{/* Clasp */}
			<rect
				x="52"
				y="46"
				width="16"
				height="8"
				rx="2"
				fill="var(--amber)"
				stroke="var(--ink)"
				strokeWidth="1.5"
			/>
			{/* Stitching lines */}
			<line
				x1="34"
				y1="38"
				x2="86"
				y2="38"
				stroke="var(--ink)"
				strokeWidth="1"
				opacity=".2"
				strokeLinecap="round"
			/>
			<line
				x1="34"
				y1="58"
				x2="86"
				y2="58"
				stroke="var(--ink)"
				strokeWidth="1"
				opacity=".2"
				strokeLinecap="round"
			/>
			{/* Wheels */}
			<circle cx="40" cy="76" r="4" fill="var(--ink)" />
			<circle cx="80" cy="76" r="4" fill="var(--ink)" />
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
			<ellipse cx="60" cy="82" rx="30" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Glow ring */}
			<circle cx="60" cy="42" r="30" fill="var(--amber)" opacity=".12" />
			{/* Main circle */}
			<circle cx="60" cy="42" r="24" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1.5" />
			{/* Checkmark */}
			<path
				d="M46 42 L56 52 L74 34"
				fill="none"
				stroke="var(--cream)"
				strokeWidth="3.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Accent dots */}
			<circle cx="18" cy="20" r="2.5" fill="var(--amber)" opacity=".5" />
			<circle cx="102" cy="26" r="2" fill="var(--amber)" opacity=".5" />
			<circle cx="14" cy="52" r="1.5" fill="var(--amber)" opacity=".4" />
			<circle cx="106" cy="58" r="1.5" fill="var(--amber)" opacity=".4" />
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
			<ellipse cx="60" cy="82" rx="22" ry="3.5" fill="var(--ds-illust-shadow, rgba(0,0,0,.06))" />
			{/* Phone body */}
			<rect x="40" y="10" width="40" height="68" rx="6" fill="var(--ink)" />
			{/* Screen area */}
			<rect x="43" y="16" width="34" height="52" rx="3" fill="var(--cream)" opacity=".1" />
			{/* Amber header */}
			<rect x="43" y="16" width="34" height="10" rx="3" fill="var(--amber)" opacity=".7" />
			{/* Content lines */}
			<rect x="47" y="32" width="22" height="3" rx="1.5" fill="var(--cream)" opacity=".6" />
			<rect x="47" y="39" width="16" height="3" rx="1.5" fill="var(--cream)" opacity=".4" />
			<rect x="47" y="48" width="22" height="10" rx="2" fill="var(--cream)" opacity=".25" />
			{/* Home button */}
			<circle cx="60" cy="74" r="2.5" fill="var(--cream)" opacity=".3" />
			{/* Notch */}
			<rect x="54" y="11" width="12" height="4" rx="2" fill="var(--ink)" opacity=".5" />
		</svg>
	);
}
