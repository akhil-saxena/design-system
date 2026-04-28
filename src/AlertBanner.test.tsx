import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { AlertBanner } from "./AlertBanner";

describe("AlertBanner", () => {
	it("returns null when open=false", () => {
		const { container } = render(<AlertBanner open={false} title="T" />);
		expect(container.firstChild).toBeNull();
	});

	it("renders default tone 'info' when no tone prop provided", () => {
		const { container } = render(<AlertBanner open title="T" />);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveAttribute("data-variant", "info");
		expect(root).toHaveClass("ds-atom-banner");
	});

	it("applies data-variant for each tone", () => {
		for (const t of ["info", "success", "warning", "error"] as const) {
			const { container } = render(<AlertBanner open tone={t} title="T" />);
			expect(container.firstChild).toHaveAttribute("data-variant", t);
		}
	});

	it("renders title text", () => {
		render(<AlertBanner open title="Heads up" />);
		expect(screen.getByText("Heads up")).toBeInTheDocument();
	});

	it("renders description when passed (and no children)", () => {
		render(<AlertBanner open title="T" description="More info here" />);
		expect(screen.getByText("More info here")).toBeInTheDocument();
	});

	it("children override description (children wins)", () => {
		render(
			<AlertBanner open title="T" description="hidden">
				<span>visible-children</span>
			</AlertBanner>,
		);
		expect(screen.getByText("visible-children")).toBeInTheDocument();
		expect(screen.queryByText("hidden")).toBeNull();
	});

	it("shows dismiss X when onDismiss passed (default dismissible)", () => {
		render(<AlertBanner open title="T" onDismiss={() => {}} />);
		expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
	});

	it("hides dismiss X when onDismiss not passed", () => {
		render(<AlertBanner open title="T" />);
		expect(screen.queryByLabelText("Dismiss")).toBeNull();
	});

	it("hides dismiss X when dismissible={false} even with onDismiss", () => {
		render(<AlertBanner open title="T" onDismiss={() => {}} dismissible={false} />);
		expect(screen.queryByLabelText("Dismiss")).toBeNull();
	});

	it("calls onDismiss when X is clicked", () => {
		const onDismiss = vi.fn();
		render(<AlertBanner open title="T" onDismiss={onDismiss} />);
		screen.getByLabelText("Dismiss").click();
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it("forwards ref to the root div", () => {
		const ref = createRef<HTMLDivElement>();
		render(<AlertBanner ref={ref} open title="T" />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveAttribute("data-variant", "info");
	});
});
