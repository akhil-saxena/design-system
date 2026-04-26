import { type Ref, useCallback } from "react";

function setRef<T>(ref: Ref<T> | undefined, node: T | null): void {
	if (typeof ref === "function") ref(node);
	else if (ref && "current" in ref) (ref as { current: T | null }).current = node;
}

/**
 * Combine multiple refs (function or object) into one callback ref.
 * Used by every primitive that does forwardRef + needs an internal ref
 * for a hook (Popover trigger, Modal container, etc.).
 */
export function useComposedRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
	return useCallback((node: T | null) => {
		for (const ref of refs) setRef(ref, node);
	}, refs);
}
