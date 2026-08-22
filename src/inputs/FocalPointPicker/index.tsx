import {
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	forwardRef,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

export interface FocalPoint {
	/** Horizontal position of the focal point, 0-100, measured from the left edge. */
	x: number;
	/** Vertical position of the focal point, 0-100, measured from the top edge. */
	y: number;
}

export interface FocalPointPickerProps {
	/**
	 * The focal point, as percentages. Controlled: the consumer owns the value,
	 * because the value is the thing being edited and a second copy inside the
	 * component is a second source of truth.
	 *
	 * Clamped and rounded on the way in as well as on the way out — see
	 * `clampPoint`. An out-of-range value from a stored JSON file is the entry
	 * path a component is most tempted to trust.
	 */
	value: FocalPoint;
	/** Fires on every pointer move during a drag, and once per keyboard step. */
	onChange: (value: FocalPoint) => void;
	/** Preview image. Rendered with `object-fit: cover`, so the value has meaning. */
	src: string;
	/** Alternative text for the preview image. Required: it is real page content. */
	alt: string;
	/**
	 * Frame aspect ratio as width / height. 3:2 — D-23's case — when omitted.
	 *
	 * THE DEFAULT IS NOT DECLARED HERE. It is
	 * `--ds-focalpoint-ratio: 3 / 2` on `.ds-atom-focalpoint-frame` in
	 * primitives.css, and omitting this prop writes no inline style at all, so a
	 * media query, a container query or a consumer stylesheet can re-declare it.
	 * A custom property written from a component's `style` object is fixed at
	 * construction and unreachable from any selector — finding E2, measured on
	 * AppShell's `--ds-sidebar-w`, and the reason `src/tokens.test.ts` names the
	 * class-level form as the shape a new knob must use.
	 *
	 * Passing this prop therefore trades that reachability away in exchange for a
	 * per-instance value, exactly as AppShell's `sidebarWidth` does. Pass it when
	 * the ratio is data; use the CSS knob when it is layout.
	 *
	 * Either way it is the CSS `aspect-ratio` property and not the legacy
	 * padding-top percentage hack, which was most of the 86 lines of frame CSS the
	 * local prototype had to port out of the legacy admin stylesheet and the single
	 * largest reason that prototype ran to 269 non-comment lines.
	 */
	aspectRatio?: number;
	/**
	 * Accessible name for the control. Required — the control is a focusable
	 * region with no text of its own, so without this it is announced as nothing.
	 */
	label: string;
	className?: string;
}

/** Measured from the prototype: a fine step is 1 percentage point per press. */
const FINE_STEP = 1;
/** Measured from the prototype: Shift is a coarse step of 10 percentage points. */
const COARSE_STEP = 10;
/** Home resets here. */
const CENTRE: FocalPoint = { x: 50, y: 50 };

/**
 * The one clamp, applied at all three entry paths — pointer, keyboard, and the
 * controlled `value` prop.
 *
 * Rounding is part of it rather than a separate concern: a pointer position is a
 * fraction of a rect measured in fractional CSS pixels, so without rounding the
 * committed value would be `24.7619047619%` and the consumer would store that in
 * JSON. Whole percentage points are what the legacy data format holds and what
 * the measured prototype produced.
 */
function clampPoint(p: FocalPoint): FocalPoint {
	const axis = (n: number) => {
		if (!Number.isFinite(n)) return 50;
		return Math.min(100, Math.max(0, Math.round(n)));
	};
	return { x: axis(p.x), y: axis(p.y) };
}

/**
 * The announcement text.
 *
 * Human-readable rather than a coordinate pair: `"25, 75"` is two bare numbers
 * with no unit and no axis, and a listener has no way to tell which is which.
 * The phrasing keeps the idiom the library's other two live regions settled on in
 * 01-07 and 01-15 — a noun subject, the quantity with its unit, and a full stop
 * so consecutive utterances do not run together.
 */
function describePoint(p: FocalPoint): string {
	return `Focal point ${p.x}% from the left, ${p.y}% from the top.`;
}

/** Arrow key to axis delta, in step units. Up/Left decrease, Down/Right increase. */
const ARROW_DELTAS: Record<string, { x: number; y: number }> = {
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 },
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
};

