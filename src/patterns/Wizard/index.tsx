import { Fragment, type ReactNode, useState } from "react";
import { ProgressBar } from "../../feedback/ProgressBar";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Check } from "../../icons";
import { Button } from "../../inputs/Button";
export interface WizardStep {
	label: string;
	desc?: string;
	/** Return error string to block advance; return null/undefined to proceed. */
	validate?: () => string | null | undefined;
}

export interface WizardProps {
	steps: WizardStep[];
	onComplete: () => void;
	onCancel?: () => void;
	/** @default "horizontal" */
	orientation?: "horizontal" | "vertical";
	children: ReactNode | ((step: number) => ReactNode);
}

/**
 * Wizard — multi-step form scaffold (DS-74).
 *
 *   <Wizard steps={steps} onComplete={handleFinish}>
 *     {(step) => <StepContent step={step} />}
 *   </Wizard>
 *
 * Renders a horizontal (or vertical) stepper, a ProgressBar, step content,
 * optional inline validation error, and Back/Next navigation — all within a
 * single focus-trapped container.
 *
 * Per-step validation: attach `validate()` to a WizardStep; returning a
 * non-empty string blocks advance and surfaces the error inline.
 * Thrown exceptions are caught and treated as validation failures
 * (threat T-18-04-02).
 *
 * Does NOT wrap content in a <form> — step fields are the consumer's
 * responsibility. Wizard manages step state only.
 */
export function Wizard({ steps, onComplete, onCancel, orientation, children }: WizardProps) {
	const [current, setCurrent] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [trapEl, setTrapEl] = useState<HTMLDivElement | null>(null);

	// Focus trap is always active while the Wizard is mounted.
	useFocusTrap(trapEl, true);

	const handleNext = () => {
		// T-18-04-02: wrap validate() in try/catch so thrown errors are treated
		// as "validation failed" rather than crashing the component.
		let validationResult: string | null | undefined;
		try {
			validationResult = steps[current]?.validate?.();
		} catch {
			validationResult = "Validation failed: unexpected error";
		}

		if (typeof validationResult === "string" && validationResult.length > 0) {
			setError(validationResult);
			return;
		}

		setError(null);

		if (current === steps.length - 1) {
			onComplete();
			return;
		}

		setCurrent((c) => c + 1);
	};

	const handleBack = () => {
		if (current === 0) return;
		setError(null);
		setCurrent((c) => c - 1);
	};

	const pct = ((current + 1) / steps.length) * 100;

	return (
		<div ref={setTrapEl} className="ds-atom-wizard" data-orientation={orientation ?? "horizontal"}>
			{/* Stepper */}
			<div className="ds-atom-wizard-stepper">
				{steps.map((step, i) => {
					const status = i < current ? "done" : i === current ? "active" : "pending";
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: wizard steps are positional by design; labels may not be unique, and step identity is the index (same pattern as Tabs/Carousel in this codebase)
						<Fragment key={i}>
							{i > 0 && <div className="ds-atom-wizard-connector" aria-hidden="true" />}
							<div className="ds-atom-wizard-step" data-status={status}>
								<div className="ds-atom-wizard-dot">
									{status === "done" ? <Check size={13} color="var(--cream)" /> : i + 1}
								</div>
								<div className="ds-atom-wizard-step-text">
									<div className="ds-atom-wizard-label">{step.label}</div>
									{step.desc && <div className="ds-atom-wizard-desc">{step.desc}</div>}
								</div>
							</div>
						</Fragment>
					);
				})}
			</div>

			{/* Progress bar */}
			<ProgressBar value={pct} />

			{/* Step content */}
			<div className="ds-atom-wizard-content">
				{typeof children === "function" ? children(current) : children}
			</div>

			{/* Validation error — role="alert" so screen readers announce it */}
			{error && (
				<div className="ds-atom-wizard-error" role="alert">
					{error}
				</div>
			)}

			{/* Navigation — INSIDE the focus trap boundary */}
			<div className="ds-atom-wizard-nav">
				{onCancel && (
					<Button variant="ghost" size="sm" onClick={onCancel} style={{ marginRight: "auto" }}>
						Cancel
					</Button>
				)}
				<Button variant="secondary" size="sm" onClick={handleBack} disabled={current === 0}>
					Back
				</Button>
				<Button variant="primary" size="sm" onClick={handleNext}>
					{current === steps.length - 1 ? "Finish" : "Next"}
				</Button>
			</div>
		</div>
	);
}
