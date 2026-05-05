import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatCard } from ".";

vi.mock("../Sparkline", () => ({
	Sparkline: ({ data }: { data: number[] }) => (
		<svg data-testid="sparkline" data-points={data.length} />
	),
}));

describe("StatCard", () => {
	it("renders the label text", () => {
		render(<StatCard label="Applications" value="24" />);
		expect(screen.getByText("Applications")).toBeInTheDocument();
	});

	it("label element has correct inline styles", () => {
		const { container } = render(<StatCard label="Applications" value="24" />);
		const label = container.querySelector<HTMLElement>("[data-part='label']");
		expect(label).not.toBeNull();
		expect(label!.style.fontFamily).toBe("var(--mono)");
		expect(label!.style.fontSize).toBe("9px");
		expect(label!.style.letterSpacing).toBe(".08em");
		expect(label!.style.textTransform).toBe("uppercase");
		expect(label!.style.color).toBe("var(--ink-3)");
	});

	it("renders the value text", () => {
		render(<StatCard label="L" value="24" />);
		expect(screen.getByText("24")).toBeInTheDocument();
	});

	it("positive changeDir renders green badge", () => {
		const { container } = render(<StatCard label="L" value="1" change="+12%" changeDir="up" />);
		const badge = container.querySelector<HTMLElement>("[data-part='badge']");
		expect(badge).not.toBeNull();
		expect(badge!.style.background).toBe("rgba(34, 197, 94, 0.1)");
		expect(badge!.style.color).toBe("var(--green)");
	});

	it("negative changeDir renders red badge", () => {
		const { container } = render(<StatCard label="L" value="1" change="-5%" changeDir="down" />);
		const badge = container.querySelector<HTMLElement>("[data-part='badge']");
		expect(badge).not.toBeNull();
		expect(badge!.style.background).toBe("rgba(239, 68, 68, 0.08)");
		expect(badge!.style.color).toBe("var(--red)");
	});

	it("does not render badge when change prop is absent", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.querySelector("[data-part='badge']")).toBeNull();
	});

	it("renders Sparkline when data has 2 or more points", () => {
		const { container } = render(<StatCard label="L" value="1" data={[1, 2, 3]} />);
		expect(container.querySelector("svg")).not.toBeNull();
	});

	it("does not render Sparkline when data is absent", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("does not render Sparkline when data has fewer than 2 points", () => {
		const { container } = render(<StatCard label="L" value="1" data={[5]} />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("root element carries the glass class", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		expect(container.firstElementChild?.className).toContain("glass");
	});

	it("root element has borderRadius 12 inline style", () => {
		const { container } = render(<StatCard label="L" value="1" />);
		const root = container.firstElementChild as HTMLElement;
		expect(root.style.borderRadius).toBe("12px");
	});
});