/**
 * FocalPointPicker — drag a marker on a real aspect-ratio frame to choose the
 * focal point a cropped image is anchored to (G-1 / E12).
 *
 * ## THE INTERACTION MODEL, AND THE ONE THAT WAS REJECTED
 *
 * This component **places the focal point** at the pointer's position inside the
 * frame, expressed as a percentage of the frame's own width and height.
 *
 * The **rejected model** is the legacy one: drag the *image*, accumulating an
 * inverted pixel delta with an arbitrary `/ 2` damping factor. It is rejected
 * because it is **frame-size dependent** — an accumulated pixel delta means a
 * fixed number of percentage points regardless of how wide the frame is, so
 * "drag from the left edge to the middle" commits a different value on a 320px
 * frame than on a 640px one, and the same stored crop cannot be reproduced from
 * the same gesture. Placing the point directly has no delta to accumulate, no
 * damping constant to justify, and no inversion to get the sign of.
 *
 * This paragraph is here rather than only in a plan summary on purpose. G-1
 * records that two reasonable engineers picked different models for one CSS
 * property, and calls that divergence *"itself the argument for the component
 * living upstream"* — so the next person to touch this file should find the
 * decision, not re-derive it. `FocalPointPicker.test.tsx` asserts both halves:
 * that two frame widths agree on a proportional release, and that they
 * *disagree* on an identical pixel offset, which is what would break if someone
 * reintroduced a delta.
 *
 * ## WHY role="application" AND NOT A PLAIN FOCUSABLE ELEMENT
 *
 * Measured in Chromium, `Accessibility.getPartialAXTree` over the four
 * candidates:
 *
 * | markup | AX role |
 * |---|---|
 * | `div tabindex=0 aria-label` | `generic` |
 * | `div role="application"`    | `application` |
 * | `div role="group"`          | `group` |
 * | `div role="slider"`         | `slider` |
 *
 * A `generic` node is not a widget, so a screen reader keeps its browse-mode
 * virtual cursor bound to the arrow keys and the arrow-key model this component
 * exists to provide never reaches it — the control would be operable by keyboard
 * with the screen reader off and inert with it on. `axe-core` 4.13 reports **no
 * violation** for that markup (measured), so the a11y sweep would not have caught
 * it either.
 *
 * `role="slider"` is the other candidate and is rejected for a different reason:
 * a slider has one `aria-valuenow`, and this control has two axes, so one of them
 * would have to be silently dropped or misreported.
 *
 * `application` is the role that both passes the arrow keys through and claims
 * nothing false about the value's shape. The value itself is spoken by the live
 * region below rather than by an ARIA value attribute.
 *
 * ## THE ANNOUNCEMENT IS THROTTLED, DELIBERATELY
 *
 * `pointermove` fires far faster than a screen reader can speak. A live region
 * rewritten every frame produces either a flood or — because each write replaces
 * the last before it is read — nothing at all. So the region is written **once
 * per drag, on `pointerup`**, and **once per keyboard step**. The visible preview
 * is what gives continuous feedback during a drag; the spoken readout gives the
 * result.
 *
 * The region is rendered from mount rather than inserted when its content first
 * changes: a live region that appears at the same moment as its text is
 * frequently never announced, because the assistive technology had nothing to
 * observe. Same trap 01-07 handled for `Lightbox`.
 *
 * ## LISTENERS
 *
 * Drag listeners live on `document`, so a pointer that leaves the frame keeps
 * driving the value, and every one of them is registered with an
 * `AbortController` signal. The controller is aborted on `pointerup`, on
 * `pointercancel`, and in the effect cleanup — so an unmount **mid-drag** cannot
 * leave a listener behind. That is legacy defect 3, which removed its `document`
 * listeners in the mouse-up handler only.
 */
