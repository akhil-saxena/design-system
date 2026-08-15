/**
 * Detect whether a portaled overlay should render in dark mode.
 *
 * ## Why this is needed at all
 *
 * `DSPortal` moves overlay content to `document.body`, which escapes any
 * ancestor `.dark` wrapper it was rendered inside. So every portaled surface has
 * to re-establish the theme itself, by wrapping its content in `.dark` when the
 * origin was dark.
 *
 * ## Why it is shared
 *
 * Four overlays each solved this separately, and all four differed:
 *
 *   Sheet        typeof-guarded, checked <html> only
 *   BottomSheet  unguarded,      checked <html> only
 *   HoverCard    unguarded,      checked the anchor's ancestors *and* <html>
 *   Popover      unguarded,      checked the anchor's ancestors only
 *
 * The differences were not intentional. Checking `<html>` alone misses a *scoped*
 * dark container — the pattern Storybook's docs pages use, where each inline
 * story is wrapped in its own `.dark` div — so Sheet and BottomSheet rendered
 * light inside a dark docs preview. Checking only the anchor's ancestors happens
 * to cover the full-page case too, because `closest()` walks up to `<html>`.
 *
 * The union of both checks is correct in every case, and one implementation
 * means the SSR guard exists once instead of in one place out of four.
 */
export function isDarkContext(anchor?: Element | null): boolean {
	// Client components are still server-rendered for the initial HTML, so this
	// runs on the server even though the package ships "use client".
	if (typeof document === "undefined") return false;

	// `closest` walks up through <html>, so an anchor inside a scoped `.dark`
	// wrapper and a full-page `<html class="dark">` are both covered.
	if (anchor?.closest(".dark")) return true;

	return document.documentElement.classList.contains("dark");
}
