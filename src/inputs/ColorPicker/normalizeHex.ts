/**
 * Parse whatever a user actually types into a canonical 6-digit hex.
 *
 * The field previously accepted only `/^#[0-9a-fA-F]{6}$/`. Anything else was
 * silently ignored: no swatch update, no `onChange`, no error. So the two most
 * natural ways to enter a colour both did nothing —
 *
 *   ff0000   (pasted from a design tool, which usually omits the hash)
 *   #f00     (CSS shorthand)
 *
 * — and the user had no feedback explaining why. Normalising instead of
 * rejecting is the fix: the component decides what canonical means and the field
 * accepts the input.
 *
 * Returns null when the text genuinely is not a colour yet, which is the normal
 * state mid-typing (`#f`, `#ff`) and should not be treated as an error.
 */
export function normalizeHex(input: string): string | null {
	const raw = input.trim().replace(/^#/, "").toLowerCase();

	// 3-digit shorthand expands by doubling each nibble: f00 → ff0000.
	if (/^[0-9a-f]{3}$/.test(raw)) {
		return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
	}
	if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;

	// 4- and 8-digit forms carry alpha. ColorInput's swatch is opaque, so the
	// alpha is dropped rather than silently mis-rendered as part of the colour.
	if (/^[0-9a-f]{4}$/.test(raw)) {
		return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
	}
	if (/^[0-9a-f]{8}$/.test(raw)) return `#${raw.slice(0, 6)}`;

	return null;
}

/**
 * True when the text could still become a valid hex with more typing, so a
 * half-finished value is not flagged as an error while the user is mid-keystroke.
 */
export function isPartialHex(input: string): boolean {
	const raw = input.trim().replace(/^#/, "");
	return raw.length < 6 && /^[0-9a-fA-F]*$/.test(raw);
}
