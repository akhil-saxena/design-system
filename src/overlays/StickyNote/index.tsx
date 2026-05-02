import { type CSSProperties, type HTMLAttributes, type ReactNode, forwardRef } from "react";

export type StickyNoteRotation = "left" | "right" | "none";

export interface StickyNoteProps extends HTMLAttributes<HTMLDivElement> {
	/** Static rotation applied to the note surface for a handwritten feel.
	 * @default "right"
	 */
	rotation?: StickyNoteRotation;
	/** Arbitrary JSX content rendered inside the note; compose freely. */
	children: ReactNode;
}

const baseStyle: CSSProperties = {
	display: "block",
	boxSizing: "border-box",
	fontFamily: "var(--font)",
};

/**
 * StickyNote — yellow-gradient note surface with slight static rotation.
 *
 *   <StickyNote>Reach out to David before screening.</StickyNote>
 *   <StickyNote rotation="left">Follow up by May 2.</StickyNote>
 *   <StickyNote rotation="none">Aligned baseline note.</StickyNote>
 *
 * Children are arbitrary JSX (mirrors Card freely-composed pattern). The
 * `.ds-sticky-hint` mini-line in the handoff is NOT part of the primitive
 * — consumers compose it as a child <div>.
 *
 * Always-dark text invariant (per handoff): the text color stays #292524
 * regardless of :root.dark cascade. The amber-yellow surface is identical
 * in light and dark modes — sticky notes are visually consistent across
 * themes, intentionally.
 */
export const StickyNote = forwardRef<HTMLDivElement, StickyNoteProps>(function StickyNote(
	{ rotation = "right", className, style, children, ...rest },
	ref,
) {
	return (
		<div
			ref={ref}
			className={`ds-atom-stickynote${className ? ` ${className}` : ""}`}
			data-rotation={rotation}
			style={{ ...baseStyle, ...style }}
			{...rest}
		>
			{children}
		</div>
	);
});
