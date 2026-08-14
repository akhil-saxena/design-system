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
	// Spreading the collected refs *as* the dependency list is deliberate and is
	// the same approach Radix takes. React compares dependency lists
	// element-wise, not by array identity, so a fresh array holding the same refs
	// still memoises correctly — and the returned callback must change identity
	// whenever any individual ref does, or that ref would never be populated.
	//
	// The one constraint this carries: a caller must pass the same *number* of
	// refs on every render, otherwise React throws on the changed list size.
	// Every call site in this library passes a fixed arity.
	// biome-ignore lint/correctness/useExhaustiveDependencies: `refs` is spread as the dependency list itself; see above.
	return useCallback((node: T | null) => {
		for (const ref of refs) setRef(ref, node);
	}, refs);
}
