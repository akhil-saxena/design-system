import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
	it("renders default value 0 with role='progressbar'", () => {
		render(<ProgressBar />);
		const root = screen.getByRole("progressbar");
		expect(root).toHaveAttribute("aria-valuenow", "0");
		expect(root).toHaveAttribute("aria-valuemin", "0");
		expect(root).toHaveAttribute("aria-valuemax", "100");
		expect(root).toHaveClass("ds-atom-progress");
	});

	it("sets aria-valuenow and fill width to value", () => {
		const { container } = render(<ProgressBar value={50} />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
		const fill = container.querySelector(".ds-atom-progress-fill") as HTMLElement;
		expect(fill).not.toBeNull();
		expect(fill.style.width).toBe("50%");
	});

	it("respects custom max (value/max → percentage)", () => {
		const { container } = render(<ProgressBar value={100} max={200} />);
		const root = screen.getByRole("progressbar");
		expect(root).toHaveAttribute("aria-valuemax", "200");
		expect(root).toHaveAttribute("aria-valuenow", "100");
		const fill = container.querySelector(".ds-atom-progress-fill") as HTMLElement;
		expect(fill.style.width).toBe("50%");
	});

	it("clamps negative value to 0", () => {
		const { container } = render(<ProgressBar value={-50} />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
		const fill = container.querySelector(".ds-atom-progress-fill") as HTMLElement;
		expect(fill.style.width).toBe("0%");
	});

	it("clamps value above max to max", () => {
		const { container } = render(<ProgressBar value={150} max={100} />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
		const fill = container.querySelector(".ds-atom-progress-fill") as HTMLElement;
		expect(fill.style.width).toBe("100%");
	});

	it("loading=true switches to role='status' with 3 dots", () => {
		const { container } = render(<ProgressBar loading />);
		const root = screen.getByRole("status");
		expect(root).toHaveAttribute("data-loading", "true");
		expect(root).toHaveAttribute("aria-live", "polite");
		expect(container.querySelectorAll(".ds-atom-progress-dot").length).toBe(3);
		expect(container.querySelector(".ds-atom-progress-track")).toBeNull();
	});

	it("label prop sets aria-label (determinate)", () => {
		render(<ProgressBar value={30} label="Upload" />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Upload");
	});

	it("label prop sets aria-label (loading)", () => {
		render(<ProgressBar loading label="Loading documents" />);
		expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading documents");
	});

	it("forwards ref to root div", () => {
		const ref = createRef<HTMLDivElement>();
		render(<ProgressBar ref={ref} value={20} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveAttribute("role", "progressbar");
	});
});
