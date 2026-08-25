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
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "../../icons";
import { IconButton } from "../../inputs/IconButton";
export type ToastTone = "success" | "error" | "info" | "warning";

export interface ToastOptions {
	/** Auto-dismiss after `duration` ms. Default 3000. Pass `Infinity` to disable auto-dismiss. */
	duration?: number;
}

interface ToastEntry {
	id: number;
	tone: ToastTone;
	message: ReactNode;
	duration: number;
	dismissing: boolean;
}

interface ToastApi {
	success: (message: ReactNode, opts?: ToastOptions) => number;
	error: (message: ReactNode, opts?: ToastOptions) => number;
	info: (message: ReactNode, opts?: ToastOptions) => number;
	warning: (message: ReactNode, opts?: ToastOptions) => number;
	dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 3000;
const MAX_CONCURRENT = 3;
const SLIDE_OUT_MS = 200; // matches @keyframes ds-atom-toast-slideout

/**
 * useToast - imperative toast API hook (D-400).
 *
 * Must be called inside a `<ToastProvider>`. Throws otherwise.
 *
 *   const toast = useToast();
 *   toast.success("Saved");
 *   toast.error("Failed", { duration: 5000 });
 *   toast.info("Heads up");
 *   toast.warning("Almost full");
 *   const id = toast.success("...");
 *   toast.dismiss(id);
 */
export function useToast(): ToastApi {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within a <ToastProvider>");
	}
	return ctx;
}

let nextToastId = 0;

export interface ToastProviderProps {
	children: ReactNode;
}

/**
 * ToastProvider - context provider + DSPortal-mounted region (D-400, D-401).
 *
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 * Mounts a fixed top-right region (z-1100) that renders only when ≥1 toast
 * is active. Max 3 concurrent LIVE toasts; 4th added → oldest FIFO drops.
 * A dropped toast keeps its node for SLIDE_OUT_MS while it animates out, so the
 * region may briefly hold more than 3 nodes - but never more than 3 live ones.
 * Each toast auto-dismisses after `duration` ms (default 3000); pass
 * `duration: Infinity` to disable auto-dismiss.
 *
 * Callback-ref-as-state mounts the stack-container DOM as state (Tooltip
 * line 79 + Popover line 73 pattern). Animations start cleanly once DSPortal
 * commits the portaled node and React fires the callback ref.
 */
