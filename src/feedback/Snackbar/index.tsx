import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { X } from "../../icons";

/**
 * Snackbar — bottom-center, solid-fill action surface. Companion to Toast
 * but with a different intent: snackbars confirm a destructive or
 * reversible action and offer an inline UNDO / RETRY. Toast is for
 * passive notifications; Snackbar pairs with a callback. Single-at-a-time
 * (replaces any active snackbar with FIFO ordering) — never stacks. Solid
 * ink background so the message stays readable over any page chrome
 * (Toast's translucent fill becomes hard to read on top-heavy apps).
 */

export type SnackbarTone = "neutral" | "success" | "error";

export interface SnackbarAction {
	/** Visible label, e.g. "UNDO", "RETRY". Rendered mono caps amber. */
	label: string;
	/** Fires when the action is activated. The snackbar auto-dismisses after. */
	onClick: () => void;
}

export interface SnackbarOptions {
	/** Auto-dismiss after `duration` ms. Default 5000 (longer than Toast — the
	 * user needs time to read + click the action). Pass `Infinity` to disable. */
	duration?: number;
	/** Optional inline action (UNDO / RETRY / etc.). Rendered to the right of
	 * the message. Clicking it fires `onClick` then dismisses the snackbar. */
	action?: SnackbarAction;
	/** Visual tone. `"neutral"` (default) for confirmations; `"success"` /
	 * `"error"` add a left-border accent without changing the ink fill. */
	tone?: SnackbarTone;
	/** Show the explicit dismiss "✕" affordance.
	 *
	 * Default behavior:
	 *   - with `action` → false (the action button doubles as the dismiss path,
	 *     plus the timeout will close it; an extra "✕" is redundant chrome)
	 *   - without `action` → true (otherwise the snackbar would only have the
	 *     timeout as an escape hatch, which is too implicit)
	 *
	 * Pass an explicit boolean to override.
	 */
	dismissible?: boolean;
	/** Render a thin countdown progress bar along the bottom edge that depletes
	 * (width 100% → 0%) linearly over `duration` ms — a visual undo timer
	 * (matches the SoftConfirmToast pattern). Only renders when `true` AND
	 * `duration` is finite. Respects `prefers-reduced-motion: reduce` (the bar
	 * is shown static, no animation). Default `false`. */
	progress?: boolean;
}

interface SnackbarEntry {
	id: number;
	tone: SnackbarTone;
	message: ReactNode;
	action: SnackbarAction | null;
	duration: number;
	dismissible: boolean;
	progress: boolean;
	dismissing: boolean;
}

interface SnackbarApi {
	/** Show a snackbar. Replaces any active snackbar (single-at-a-time). */
	show: (message: ReactNode, opts?: SnackbarOptions) => number;
	dismiss: (id: number) => void;
}

const SnackbarContext = createContext<SnackbarApi | null>(null);

const DEFAULT_DURATION = 5000;
const SLIDE_OUT_MS = 200;

/**
 * useSnackbar — imperative bottom-center action surface hook.
 *
 * Must be called inside a `<SnackbarProvider>`. Throws otherwise.
 *
 *   const snack = useSnackbar();
 *   snack.show("Application deleted.", {
 *     action: { label: "UNDO", onClick: () => restore(row) },
 *   });
 *   snack.show("Saved.", { tone: "success" });
 *   const id = snack.show("...", { duration: Infinity });
 *   snack.dismiss(id);
 */
export function useSnackbar(): SnackbarApi {
	const ctx = useContext(SnackbarContext);
	if (!ctx) {
		throw new Error("useSnackbar must be used within a <SnackbarProvider>");
	}
	return ctx;
}

let nextSnackbarId = 0;

export interface SnackbarProviderProps {
	children: ReactNode;
}

/**
 * SnackbarProvider — context + DSPortal-mounted region (bottom-center).
 *
 *   <SnackbarProvider>
 *     <App />
 *   </SnackbarProvider>
 *
 * Single-snackbar-at-a-time: calling show() while another is visible
 * dismisses the old one before fading in the new (FIFO swap, not a queue).
 * Mounts a fixed bottom-center region (z-1100) that renders only when a
 * snackbar is active. The region pointer-events:none lets clicks pass to
 * the page; the snackbar itself sets pointer-events:auto.
 */
