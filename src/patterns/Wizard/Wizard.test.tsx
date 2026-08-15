import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Wizard, type WizardStep } from ".";
const STEPS: WizardStep[] = [
	{ label: "Personal Info", desc: "Your basic details" },
	{ label: "Account Setup", desc: "Username and password" },
	{ label: "Confirm", desc: "Review and submit" },
];

const TWO_STEPS: WizardStep[] = [{ label: "Step One" }, { label: "Step Two" }];

describe("Wizard", () => {
	// Test 1: renders step dots equal to steps.length
	it("renders step dots equal to steps.length", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		const dots = document.querySelectorAll(".ds-atom-wizard-dot");
		expect(dots).toHaveLength(3);
	});

	// Test 2: first step is active (dot amber via data-status="active"), others pending
	it("first step is active, others pending", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "active");
		expect(stepEls[1]).toHaveAttribute("data-status", "pending");
		expect(stepEls[2]).toHaveAttribute("data-status", "pending");
	});

	// Test 3: clicking Next advances to step 2, step 1 dot turns done
	it("clicking Next advances to step 2 and marks step 1 as done", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Next"));
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "done");
		expect(stepEls[1]).toHaveAttribute("data-status", "active");
	});

	// Test 4: Back on step 1 does nothing
	it("Back on step 1 does nothing", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		const backBtn = screen.getByText("Back");
		expect(backBtn).toBeDisabled();
		fireEvent.click(backBtn);
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "active");
	});

	// Test 5: validate() returning a string blocks Next and shows error inline
	it("validate() returning a string blocks Next and shows error", () => {
		const stepsWithValidation: WizardStep[] = [
			{ label: "Step 1", validate: () => "Name is required" },
			{ label: "Step 2" },
		];
		render(
			<Wizard steps={stepsWithValidation} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Next"));
		expect(screen.getByText("Name is required")).toBeInTheDocument();
		// Still on step 1
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "active");
	});

	// Test 6: validate() returning null/undefined allows Next
	it("validate() returning null allows Next", () => {
		const stepsWithValidation: WizardStep[] = [
			{ label: "Step 1", validate: () => null },
			{ label: "Step 2" },
		];
		render(
			<Wizard steps={stepsWithValidation} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Next"));
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "done");
		expect(stepEls[1]).toHaveAttribute("data-status", "active");
	});

	// Test 7: ProgressBar receives value = ((currentStep + 1) / totalSteps) * 100
	it("ProgressBar receives correct value based on current step", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		const progressBar = document.querySelector("[role='progressbar']");
		expect(progressBar).toBeInTheDocument();
		// At step 0 of 3: value = 1/3 * 100 ≈ 33.33
		const initial = progressBar?.getAttribute("aria-valuenow") ?? "";
		expect(Number(initial)).toBeCloseTo(33.33, 1);
		fireEvent.click(screen.getByText("Next"));
		// At step 1 of 3: value = 2/3 * 100 ≈ 66.67
		const valuenow = progressBar?.getAttribute("aria-valuenow") ?? "";
		expect(Number(valuenow)).toBeCloseTo(66.67, 1);
	});

	// Test 8: Next on last step calls onComplete
	it("Next on last step calls onComplete", () => {
		const onComplete = vi.fn();
		render(
			<Wizard steps={TWO_STEPS} onComplete={onComplete}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Next")); // go to step 2 (last)
		expect(screen.getByText("Finish")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Finish"));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	// Test 9: orientation="vertical" adds data-orientation="vertical" to root
	it('orientation="vertical" adds data-orientation="vertical" to root', () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()} orientation="vertical">
				<div>content</div>
			</Wizard>,
		);
		const root = document.querySelector(".ds-atom-wizard");
		expect(root).toHaveAttribute("data-orientation", "vertical");
	});

	// Test 10: render prop children: children passed as function receives current step index
	it("render prop children receives current step index", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				{(step) => <div data-testid="step-content">Step {step + 1} content</div>}
			</Wizard>,
		);
		expect(screen.getByTestId("step-content")).toHaveTextContent("Step 1 content");
		fireEvent.click(screen.getByText("Next"));
		expect(screen.getByTestId("step-content")).toHaveTextContent("Step 2 content");
	});

	// Test 11: render prop children: children passed as ReactNode renders directly
	it("children as ReactNode renders directly", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div data-testid="static-content">Static content</div>
			</Wizard>,
		);
		expect(screen.getByTestId("static-content")).toBeInTheDocument();
		expect(screen.getByTestId("static-content")).toHaveTextContent("Static content");
	});

	// Test 12: step label text renders next to each dot
	it("renders step label text for each step", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		expect(screen.getByText("Personal Info")).toBeInTheDocument();
		expect(screen.getByText("Account Setup")).toBeInTheDocument();
		expect(screen.getByText("Confirm")).toBeInTheDocument();
	});

	// Test 13: onCancel called when cancel button pressed
	it("onCancel called when cancel button pressed", () => {
		const onCancel = vi.fn();
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()} onCancel={onCancel}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Cancel"));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	// Test 14: step desc text renders when provided
	it("renders step desc text when provided", () => {
		render(
			<Wizard steps={STEPS} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		expect(screen.getByText("Your basic details")).toBeInTheDocument();
		expect(screen.getByText("Username and password")).toBeInTheDocument();
		expect(screen.getByText("Review and submit")).toBeInTheDocument();
	});

	// Test 15: error message clears when step advances after fix
	it("error clears when step advances after fix", () => {
		let shouldFail = true;
		const stepsWithFixableValidation: WizardStep[] = [
			{
				label: "Step 1",
				validate: () => (shouldFail ? "Field is required" : null),
			},
			{ label: "Step 2" },
		];
		render(
			<Wizard steps={stepsWithFixableValidation} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		// First click: fails validation
		fireEvent.click(screen.getByText("Next"));
		expect(screen.getByText("Field is required")).toBeInTheDocument();
		// Fix the validation
		shouldFail = false;
		// Second click: passes validation, error should be gone
		fireEvent.click(screen.getByText("Next"));
		expect(screen.queryByText("Field is required")).not.toBeInTheDocument();
	});

	// Threat T-18-04-02: validate() throwing treated as validation failed
	it("validate() throwing is caught and treated as validation failure", () => {
		const stepsWithThrow: WizardStep[] = [
			{
				label: "Step 1",
				validate: () => {
					throw new Error("Unexpected error in validate");
				},
			},
			{ label: "Step 2" },
		];
		render(
			<Wizard steps={stepsWithThrow} onComplete={vi.fn()}>
				<div>content</div>
			</Wizard>,
		);
		fireEvent.click(screen.getByText("Next"));
		// Should show fallback error message
		expect(screen.getByRole("alert")).toBeInTheDocument();
		// Still on step 1
		const stepEls = document.querySelectorAll(".ds-atom-wizard-step");
		expect(stepEls[0]).toHaveAttribute("data-status", "active");
	});
});

describe("Wizard — step count changing underneath the active index", () => {
	const four = [{ label: "A" }, { label: "B" }, { label: "C" }, { label: "D" }];
	const two = [{ label: "A" }, { label: "B" }];

	function next() {
		fireEvent.click(screen.getByRole("button", { name: /Next|Finish/ }));
	}

	it("stays finishable when the steps array shrinks past the active step", () => {
		// Conditional steps are the normal case — a branch drops out once an earlier
		// answer rules it out. `current` was never clamped to the array, so once it
		// pointed past the end, `current === steps.length - 1` was false forever: the
		// button read "Next" permanently and onComplete could never be reached.
		const onComplete = vi.fn();
		const { rerender } = render(
			<Wizard steps={four} onComplete={onComplete}>
				<div />
			</Wizard>,
		);
		next();
		next(); // now on step index 2, beyond what `two` will contain

		rerender(
			<Wizard steps={two} onComplete={onComplete}>
				<div />
			</Wizard>,
		);

		expect(screen.getByRole("button", { name: /Next|Finish/ })).toHaveTextContent("Finish");
		next();
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("does not strand the user on an empty steps array", () => {
		// An empty array is reachable transiently while steps load or filter. It
		// previously produced a "Next" button that incremented an unbounded counter
		// and never completed.
		const onComplete = vi.fn();
		render(
			<Wizard steps={[]} onComplete={onComplete}>
				<div />
			</Wizard>,
		);
		expect(screen.getByRole("button", { name: /Next|Finish/ })).toHaveTextContent("Finish");
		next();
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it("still advances normally through a stable step list", () => {
		const onComplete = vi.fn();
		render(
			<Wizard steps={two} onComplete={onComplete}>
				<div />
			</Wizard>,
		);
		expect(screen.getByRole("button", { name: /Next|Finish/ })).toHaveTextContent("Next");
		next();
		expect(screen.getByRole("button", { name: /Next|Finish/ })).toHaveTextContent("Finish");
		next();
		expect(onComplete).toHaveBeenCalledTimes(1);
	});
});
