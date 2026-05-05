import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { RelativeTime } from ".";

describe("RelativeTime", () => {
	it("renders a <time> element", () => {
		const { container } = render(<RelativeTime date={new Date()} />);
		expect(container.querySelector("time")).not.toBeNull();
	});

	it("root element has className containing 'ds-atom-relative-time'", () => {
		const { container } = render(<RelativeTime date={new Date()} />);
		expect(container.querySelector("time")?.className).toContain("ds-atom-relative-time");
	});

	it("dateTime attribute equals d.toISOString() for a known input date", () => {
		const d = new Date("2024-01-15T10:00:00.000Z");
		const { container } = render(<RelativeTime date={d} />);
		const el = container.querySelector("time");
		expect(el?.getAttribute("dateTime")).toBe(d.toISOString());
	});

	it("title attribute equals d.toLocaleString() for a known input date", () => {
		const d = new Date("2024-01-15T10:00:00.000Z");
		const { container } = render(<RelativeTime date={d} />);
		const el = container.querySelector("time");
		expect(el?.getAttribute("title")).toBe(d.toLocaleString());
	});

	it("date 10 min in the past → text content contains '10m ago'", () => {
		const d = new Date(Date.now() - 10 * 60_000);
		const { container } = render(<RelativeTime date={d} />);
		expect(container.querySelector("time")?.textContent).toContain("10m ago");
	});

	it("date 3 hours in the past → text content contains '3h ago'", () => {
		const d = new Date(Date.now() - 3 * 3_600_000);
		const { container } = render(<RelativeTime date={d} />);
		expect(container.querySelector("time")?.textContent).toContain("3h ago");
	});

	it("date 5 days in the past → text content contains '5d ago'", () => {
		const d = new Date(Date.now() - 5 * 86_400_000);
		const { container } = render(<RelativeTime date={d} />);
		expect(container.querySelector("time")?.textContent).toContain("5d ago");
	});

	it("date 45 days in the past → text content is non-empty and does NOT contain 'ago'", () => {
		const d = new Date(Date.now() - 45 * 86_400_000);
		const { container } = render(<RelativeTime date={d} />);
		const text = container.querySelector("time")?.textContent ?? "";
		expect(text.length).toBeGreaterThan(0);
		expect(text).not.toContain("ago");
	});

	it("date 5 min in the future → text content contains 'in 5m'", () => {
		const d = new Date(Date.now() + 5 * 60_000);
		const { container } = render(<RelativeTime date={d} />);
		expect(container.querySelector("time")?.textContent).toContain("in 5m");
	});

	it("prefix='Applied' renders a <span> with color style 'var(--ink-4)' containing 'Applied'", () => {
		const { container } = render(
			<RelativeTime date={new Date(Date.now() - 10 * 60_000)} prefix="Applied" />,
		);
		const span = container.querySelector("time span");
		expect(span).not.toBeNull();
		expect((span as HTMLElement)?.style.color).toBe("var(--ink-4)");
		expect(span?.textContent).toContain("Applied");
	});

	it("forwards ref — ref.current is the time DOM element", () => {
		const ref = createRef<HTMLTimeElement>();
		render(<RelativeTime date={new Date()} ref={ref} />);
		expect(ref.current).not.toBeNull();
		expect(ref.current?.tagName.toLowerCase()).toBe("time");
	});
});
