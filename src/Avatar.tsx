import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

export type AvatarSize = 24 | 28 | 32 | 36 | 40;
export type AvatarPresence = "online" | "away" | "offline" | "dnd";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
	name?: string;
	initials?: string;
	gradient?: [string, string];
	size?: AvatarSize;
	presence?: AvatarPresence;
}

// 6 hand-picked 2-stop gradients (D-121).
const AVATAR_PALETTE = [
	["#f59e0b", "#dc2626"], // amber → red
	["#3b82f6", "#1d4ed8"], // blue → indigo
	["#22c55e", "#15803d"], // green → forest
	["#8b5cf6", "#6d28d9"], // purple → violet
	["#ef4444", "#f59e0b"], // red → amber
	["#0ea5e9", "#22c55e"], // sky → green
] as const satisfies ReadonlyArray<readonly [string, string]>;

// djb2 hash on lowercased string (D-121).
function djb2(s: string): number {
	let h = 5381;
	for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
	return h >>> 0;
}

// First letter of first 2 words, uppercased. Empty/null → "?".
export function deriveInitials(name?: string | null): string {
	if (!name) return "?";
	const trimmed = name.trim();
	if (trimmed.length === 0) return "?";
	const parts = trimmed.split(/\s+/).slice(0, 2);
	return (
		parts
			.map((p) => p[0]?.toUpperCase() ?? "")
			.join("")
			.slice(0, 2) || "?"
	);
}

export function deriveGradient(seed: string): readonly [string, string] {
	const idx = djb2(seed.toLowerCase()) % AVATAR_PALETTE.length;
	// Modulo by AVATAR_PALETTE.length always yields a valid index; fall back
	// to first entry only to satisfy TS noUncheckedIndexedAccess style rules.
	return AVATAR_PALETTE[idx] ?? AVATAR_PALETTE[0];
}

const presenceColors: Record<AvatarPresence, string> = {
	online: "var(--green-vivid)",
	away: "var(--amber-vivid)",
	offline: "var(--ink-5)",
	dnd: "var(--red-vivid)",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
	{ name, initials, gradient, size = 32, presence, children, style, ...rest },
	ref,
) {
	const computedInitials = initials ?? deriveInitials(name);
	const computedGradient = gradient ?? deriveGradient(initials || name || "?");
	const containerStyle: CSSProperties = {
		position: "relative",
		width: size,
		height: size,
		borderRadius: "50%",
		background: `linear-gradient(145deg, ${computedGradient[0]}, ${computedGradient[1]})`,
		color: "#ffffff",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		fontFamily: "var(--font)",
		fontSize: Math.round(size * 0.35),
		fontWeight: 700,
		flexShrink: 0,
		...style,
	};
	const presenceSize = 12;
	return (
		<div ref={ref} style={containerStyle} aria-label={name} {...rest}>
			{children ?? computedInitials}
			{presence ? (
				<span
					aria-hidden="true"
					style={{
						position: "absolute",
						right: 0,
						bottom: 0,
						width: presenceSize,
						height: presenceSize,
						borderRadius: "50%",
						background: presenceColors[presence],
						border: "2px solid var(--cream)",
					}}
				/>
			) : null}
		</div>
	);
});

export interface AvatarStackProps extends HTMLAttributes<HTMLDivElement> {
	avatars: ReadonlyArray<{ name?: string; initials?: string; gradient?: [string, string] }>;
	max?: number;
	size?: AvatarSize;
}

export function AvatarStack({ avatars, max = 4, size = 32, style, ...rest }: AvatarStackProps) {
	const visible = avatars.slice(0, max);
	const overflow = avatars.length - visible.length;
	return (
		<div style={{ display: "inline-flex", alignItems: "center", ...style }} {...rest}>
			{visible.map((a, i) => (
				<div
					key={`${a.initials ?? a.name ?? i}-${i}`}
					style={{
						marginLeft: i > 0 ? -8 : 0,
						zIndex: visible.length - i,
						border: "2px solid var(--cream)",
						borderRadius: "50%",
						display: "inline-block",
					}}
				>
					<Avatar name={a.name} initials={a.initials} gradient={a.gradient} size={size} />
				</div>
			))}
			{overflow > 0 ? (
				<div
					style={{
						marginLeft: -8,
						zIndex: 0,
						width: size,
						height: size,
						borderRadius: "50%",
						background: "var(--cream-2)",
						color: "var(--ink-3)",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "var(--font)",
						fontSize: Math.round(size * 0.32),
						fontWeight: 700,
						border: "2px solid var(--cream)",
					}}
					aria-label={`${overflow} more`}
				>
					+{overflow}
				</div>
			) : null}
		</div>
	);
}