export function SnackbarProvider({ children }: SnackbarProviderProps) {
	const [entry, setEntry] = useState<SnackbarEntry | null>(null);
	const dismissTimer = useRef<number | null>(null);

	const clearTimer = () => {
		if (dismissTimer.current !== null) {
			window.clearTimeout(dismissTimer.current);
			dismissTimer.current = null;
		}
	};

	const scheduleRemoval = useCallback(() => {
		window.setTimeout(() => {
			setEntry((prev) => (prev?.dismissing ? null : prev));
		}, SLIDE_OUT_MS);
	}, []);

	const startDismiss = useCallback(
		(id: number) => {
			clearTimer();
			setEntry((prev) => {
				if (!prev || prev.id !== id || prev.dismissing) return prev;
				return { ...prev, dismissing: true };
			});
			scheduleRemoval();
		},
		[scheduleRemoval],
	);

	const show = useCallback(
		(message: ReactNode, opts?: SnackbarOptions): number => {
			const id = ++nextSnackbarId;
			const duration = opts?.duration ?? DEFAULT_DURATION;
			const action = opts?.action ?? null;
			// Default: hide the ✕ when an action button is the primary dismiss
			// path; show it otherwise. Explicit `dismissible` prop overrides.
			const dismissible = opts?.dismissible ?? action === null;
			clearTimer();
			setEntry({
				id,
				tone: opts?.tone ?? "neutral",
				message,
				action,
				duration,
				dismissible,
				progress: opts?.progress ?? false,
				dismissing: false,
			});
			if (Number.isFinite(duration)) {
				dismissTimer.current = window.setTimeout(() => startDismiss(id), duration);
			}
			return id;
		},
		[startDismiss],
	);

	const api = useMemo<SnackbarApi>(
		() => ({
			show,
			dismiss: (id) => startDismiss(id),
		}),
		[show, startDismiss],
	);

	useEffect(
		() => () => {
			clearTimer();
		},
		[],
	);

	return (
		<SnackbarContext.Provider value={api}>
			{children}
			{entry ? (
				<DSPortal>
					<div className="ds-atom-snackbar-region" aria-label="Action confirmations">
						<SnackbarNode
							entry={entry}
							onAction={() => {
								if (entry.action) {
									entry.action.onClick();
									startDismiss(entry.id);
								}
							}}
							onDismiss={() => startDismiss(entry.id)}
						/>
					</div>
				</DSPortal>
			) : null}
		</SnackbarContext.Provider>
	);
}

interface SnackbarNodeProps {
	entry: SnackbarEntry;
	onAction: () => void;
	onDismiss: () => void;
}

// Tone-tinted bar colors. Neutral uses a subtle cream wash (the snackbar fill
// is solid `--ink`); success/error pick up their accent tokens.
const PROGRESS_COLOR: Record<SnackbarTone, string> = {
	neutral: "var(--amber)",
	success: "var(--green, #1f8a5b)",
	error: "var(--red, #9b2c2c)",
};

// Component-scoped keyframe (depletes width 100% → 0%). Scoped name avoids
// colliding with any host-app `@keyframes` and with the slidein/slideout
// keyframes already defined in primitives.css. Inline so the Snackbar folder
// stays self-contained (primitives.css is off-limits for this change).
const PROGRESS_STYLE = `
@keyframes ds-atom-snackbar-progress {
	from { transform: scaleX(1); }
	to { transform: scaleX(0); }
}
@media (prefers-reduced-motion: reduce) {
	.ds-atom-snackbar-progress {
		animation: none !important;
		transform: scaleX(1) !important;
	}
}
`;

function SnackbarNode({ entry, onAction, onDismiss }: SnackbarNodeProps) {
	const role = entry.tone === "error" ? "alert" : "status";
	const ariaLive = role === "alert" ? "assertive" : "polite";
	// Only render the depleting bar when explicitly requested AND there is a
	// finite countdown to depict. Infinite/persistent snackbars have no timer
	// to visualize.
	const showProgress = entry.progress && Number.isFinite(entry.duration);
	return (
		<div
			className="ds-atom-snackbar"
			data-tone={entry.tone}
			data-dismissing={entry.dismissing ? "true" : undefined}
			role={role}
			aria-live={ariaLive}
			// position/overflow set inline (primitives.css is off-limits) so the
			// absolutely-positioned bar clips to the snackbar's rounded corners.
			style={showProgress ? { position: "relative", overflow: "hidden" } : undefined}
		>
			<span className="ds-atom-snackbar-msg">{entry.message}</span>
			{entry.action ? (
				<button type="button" className="ds-atom-snackbar-action" onClick={onAction}>
					{entry.action.label}
				</button>
			) : null}
			{entry.dismissible ? (
				<button
					type="button"
					className="ds-atom-snackbar-close"
					aria-label="Dismiss"
					onClick={onDismiss}
				>
					<X size={14} aria-hidden="true" />
				</button>
			) : null}
			{showProgress ? (
				<>
					<style>{PROGRESS_STYLE}</style>
					<span
						className="ds-atom-snackbar-progress"
						data-testid="ds-atom-snackbar-progress"
						aria-hidden="true"
						style={{
							position: "absolute",
							left: 0,
							bottom: 0,
							height: 2,
							width: "100%",
							transformOrigin: "left",
							background: PROGRESS_COLOR[entry.tone],
							// Pause depletion once dismissing so the slide-out reads cleanly.
							animation: entry.dismissing
								? undefined
								: `ds-atom-snackbar-progress ${entry.duration}ms linear forwards`,
						}}
					/>
				</>
			) : null}
		</div>
	);
}
