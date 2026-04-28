import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
	it("renders title text", () => {
		render(<EmptyState title="Nothing here" />);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("root has .ds-atom-empty class", () => {
		const { container } = render(<EmptyState title="x" />);
		expect(container.firstChild).toHaveClass("ds-atom-empty");
	});

	it("renders icon when passed", () => {
		render(<EmptyState icon={<svg data-testid="my-icon" />} title="x" />);
		expect(screen.getByTestId("my-icon")).toBeInTheDocument();
	});

	it("hides icon slot when not passed", () => {
		const { container } = render(<EmptyState title="x" />);
		expect(container.querySelector(".ds-atom-empty-icon")).toBeNull();
	});

	it("icon wrapper is aria-hidden so SR doesn't announce decorative icon", () => {
		const { container } = render(<EmptyState icon={<svg data-testid="ico" />} title="x" />);
		const wrap = container.querySelector(".ds-atom-empty-icon");
		expect(wrap).not.toBeNull();
		expect(wrap).toHaveAttribute("aria-hidden", "true");
	});

	it("renders description when passed", () => {
		render(<EmptyState title="x" description="More info here" />);
		expect(screen.getByText("More info here")).toBeInTheDocument();
	});

	it("hides description slot when not passed", () => {
		const { container } = render(<EmptyState title="x" />);
		expect(container.querySelector(".ds-atom-empty-desc")).toBeNull();
	});

	it("renders children (CTA slot) when passed", () => {
		render(
			<EmptyState title="x">
				<button type="button" data-testid="cta">
					Click
				</button>
			</EmptyState>,
		);
		expect(screen.getByTestId("cta")).toBeInTheDocument();
	});

	it("hides actions slot when no children", () => {
		const { container } = render(<EmptyState title="x" />);
		expect(container.querySelector(".ds-atom-empty-actions")).toBeNull();
	});

	it("forwards ref to root div", () => {
		const ref = createRef<HTMLDivElement>();
		render(<EmptyState ref={ref} title="x" />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveClass("ds-atom-empty");
	});

	it("appends consumer className after .ds-atom-empty", () => {
		const { container } = render(<EmptyState className="extra" title="x" />);
		const root = container.firstChild as HTMLElement;
		expect(root).toHaveClass("ds-atom-empty");
		expect(root).toHaveClass("extra");
	});

	it("merges consumer style last", () => {
		const { container } = render(<EmptyState style={{ padding: "999px" }} title="x" />);
		const root = container.firstChild as HTMLElement;
		expect(root.style.padding).toBe("999px");
	});
});
