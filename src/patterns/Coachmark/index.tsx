import { type RefObject, useState } from "react";
import { X } from "../../icons";
import { Button } from "../../inputs/Button";
import { Popover } from "../../overlays/Popover";
// ─── DS-76: Coachmark — anchored first-run hint ────────────────────────────

export interface CoachmarkProps {
	/** Ref to the element being highlighted */
	anchorRef: RefObject<HTMLElement | null>;
	title: string;
	desc?: string;
	/** Current step number (1-based) */
	step?: number;
	/** Total steps in the coachmark sequence */
	total?: number;
	onNext?: () => void;
	onDone?: () => void;
	/**
	 * localStorage key for persist-dismiss state.
	 * Omit or pass null to disable persistence.
	 */
	storageKey?: string | null;
	placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

function readDismissed(storageKey: string | null | undefined): boolean {
	if (typeof window === "undefined") return false;
	if (!storageKey) return false;
	return localStorage.getItem(storageKey) === "dismissed";
}

export function Coachmark({
	anchorRef,
	title,
	desc,
	step,
	total,
	onNext,
	onDone,
	storageKey,
	placement = "bottom-start",
}: CoachmarkProps) {
	const [dismissed, setDismissed] = useState<boolean>(() => readDismissed(storageKey));

	function dismiss() {
		setDismissed(true);
		if (typeof window !== "undefined" && storageKey) {
			localStorage.setItem(storageKey, "dismissed");
		}
	}

	const isLastStep = step !== undefined && total !== undefined && step >= total;
	const hasSteps = step !== undefined && total !== undefined;

	return (
		<Popover
			anchorRef={anchorRef}
			open={!dismissed}
			onOpenChange={(open) => {
				if (!open) dismiss();
			}}
			placement={placement}
		>
			<div className="ds-atom-coachmark">
				{/* Header: title + dismiss */}
				<div className="ds-atom-coachmark-header">
					<div className="ds-atom-coachmark-title">{title}</div>
					<Button variant="ghost" size="xs" onClick={dismiss} aria-label="Dismiss">
						<X size={12} />
					</Button>
				</div>

				{desc && <div className="ds-atom-coachmark-desc">{desc}</div>}

				{/* Footer: step dots + actions */}
				{hasSteps && (
					<div className="ds-atom-coachmark-footer">
						{/* Step dots */}
						<div className="ds-atom-coachmark-dots">
							{Array.from({ length: total ?? 0 }, (_, i) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: step dots are positional by design; no stable ID available
									key={i}
									className="ds-atom-coachmark-dot"
									data-active={i === (step ?? 1) - 1 ? "true" : "false"}
								/>
							))}
						</div>

						{/* Next / Done */}
						<div className="ds-atom-coachmark-actions">
							{isLastStep ? (
								<Button size="xs" variant="primary" onClick={onDone}>
									Done
								</Button>
							) : (
								<Button size="xs" variant="primary" onClick={onNext}>
									Next
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</Popover>
	);
}
