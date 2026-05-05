// Pure HSV <-> Hex conversion utilities for ColorPicker.
// No React, no DOM, no side effects. Tested in colorUtils.test.ts.
// Source: standard color conversion math; verified by round-trip tests.

/** Convert a valid 6-digit hex string (e.g. '#f59e0b') to [h(0–360), s(0–1), v(0–1)]. */
export function hexToHsv(hex: string): [number, number, number] {
	const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
	const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
	const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	const v = max;
	const s = max === 0 ? 0 : d / max;
	let h = 0;
	if (d !== 0) {
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
		else if (max === g) h = ((b - r) / d + 2) / 6;
		else h = ((r - g) / d + 4) / 6;
	}
	return [h * 360, s, v];
}

/** Convert [h(0–360), s(0–1), v(0–1)] to a 6-digit '#rrggbb' hex string. */
export function hsvToHex(h: number, s: number, v: number): string {
	const i = Math.floor(h / 60) % 6;
	const f = h / 60 - Math.floor(h / 60);
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const table: [number, number, number][] = [
		[v, t, p],
		[q, v, p],
		[p, v, t],
		[p, q, v],
		[t, p, v],
		[v, p, q],
	];
	const triplet = table[i];
	if (!triplet) {
		// Defensive — should never trigger for valid h in [0,360].
		return "#000000";
	}
	const [r, g, b] = triplet;
	return `#${[r, g, b]
		.map((x) =>
			Math.round(x * 255)
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;
}
