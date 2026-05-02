import { useEffect } from "react";

interface ShortcutOptions {
	enabled?: boolean;
	preventDefault?: boolean;
	target?: HTMLElement | Window;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

interface ParsedCombo {
	key: string;
	mod: boolean;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
}

function parseCombo(combo: string): ParsedCombo {
	const parts = combo
		.toLowerCase()
		.split("+")
		.map((p) => p.trim());
	const out: ParsedCombo = {
		key: "",
		mod: false,
		ctrl: false,
		shift: false,
		alt: false,
	};
	for (const p of parts) {
		if (p === "mod") out.mod = true;
		else if (p === "ctrl") out.ctrl = true;
		else if (p === "shift") out.shift = true;
		else if (p === "alt" || p === "opt") out.alt = true;
		else out.key = p;
	}
	return out;
}

function matches(e: KeyboardEvent, combo: ParsedCombo): boolean {
	if (e.key.toLowerCase() !== combo.key.toLowerCase()) return false;
	const modPressed = isMac ? e.metaKey : e.ctrlKey;
	if (combo.mod && !modPressed) return false;
	if (combo.ctrl && !e.ctrlKey) return false;
	if (combo.shift !== e.shiftKey) return false;
	if (combo.alt !== e.altKey) return false;
	return true;
}

/**
 * Bind a keyboard shortcut. Use "mod+k" for Cmd-on-Mac, Ctrl-on-Win/Linux.
 * Used by CommandPalette (Phase 17 - ⌘K), Modal Esc-to-close (Phase 14).
 */
export function useKeyboardShortcut(
	combo: string | string[],
	handler: (e: KeyboardEvent) => void,
	options: ShortcutOptions = {},
): void {
	const { enabled = true, preventDefault = false, target } = options;
	useEffect(() => {
		if (!enabled) return;
		const combos = (Array.isArray(combo) ? combo : [combo]).map(parseCombo);
		const t: EventTarget = target ?? (typeof window !== "undefined" ? window : ({} as EventTarget));
		function listener(ev: Event) {
			const e = ev as KeyboardEvent;
			if (combos.some((c) => matches(e, c))) {
				if (preventDefault) e.preventDefault();
				handler(e);
			}
		}
		t.addEventListener("keydown", listener);
		return () => {
			t.removeEventListener("keydown", listener);
		};
	}, [combo, handler, enabled, preventDefault, target]);
}
