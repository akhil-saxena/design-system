import {
	type CSSProperties,
	type ChangeEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { hexToHsv, hsvToHex } from "./colorUtils";

const PRESETS_DEFAULT = [
	"#f59e0b",
	"#ef4444",
	"#3b82f6",
	"#8b5cf6",
	"#22c55e",
	"#ec4899",
	"#06b6d4",
	"#f97316",
	"#14b8a6",
	"#6366f1",
];

const TONAL_STRIPS: { label: string; colors: string[] }[] = [
	{
		label: "Amber",
		colors: [
			"#fef3c7",
			"#fde68a",
			"#fcd34d",
			"#fbbf24",
			"#f59e0b",
			"#d97706",
			"#b45309",
			"#92400e",
		],
	},
	{
		label: "Blue",
		colors: [
			"#dbeafe",
			"#bfdbfe",
			"#93c5fd",
			"#60a5fa",
			"#3b82f6",
			"#2563eb",
			"#1d4ed8",
			"#1e40af",
		],
	},
	{
		label: "Neutral",
		colors: [
			"#f5f3f0",
			"#ece8e3",
			"#e7e2dc",
			"#d6d3d1",
			"#a8a29e",
			"#6b6560",
			"#44403c",
			"#292524",
		],
	},
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Clamp a number into the inclusive [min, max] range. */
function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

/**
 * Compose a 6-digit hex with an opacity (0–100) into the emitted color string.
 * Opaque (100%) stays 6-digit hex to preserve the existing onChange contract for the
 * common case; anything less appends a 2-digit alpha channel (8-digit hex) so the
 * announced opacity is truthful and not silently dropped.
 */
function withAlpha(hex: string, opacity: number): string {
	if (opacity >= 100) return hex;
	const alpha = clamp(Math.round((opacity / 100) * 255), 0, 255)
		.toString(16)
		.padStart(2, "0");
	return `${hex}${alpha}`;
}

export interface ColorPickerProps {
	/** Controlled hex value, e.g. '#f59e0b'. Optional — uncontrolled if absent. */
	value?: string;
	/** Called with new hex string when color changes via any sub-control. */
	onChange?: (hex: string) => void;
	/** Initial hex when uncontrolled. @default '#f59e0b' */
	defaultValue?: string;
	/** Custom preset swatches. @default the 10-color amber-led palette */
	presets?: string[];
	/** Additional className applied to the root wrapper. */
	className?: string;
	/** Inline styles applied to the root wrapper. */
	style?: CSSProperties;
}

export function ColorPicker({
	value,
	onChange,
	defaultValue = "#f59e0b",
	presets = PRESETS_DEFAULT,
	className,
	style,
}: ColorPickerProps) {
	const initial = value ?? defaultValue;
	const [color, setColor] = useState<string>(initial);
	const [hex, setHex] = useState<string>(initial);
	const [hue, setHue] = useState<number>(() => hexToHsv(initial)[0]);
	const [opacity, setOpacity] = useState<number>(100);

	// Active pointer-drag teardown. Stored in a ref so an unmount mid-drag can
	// always remove the document-level listeners (avoids the leak from removing
	// them only in the pointerup handler).
	const dragCleanupRef = useRef<(() => void) | null>(null);
	useEffect(() => {
		return () => {
			dragCleanupRef.current?.();
		};
	}, []);

	// Sync controlled value — do NOT reset hue, preserve user's drag position.
	useEffect(() => {
		if (value !== undefined && value !== color) {
			setColor(value);
			setHex(value);
		}
	}, [value]);

	/**
	 * Commit a new base (6-digit) hex: update internal display state and notify the
	 * consumer. Alpha is composed at this boundary so opacity is never silently
	 * dropped, while opaque colors keep the original 6-digit contract.
	 */
	function emit(next: string, nextOpacity: number = opacity) {
		setColor(next);
		setHex(next);
		onChange?.(withAlpha(next, nextOpacity));
	}

	/** Set opacity and re-emit the current color so the alpha change reaches onChange. */
	function emitOpacity(nextOpacity: number) {
		const clamped = clamp(Math.round(nextOpacity), 0, 100);
		setOpacity(clamped);
		onChange?.(withAlpha(color, clamped));
	}

	function startDrag(
		target: "canvas" | "hue" | "opacity",
		el: HTMLDivElement,
		initialEvent: ReactPointerEvent<HTMLDivElement>,
	) {
		try {
			el.setPointerCapture(initialEvent.pointerId);
		} catch {
			// jsdom and some older browsers may throw; safe to ignore.
		}
		const rect = el.getBoundingClientRect();

		function update(e: PointerEvent | ReactPointerEvent<HTMLDivElement>) {
			const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
			if (target === "canvas") {
				const newHex = hsvToHex(hue, x, 1 - y);
				emit(newHex);
			} else if (target === "hue") {
				const newHue = x * 360;
				setHue(newHue);
				const [, s, v] = hexToHsv(color);
				emit(hsvToHex(newHue, s || 1, v || 1));
			} else {
				emitOpacity(x * 100);
			}
		}

		update(initialEvent);

		function onMove(e: PointerEvent) {
			update(e);
		}
		function teardown() {
			document.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerup", onUp);
			dragCleanupRef.current = null;
		}
		function onUp() {
			teardown();
		}
		document.addEventListener("pointermove", onMove);
		document.addEventListener("pointerup", onUp);
		dragCleanupRef.current = teardown;
	}

	function handleHexChange(e: ChangeEvent<HTMLInputElement>) {
		const next = e.target.value;
		setHex(next);
		if (HEX_RE.test(next)) {
			setColor(next);
			setHue(hexToHsv(next)[0]);
			onChange?.(withAlpha(next, opacity));
		}
	}

	/**
	 * Keyboard interaction for the slider surfaces (WCAG 2.1.1). Mirrors pointer drag:
	 * Arrow = ±step, Shift+Arrow / PageUp / PageDown = ±bigStep, Home / End = min / max.
	 * Up/Right increase, Down/Left decrease.
	 */
	function handleSliderKey(
		target: "canvas" | "hue" | "opacity",
		e: ReactKeyboardEvent<HTMLDivElement>,
	) {
		const big = e.shiftKey || e.key === "PageUp" || e.key === "PageDown";
		let dir = 0;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowUp":
			case "PageUp":
				dir = 1;
				break;
			case "ArrowLeft":
			case "ArrowDown":
			case "PageDown":
				dir = -1;
				break;
			case "Home":
				dir = -2; // sentinel: jump to min
				break;
			case "End":
				dir = 2; // sentinel: jump to max
				break;
			default:
				return; // ignore keys we don't handle (e.g. Tab)
		}
		e.preventDefault();

		if (target === "hue") {
			let next: number;
			if (dir === -2) next = 0;
			else if (dir === 2) next = 360;
			else next = clamp(hue + dir * (big ? 10 : 1), 0, 360);
			setHue(next);
			const [, s, v] = hexToHsv(color);
			emit(hsvToHex(next, s || 1, v || 1));
			return;
		}

		if (target === "opacity") {
			let next: number;
			if (dir === -2) next = 0;
			else if (dir === 2) next = 100;
			else next = clamp(opacity + dir * (big ? 10 : 1), 0, 100);
			emitOpacity(next);
			return;
		}

		// canvas: Up/Down adjust brightness (value), Left/Right adjust saturation.
		const [, s, v] = hexToHsv(color);
		const step = (big ? 10 : 1) / 100;
		let nextS = s;
		let nextV = v;
		switch (e.key) {
			case "ArrowRight":
				nextS = clamp(s + step, 0, 1);
				break;
			case "ArrowLeft":
				nextS = clamp(s - step, 0, 1);
				break;
			case "ArrowUp":
			case "PageUp":
				nextV = clamp(v + step, 0, 1);
				break;
			case "ArrowDown":
			case "PageDown":
				nextV = clamp(v - step, 0, 1);
				break;
			case "Home":
				nextS = 0;
				nextV = 0;
				break;
			case "End":
				nextS = 1;
				nextV = 1;
				break;
		}
		emit(hsvToHex(hue, nextS, nextV));
	}

	const [, sat, val] = hexToHsv(color);

	const labelStyle: CSSProperties = {
		fontFamily: "var(--mono)",
		fontSize: 9,
		color: "var(--ink-4)",
		marginBottom: 4,
		fontWeight: 700,
	};

	return (
		<div
			className={["ds-atom-colorpicker", className].filter(Boolean).join(" ")}
			style={{ width: 260, padding: 16, borderRadius: 14, ...style }}
		>
			{/* Gradient canvas */}
			<div
				role="slider"
				aria-label="Saturation and brightness"
				aria-valuenow={Math.round(sat * 100)}
				aria-valuemin={0}
				aria-valuemax={100}
				tabIndex={0}
				className="ds-atom-colorpicker-canvas"
				onPointerDown={(e) => startDrag("canvas", e.currentTarget, e)}
				onKeyDown={(e) => handleSliderKey("canvas", e)}
				style={{
					width: "100%",
					height: 150,
					borderRadius: 10,
					marginBottom: 12,
					position: "relative",
					cursor: "crosshair",
					background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hue, 1, 1)})`,
				}}
			>
				<div
					className="ds-atom-colorpicker-thumb"
					style={{
						left: `${sat * 100}%`,
						top: `${(1 - val) * 100}%`,
						width: 16,
						height: 16,
						borderRadius: "50%",
						border: "2.5px solid #fff",
						boxShadow: "0 1px 4px rgba(0,0,0,.35)",
					}}
				/>
			</div>

			{/* Hue bar */}
			<div style={labelStyle}>HUE</div>
			<div
				role="slider"
				aria-label="Hue"
				aria-valuenow={Math.round(hue)}
				aria-valuemin={0}
				aria-valuemax={360}
				tabIndex={0}
				className="ds-atom-colorpicker-huebar"
				onPointerDown={(e) => startDrag("hue", e.currentTarget, e)}
				onKeyDown={(e) => handleSliderKey("hue", e)}
				style={{
					width: "100%",
					height: 12,
					borderRadius: 6,
					marginBottom: 12,
					background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
					position: "relative",
					cursor: "pointer",
				}}
			>
				<div
					className="ds-atom-colorpicker-thumb"
					style={{
						left: `${(hue / 360) * 100}%`,
						top: "50%",
						width: 14,
						height: 14,
						borderRadius: "50%",
						border: "2px solid #fff",
						boxShadow: "0 1px 3px rgba(0,0,0,.3)",
						background: hsvToHex(hue, 1, 1),
					}}
				/>
			</div>

			{/* Opacity bar */}
			<div style={labelStyle}>OPACITY</div>
			<div
				role="slider"
				aria-label="Opacity"
				aria-valuenow={opacity}
				aria-valuemin={0}
				aria-valuemax={100}
				tabIndex={0}
				className="ds-atom-colorpicker-opacitybar"
				onPointerDown={(e) => startDrag("opacity", e.currentTarget, e)}
				onKeyDown={(e) => handleSliderKey("opacity", e)}
				style={{
					width: "100%",
					height: 12,
					borderRadius: 6,
					marginBottom: 14,
					background: `linear-gradient(to right, transparent, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/8px 8px`,
					position: "relative",
					cursor: "pointer",
				}}
			>
				<div
					className="ds-atom-colorpicker-thumb"
					style={{
						left: `${opacity}%`,
						top: "50%",
						width: 14,
						height: 14,
						borderRadius: "50%",
						border: "2px solid #fff",
						boxShadow: "0 1px 3px rgba(0,0,0,.3)",
						background: color,
					}}
				/>
			</div>

			{/* Hex + alpha row */}
			<div
				style={{
					display: "flex",
					gap: 8,
					alignItems: "center",
					marginBottom: 14,
				}}
			>
				<div
					style={{
						width: 36,
						height: 36,
						borderRadius: 8,
						background: color,
						border: "1px solid var(--rule)",
						flexShrink: 0,
						boxShadow: "0 1px 4px rgba(0,0,0,.08)",
					}}
				/>
				<div style={{ flex: 1 }}>
					<label
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 700,
							display: "block",
							marginBottom: 2,
						}}
					>
						HEX
					</label>
					<input
						className="ds-input"
						value={hex}
						onChange={handleHexChange}
						aria-label="Hex color"
						style={{ fontFamily: "var(--mono)", fontSize: 12, width: "100%" }}
					/>
				</div>
				<div style={{ width: 56 }}>
					<label
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--ink-4)",
							fontWeight: 700,
							display: "block",
							marginBottom: 2,
						}}
					>
						ALPHA
					</label>
					<input
						className="ds-input"
						value={`${opacity}%`}
						readOnly
						aria-label="Alpha opacity"
						style={{
							fontFamily: "var(--mono)",
							fontSize: 12,
							textAlign: "center",
							width: "100%",
						}}
					/>
				</div>
			</div>

			{/* Preset swatches */}
			<div style={{ ...labelStyle, marginBottom: 6 }}>PRESETS</div>
			<div
				style={{
					display: "flex",
					gap: 5,
					flexWrap: "wrap",
					marginBottom: 14,
				}}
			>
				{presets.map((c) => (
					<button
						key={c}
						type="button"
						className="ds-atom-colorpicker-swatch"
						aria-label={`Color ${c}`}
						aria-pressed={color === c}
						onClick={() => {
							emit(c);
							setHue(hexToHsv(c)[0]);
						}}
						style={{
							width: 24,
							height: 24,
							borderRadius: 6,
							background: c,
							border: color === c ? "2.5px solid var(--ink)" : "1px solid var(--rule)",
						}}
					/>
				))}
			</div>

			{/* Tonal strips */}
			{TONAL_STRIPS.map((strip) => (
				<div key={strip.label} style={{ marginBottom: 8 }}>
					<div style={labelStyle}>{strip.label.toUpperCase()}</div>
					<div
						style={{
							display: "flex",
							gap: 2,
							borderRadius: 4,
							overflow: "hidden",
						}}
					>
						{strip.colors.map((c) => (
							<button
								key={c}
								type="button"
								className="ds-atom-colorpicker-cell"
								aria-label={`${strip.label} ${c}`}
								aria-pressed={color === c}
								onClick={() => {
									emit(c);
									setHue(hexToHsv(c)[0]);
								}}
								style={{ flex: 1, height: 18, background: c }}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
