import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Timeline, type TimelineEvent } from ".";
const EVENTS: TimelineEvent[] = [
	{ id: 1, date: "2026-03-04T00:00:00.000Z", label: "Applied", description: "via referral" },
	{ id: 2, date: "2026-03-11T00:00:00.000Z", label: "Recruiter call" },
	{ id: 3, date: "2026-03-18T00:00:00.000Z", label: "Tech screen" },
	{ id: 4, date: "2026-03-25T00:00:00.000Z", label: "Onsite" },
	{ id: 5, date: "2026-04-02T00:00:00.000Z", label: "Decision" },
];

describe("Timeline", () => {
	it("renders an ordered list with N children for N events", () => {
		const { container } = render(<Timeline events={EVENTS} />);
		const ol = container.querySelector("ol");
		expect(ol).toBeInTheDocument();
		const items = container.querySelectorAll("li");
		expect(items).toHaveLength(5);
	});

	it("each event has a <time> element with a dateTime attribute", () => {
		const { container } = render(<Timeline events={EVENTS} />);
		const times = container.querySelectorAll("time");
		expect(times).toHaveLength(5);
		for (const t of times) {
			expect(t).toHaveAttribute("dateTime");
			// dateTime must be a non-empty ISO string
			const dt = t.getAttribute("dateTime") ?? "";
			expect(dt.length).toBeGreaterThan(0);
			expect(new Date(dt).getTime()).not.toBeNaN();
		}
	});

	it("applies aria-label to the <ol> element", () => {
		render(<Timeline events={EVENTS} ariaLabel="Application stages" />);
		const ol = screen.getByRole("list", { name: "Application stages" });
		expect(ol).toBeInTheDocument();
	});

	it("default aria-label is 'Timeline'", () => {
		render(<Timeline events={EVENTS} />);
		const ol = screen.getByRole("list", { name: "Timeline" });
		expect(ol).toBeInTheDocument();
	});

	it("applies the ds-atom-timeline class to the <ol>", () => {
		const { container } = render(<Timeline events={EVENTS} />);
		const ol = container.querySelector("ol");
		expect(ol?.className).toContain("ds-atom-timeline");
	});

	it("sets data-orientation='horizontal' by default", () => {
		const { container } = render(<Timeline events={EVENTS} />);
		const ol = container.querySelector("ol");
		expect(ol).toHaveAttribute("data-orientation", "horizontal");
	});

	it("sets data-orientation='vertical' when orientation prop is passed", () => {
		const { container } = render(<Timeline events={EVENTS} orientation="vertical" />);
		const ol = container.querySelector("ol");
		expect(ol).toHaveAttribute("data-orientation", "vertical");
	});

	it("dot color override applies via style attribute when color provided", () => {
		const eventsWithColor: TimelineEvent[] = [
			{ id: 1, date: "2026-01-01T00:00:00.000Z", label: "Custom", color: "#ff0000" },
		];
		const { container } = render(<Timeline events={eventsWithColor} />);
		const dot = container.querySelector(".ds-atom-timeline-dot");
		expect(dot).toHaveStyle({ background: "#ff0000" });
	});

	it("events without onClick render as static (not buttons)", () => {
		const { container } = render(<Timeline events={EVENTS} />);
		const buttons = container.querySelectorAll("button.ds-atom-timeline-trigger");
		expect(buttons).toHaveLength(0);
	});

	it("clicking an event with onClick fires the handler", () => {
		const handler = vi.fn();
		const clickableEvents: TimelineEvent[] = [
			{ id: 1, date: "2026-01-01T00:00:00.000Z", label: "Clickable", onClick: handler },
			{ id: 2, date: "2026-02-01T00:00:00.000Z", label: "Static" },
		];
		render(<Timeline events={clickableEvents} />);
		const btn = screen.getByRole("button");
		fireEvent.click(btn);
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("only events with onClick render as buttons", () => {
		const handler = vi.fn();
		const mixedEvents: TimelineEvent[] = [
			{ id: 1, date: "2026-01-01T00:00:00.000Z", label: "Clickable", onClick: handler },
			{ id: 2, date: "2026-02-01T00:00:00.000Z", label: "Static" },
		];
		const { container } = render(<Timeline events={mixedEvents} />);
		const buttons = container.querySelectorAll("button.ds-atom-timeline-trigger");
		expect(buttons).toHaveLength(1);
	});

	it("empty events array renders an empty <ol> with no errors", () => {
		const { container } = render(<Timeline events={[]} />);
		const ol = container.querySelector("ol");
		expect(ol).toBeInTheDocument();
		expect(ol?.children).toHaveLength(0);
	});

	it("renders description text when provided", () => {
		render(<Timeline events={EVENTS} />);
		expect(screen.getByText("via referral")).toBeInTheDocument();
	});

	it("does not render description span when omitted", () => {
		const eventsNoDesc: TimelineEvent[] = [
			{ id: 1, date: "2026-01-01T00:00:00.000Z", label: "No desc" },
		];
		const { container } = render(<Timeline events={eventsNoDesc} />);
		const descs = container.querySelectorAll(".ds-atom-timeline-desc");
		expect(descs).toHaveLength(0);
	});

	it("merges custom className onto the <ol>", () => {
		const { container } = render(<Timeline events={EVENTS} className="my-class" />);
		const ol = container.querySelector("ol");
		expect(ol?.className).toContain("my-class");
		expect(ol?.className).toContain("ds-atom-timeline");
	});

	it("accepts a Date object as the date prop and renders a valid dateTime", () => {
		const dateObj = new Date("2026-06-15T00:00:00.000Z");
		const eventsDateObj: TimelineEvent[] = [{ id: 1, date: dateObj, label: "Date object" }];
		const { container } = render(<Timeline events={eventsDateObj} />);
		const timeEl = container.querySelector("time");
		const dt = timeEl?.getAttribute("dateTime") ?? "";
		expect(new Date(dt).getTime()).toBe(dateObj.getTime());
	});
});