export const FocalPointPicker = forwardRef<HTMLDivElement, FocalPointPickerProps>(
	function FocalPointPicker({ value, onChange, src, alt, aspectRatio, label, className }, ref) {
		const frameRef = useRef<HTMLDivElement | null>(null);
		const dragRef = useRef<AbortController | null>(null);
		const idBase = useId();
		const hintId = `${idBase}-hint`;
		const [announcement, setAnnouncement] = useState("");

		// Entry path 3. Derived rather than copied into state: a copy would let the
		// component display a value the consumer never agreed to.
		const point = clampPoint(value);

		const ratioStyle =
			aspectRatio === undefined
				? undefined
				: ({ "--ds-focalpoint-ratio": String(aspectRatio) } as CSSProperties);

		useEffect(
			() => () => {
				dragRef.current?.abort();
				dragRef.current = null;
			},
			[],
		);

		function commit(next: FocalPoint) {
			const clamped = clampPoint(next);
			if (clamped.x === point.x && clamped.y === point.y) return clamped;
			onChange(clamped);
			return clamped;
		}

		/** Pointer position as a percentage of the frame's own box. Entry path 1. */
		function pointFrom(e: { clientX: number; clientY: number }, rect: DOMRect): FocalPoint {
			return {
				x: rect.width === 0 ? point.x : ((e.clientX - rect.left) / rect.width) * 100,
				y: rect.height === 0 ? point.y : ((e.clientY - rect.top) / rect.height) * 100,
			};
		}

		function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
			// Secondary buttons open context menus and must not start a drag. A
			// touch or pen contact reports button 0, so this excludes neither.
			if (e.button > 0) return;
			const frame = frameRef.current;
			if (!frame) return;

			// A press is also a focus: the keyboard path has to be reachable straight
			// after a drag without a Tab round trip.
			frame.focus({ preventScroll: true });
			try {
				frame.setPointerCapture(e.pointerId);
			} catch {
				// jsdom has no pointer capture, and a stale pointerId throws in some
				// engines. Capture is an improvement, not a requirement — the document
				// listeners below carry the drag either way.
			}

			// A second pointerdown without an intervening up (a second finger) must
			// not leave the first drag's listeners live.
			dragRef.current?.abort();
			const controller = new AbortController();
			dragRef.current = controller;
			const { signal } = controller;

			let latest = commit(pointFrom(e, frame.getBoundingClientRect()));

			const onMove = (ev: PointerEvent) => {
				// Re-read the rect per move rather than caching it at pointerdown: the
				// page can scroll or reflow mid-drag, and a cached rect would then map
				// the pointer to the wrong place for the rest of the gesture.
				latest = commit(pointFrom(ev, frame.getBoundingClientRect()));
			};
			const finish = () => {
				controller.abort();
				if (dragRef.current === controller) dragRef.current = null;
				// One announcement per drag — see the throttling note above.
				setAnnouncement(describePoint(latest));
			};

			document.addEventListener("pointermove", onMove, { signal });
			document.addEventListener("pointerup", finish, { signal });
			document.addEventListener("pointercancel", finish, { signal });
		}

		/**
		 * Entry path 2.
		 *
		 * The handler is on the control itself, never on `document`, so
		 * `preventDefault` can only ever fire while focus is inside the control — a
		 * page-level arrow scroll is never stolen. Keys that are not handled fall
		 * through untouched, which is what keeps Tab working.
		 */
		function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
			if (e.metaKey || e.ctrlKey || e.altKey) return;

			if (e.key === "Home") {
				e.preventDefault();
				commit(CENTRE);
				setAnnouncement(describePoint(CENTRE));
				return;
			}

			const delta = ARROW_DELTAS[e.key];
			if (!delta) return;
			e.preventDefault();
			const step = e.shiftKey ? COARSE_STEP : FINE_STEP;
			const next = clampPoint({ x: point.x + delta.x * step, y: point.y + delta.y * step });
			commit(next);
			// Announced even when the value did not move, because at an edge the
			// silence is otherwise indistinguishable from a dead key.
			setAnnouncement(describePoint(next));
		}

		return (
			<div ref={ref} className={`ds-atom-focalpoint${className ? ` ${className}` : ""}`}>
				<div
					ref={frameRef}
					className="ds-atom-focalpoint-frame"
					// There is no element and no standard widget role for a two-axis
					// point picker. See the role="application" section of the docstring
					// above for the measured comparison against a plain focusable
					// element and against role="slider".
					role="application"
					aria-label={label}
					aria-describedby={hintId}
					// noNoninteractiveTabindex reads the TAG — a div — and not the role.
					// `role="application"` is precisely a declaration that this subtree is
					// interactive and that the arrow keys belong to it rather than to a
					// screen reader's virtual cursor, so the rule's own suggested fix
					// ("remove the tabIndex attribute") would delete the keyboard path this
					// component exists to provide. That is legacy defect 2 verbatim: no
					// tabIndex, no key handler, and the only stored crop in the product
					// unreachable without a mouse.
					//
					// The suppression has to be the LAST comment line before the attribute.
					// Written as the first line of the paragraph above it reported
					// `suppressions/unused` and the rule still fired — measured.
					// biome-ignore lint/a11y/noNoninteractiveTabindex: role="application" IS the interactivity declaration; see above
					tabIndex={0}
					onPointerDown={handlePointerDown}
					onKeyDown={handleKeyDown}
					// `undefined` when the prop is omitted, so the frame carries NO
					// style attribute at all and the class-level default in
					// primitives.css is reachable from a media query. Writing
					// `style={{ aspectRatio }}` here instead would put the property
					// itself inline, where it outranks every class rule without
					// `!important` (E3 / E5 / F-12-2); writing the custom property
					// unconditionally would make the default unreachable (E2).
					style={ratioStyle}
				>
					<img
						className="ds-atom-focalpoint-image"
						src={src}
						alt={alt}
						// Chromium starts its native image drag on a mouse or pen press,
						// which cancels the pointer sequence before pointerup — so without
						// this the drag path is touch-only. Measured on Lightbox in 01-07.
						draggable={false}
						style={{ objectPosition: `${point.x}% ${point.y}%` }}
					/>
					<span
						className="ds-atom-focalpoint-marker"
						// Decorative: the position it shows is spoken by the live region,
						// and a second announcement of the same fact is noise.
						aria-hidden="true"
						style={{ left: `${point.x}%`, top: `${point.y}%` }}
					>
						<span className="ds-atom-focalpoint-dot" />
					</span>
				</div>
				<span className="ds-visually-hidden" id={hintId}>
					Drag or click to place the focal point. Arrow keys move it one percent, Shift and an arrow
					key move it ten percent, and Home returns it to the centre.
				</span>
				<div
					className="ds-visually-hidden"
					// biome-ignore lint/a11y/useSemanticElements: <output> carries this role
					// implicitly, but its live-region support is the least consistent of the
					// announcement patterns and it is a form-association element used
					// outside a form. Spelled out explicitly, as Lightbox does.
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					{announcement}
				</div>
			</div>
		);
	},
);
