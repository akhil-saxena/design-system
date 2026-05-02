import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FieldError, FormErrorSummary, PasswordStrength } from "./FormValidation";

afterEach(cleanup);

describe("PasswordStrength", () => {
	it("score=0 renders 4 grey segments", () => {
		const { container } = render(<PasswordStrength score={0} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		// All segments use --ink-5 (grey) background
		for (const seg of segs) {
			expect((seg as HTMLElement).style.background).toContain("ink-5");
		}
	});

	it("score=1 renders 1 red segment + 3 grey segments", () => {
		const { container } = render(<PasswordStrength score={1} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		expect((segs[0] as HTMLElement).style.background).toContain("red");
		expect((segs[1] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[2] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[3] as HTMLElement).style.background).toContain("ink-5");
	});

	it("score=2 renders 2 amber segments + 2 grey segments", () => {
		const { container } = render(<PasswordStrength score={2} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		expect((segs[0] as HTMLElement).style.background).toContain("amber");
		expect((segs[1] as HTMLElement).style.background).toContain("amber");
		expect((segs[2] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[3] as HTMLElement).style.background).toContain("ink-5");
	});

	it("score=4 renders 4 green segments", () => {
		const { container } = render(<PasswordStrength score={4} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		for (const seg of segs) {
			expect((seg as HTMLElement).style.background).toContain("green");
		}
	});

	it("renders strength label for each score", () => {
		const { rerender } = render(<PasswordStrength score={1} />);
		expect(screen.getByText("Weak")).toBeTruthy();

		rerender(<PasswordStrength score={2} />);
		expect(screen.getByText("Fair")).toBeTruthy();

		rerender(<PasswordStrength score={3} />);
		expect(screen.getByText("Good")).toBeTruthy();

		rerender(<PasswordStrength score={4} />);
		expect(screen.getByText("Strong")).toBeTruthy();
	});
});

describe("FieldError", () => {
	it("renders message text with role=alert", () => {
		render(<FieldError message="This field is required" />);
		const el = screen.getByRole("alert");
		expect(el.textContent).toBe("This field is required");
	});

	it("renders nothing when message is falsy", () => {
		const { container } = render(<FieldError message={null} />);
		expect(container.firstChild).toBeNull();
	});
});

describe("FormErrorSummary", () => {
	it("renders all error strings as a list with role=alert", () => {
		render(<FormErrorSummary errors={["Name is required", "Email is invalid"]} />);
		const alert = screen.getByRole("alert");
		expect(alert).toBeTruthy();
		expect(screen.getByText("Name is required")).toBeTruthy();
		expect(screen.getByText("Email is invalid")).toBeTruthy();
		expect(alert.querySelector("ul")).toBeTruthy();
	});

	it("renders nothing when errors array is empty", () => {
		const { container } = render(<FormErrorSummary errors={[]} />);
		expect(container.firstChild).toBeNull();
	});
});