export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<ToastEntry[]>([]);
	const dismissTimers = useRef<Map<number, number>>(new Map());

	// Callback-ref-as-state (Tooltip line 79 + Popover line 73 pattern). Tracks
	// the portaled stack-container DOM element as state. Any portal-dependent
	// effect lists `stackEl` in deps so it re-runs once DSPortal commits the
	// node. NOT the Modal mount-tick boolean flag - that pattern is wrong here.
	const [, setStackEl] = useState<HTMLDivElement | null>(null);

	// Schedule full removal of a dismissing toast after slide-out animation.
	const scheduleRemoval = useCallback((id: number) => {
		window.setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, SLIDE_OUT_MS);
	}, []);

	// Mark a toast as dismissing (triggers slide-out CSS) and clean up auto-dismiss timer.
	const startDismiss = useCallback(
		(id: number) => {
			const timerId = dismissTimers.current.get(id);
			if (timerId !== undefined) {
				window.clearTimeout(timerId);
				dismissTimers.current.delete(id);
			}
			setToasts((prev) => {
				let mutated = false;
				const next = prev.map((t) => {
					if (t.id === id && !t.dismissing) {
						mutated = true;
						return { ...t, dismissing: true };
					}
					return t;
				});
				return mutated ? next : prev;
			});
			scheduleRemoval(id);
		},
		[scheduleRemoval],
	);

	const add = useCallback(
		(tone: ToastTone, message: ReactNode, opts?: ToastOptions): number => {
			const id = ++nextToastId;
			const duration = opts?.duration ?? DEFAULT_DURATION;
			setToasts((prev) => {
				// Count only LIVE toasts. A node already marked `dismissing` is mid-slide-out
				// and removes itself after SLIDE_OUT_MS, so it holds no slot. Measuring the
				// cap against `prev.length` counted those leaving nodes, so a toast arriving
				// inside the window evicted a second live toast and the region settled BELOW
				// the cap - 2 live at the 5th, 1 live at the 6th (F-8).
				const live = prev.reduce((n, t) => (t.dismissing ? n : n + 1), 0);
				const overflow = live + 1 - MAX_CONCURRENT;
				let next = prev;
				if (overflow > 0) {
					// FIFO drop: pick the OLDEST non-dismissing toast(s) and mark them dismissing.
					const ids: number[] = [];
					for (let i = 0; i < prev.length && ids.length < overflow; i++) {
						const candidate = prev[i];
						if (candidate && !candidate.dismissing) ids.push(candidate.id);
					}
					next = prev.map((t) => (ids.includes(t.id) ? { ...t, dismissing: true } : t));
					for (const dropId of ids) scheduleRemoval(dropId);
				}
				return [...next, { id, tone, message, duration, dismissing: false }];
			});
			if (Number.isFinite(duration)) {
				const timerId = window.setTimeout(() => startDismiss(id), duration);
				dismissTimers.current.set(id, timerId);
			}
			return id;
		},
		[scheduleRemoval, startDismiss],
	);

	const api = useMemo<ToastApi>(
		() => ({
			success: (message, opts) => add("success", message, opts),
			error: (message, opts) => add("error", message, opts),
			info: (message, opts) => add("info", message, opts),
			warning: (message, opts) => add("warning", message, opts),
			dismiss: (id) => startDismiss(id),
		}),
		[add, startDismiss],
	);

	// Cleanup all pending timers on unmount.
	useEffect(() => {
		const timers = dismissTimers.current;
		return () => {
			for (const timerId of timers.values()) window.clearTimeout(timerId);
			timers.clear();
		};
	}, []);

	// Render the portal whenever there are active toasts. The callback ref
	// `setStackEl` will fire once DSPortal commits the inner div; downstream
	// effects (none required for Toast - no measurement) would gate on stackEl.
	const showRegion = toasts.length > 0;

	return (
		<ToastContext.Provider value={api}>
			{children}
			{showRegion ? (
				<DSPortal>
					<div ref={setStackEl} className="ds-atom-toast-region" aria-label="Notifications">
						{toasts.map((t) => (
							<ToastNode key={t.id} entry={t} onDismiss={() => startDismiss(t.id)} />
						))}
					</div>
				</DSPortal>
			) : null}
		</ToastContext.Provider>
	);
}

const TONE_ICON: Record<ToastTone, ReactNode> = {
	success: <CheckCircle2 size={16} aria-hidden="true" />,
	error: <XCircle size={16} aria-hidden="true" />,
	warning: <AlertTriangle size={16} aria-hidden="true" />,
	info: <Info size={16} aria-hidden="true" />,
};

interface ToastNodeProps {
	entry: ToastEntry;
	onDismiss: () => void;
}

function ToastNode({ entry, onDismiss }: ToastNodeProps) {
	const role = entry.tone === "error" || entry.tone === "warning" ? "alert" : "status";
	const ariaLive = role === "alert" ? "assertive" : "polite";
	return (
		<div
			className="ds-atom-toast"
			data-tone={entry.tone}
			data-dismissing={entry.dismissing ? "true" : undefined}
			role={role}
			aria-live={ariaLive}
		>
			<span className="ds-atom-toast-icon" aria-hidden="true">
				{TONE_ICON[entry.tone]}
			</span>
			<span className="ds-atom-toast-msg">{entry.message}</span>
			<IconButton
				size="sm"
				className="ds-atom-toast-close"
				label="Dismiss notification"
				icon={<X size={14} />}
				onClick={onDismiss}
			/>
		</div>
	);
}
