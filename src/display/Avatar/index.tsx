import { type CSSProperties, type HTMLAttributes, forwardRef } from "react";

/**
 * Diameter of the avatar circle, in pixels. All internal proportions
 * (font-size `size*0.35`, square radius `size*0.22`, presence dot `size*0.28`)
 * are derived from this value, so any positive number renders correctly.
 * The named values (24 / 28 / 32 / 36 / 40) remain the canonical design-system
 * sizes; arbitrary sizes (e.g. 22 or 46) are also supported. Sensible range:
 * ~16–96px.
 */
export type AvatarSize = number;
export type AvatarShape = "circle" | "square";
export type AvatarPresence = "online" | "away" | "offline" | "dnd";
export type AvatarPresencePosition = "top-right" | "bottom-right" | "top-left" | "bottom-left";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
	/** Full name used to derive initials and background color. Also becomes `aria-label`. */
	name?: string;
	/** Override the auto-derived initials (1–2 uppercase letters). */
	initials?: string;
	/**
	 * Derive the background color from this string instead of `name` — e.g. a
	 * stable id — so the color stays fixed even if the display name changes.
	 * Initials are still derived from `name`/`initials`.
	 */
	seed?: string;
	/**
	 * Override the built-in solid-color palette used for the name→color hash.
	 * Pass a custom set (e.g. WCAG-tuned colors) to control which colors the
	 * deterministic hash can land on. Ignored when `gradient` is set.
	 */
	palette?: string[];
	/**
	 * URL of an image to display. When provided, the image fills the circle and
	 * initials/background are not rendered.
	 */
	src?: string;
	/** Alt text for the image. Falls back to `name` when omitted. */
	alt?: string;
	/**
	 * Use a two-stop gradient background instead of the default solid color.
	 * Pass `[fromColor, toColor]` to override, or omit to use the auto-derived gradient.
	 * When not set, a solid color derived from the name is used.
	 */
	gradient?: [string, string] | true;
	/** Diameter of the avatar circle in pixels. Any positive number works
	 * (all sub-element sizing is proportional); the named design-system sizes
	 * are 24 / 28 / 32 / 36 / 40, sensible range ~16–96.
	 * @default 32
	 */
	size?: AvatarSize;
	/**
	 * Outline shape of the avatar. `"circle"` renders a full circle;
	 * `"square"` renders a rounded-square (app-icon style) with a
	 * `border-radius` proportional to `size`. Everything else (initials,
	 * color, image, presence dot) is identical.
	 * @default "circle"
	 */
	shape?: AvatarShape;
	/** Shows a colored presence dot at the bottom-right edge. */
	presence?: AvatarPresence;
	/**
	 * Which corner of the avatar the presence dot appears at.
	 * @default "bottom-right"
	 */
	presencePosition?: AvatarPresencePosition;
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

// 6 solid colors - default background when gradient is not requested.
const SOLID_PALETTE = [
	"#d97706", // amber
	"#2563eb", // blue
	"#16a34a", // green
	"#7c3aed", // purple
	"#dc2626", // red
	"#0284c7", // sky
] as const;

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
	return AVATAR_PALETTE[idx] ?? AVATAR_PALETTE[0];
}

export function deriveSolidColor(seed: string, palette: readonly string[] = SOLID_PALETTE): string {
	const pool = palette.length > 0 ? palette : SOLID_PALETTE;
	const idx = djb2(seed.toLowerCase()) % pool.length;
	return pool[idx] ?? pool[0] ?? SOLID_PALETTE[0];
}

const presenceColors: Record<AvatarPresence, string> = {
	online: "var(--green-vivid)",
	away: "var(--amber-vivid)",
	offline: "var(--ink-5)",
	dnd: "var(--red-vivid)",
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
	{
		name,
		initials,
		seed,
		palette,
		src,
		alt,
		gradient,
		size = 32,
		shape = "circle",
		presence,
		presencePosition = "bottom-right",
		children,
		style,
		...rest
	},
	ref,
) {
	// Color seed: explicit `seed` wins, else fall back to initials/name (D-121).
	const colorSeed = seed || initials || name || "?";
	const computedInitials = initials ?? deriveInitials(name);

	// Background: solid by default; gradient when gradient prop is set.
	let background: string;
	if (gradient) {
		const stops = Array.isArray(gradient) ? gradient : deriveGradient(colorSeed);
		background = `linear-gradient(145deg, ${stops[0]}, ${stops[1]})`;
	} else {
		background = deriveSolidColor(colorSeed, palette);
	}

	// Circle → full pill (50%); square → rounded-square radius proportional to size.
	const cornerRadius = shape === "square" ? Math.round(size * 0.22) : "50%";

	const containerStyle: CSSProperties = {
		position: "relative",
		width: size,
		height: size,
		borderRadius: cornerRadius,
		background: src ? "transparent" : background,
		color: "#ffffff",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		fontFamily: "var(--font)",
		fontSize: Math.round(size * 0.35),
		fontWeight: 700,
		flexShrink: 0,
		overflow: src ? "hidden" : "visible",
		...style,
	};

	// Presence dot: positioned so its centre sits on the circle's edge at 45°.
	// offset = radius - radius * cos(45°) ≈ radius * 0.29; negative value pushes
	// the dot outside the container so it straddles the avatar border.
	const presenceSize = Math.max(8, Math.round(size * 0.28));
	const presenceOffset = -Math.round(presenceSize * 0.3);

	return (
		<div ref={ref} style={containerStyle} aria-label={name} {...rest}>
			{src ? (
				<img
					src={src}
					alt={alt ?? name ?? "Avatar"}
					style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
				/>
			) : (
				(children ?? computedInitials)
			)}
			{presence ? (
				<span
					aria-hidden="true"
					style={{
						position: "absolute",
						top: presencePosition.startsWith("top") ? presenceOffset : undefined,
						bottom: presencePosition.startsWith("bottom") ? presenceOffset : undefined,
						left: presencePosition.endsWith("left") ? presenceOffset : undefined,
						right: presencePosition.endsWith("right") ? presenceOffset : undefined,
						width: presenceSize,
						height: presenceSize,
						borderRadius: "50%",
						background: presenceColors[presence],
						border: "2px solid var(--cream)",
						flexShrink: 0,
					}}
				/>
			) : null}
		</div>
	);
});

export interface AvatarStackProps extends HTMLAttributes<HTMLDivElement> {
	/** Array of avatar descriptors rendered as an overlapping stack. */
	avatars: ReadonlyArray<{ name?: string; initials?: string; gradient?: [string, string] }>;
	/** Maximum number of avatars shown before a "+N more" overflow badge.
	 * @default 4
	 */
	max?: number;
	/** Size in pixels applied to every avatar in the stack.
	 * @default 32
	 */
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
