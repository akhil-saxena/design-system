import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from ".";
describe("Badge", () => {
	it("renders children", () => {
		const { getByText } = render(<Badge>Upcoming</Badge>);
		expect(getByText("Upcoming")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Badge ref={ref}>x</Badge>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("style prop merges last", () => {
		const { container } = render(<Badge style={{ background: "red" }}>x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.style.background).toContain("red");
	});

	it("renders dot when dot prop is true", () => {
		const { container } = render(
			<Badge tone="upcoming" dot>
				Upcoming
			</Badge>,
		);
		// outer span + inner dot span = 2 spans
		const spans = container.querySelectorAll("span");
		expect(spans.length).toBeGreaterThanOrEqual(2);
	});

	it("renders all tone variants", () => {
		const tones = ["upcoming", "passed", "pending", "done", "count", "neutral"] as const;
		for (const tone of tones) {
			const { unmount } = render(<Badge tone={tone}>{tone}</Badge>);
			unmount();
		}
	});

	it("dotColor override applies to dot background when dot is true", () => {
		const { container } = render(
			<Badge tone="upcoming" dot dotColor="#ff00ff">
				Custom
			</Badge>,
		);
		const dot = container.querySelectorAll("span")[1] as HTMLSpanElement;
		expect(dot.style.background).toContain("rgb(255, 0, 255)");
	});
});

/**
 * F-15-4: `Badge` emitted NO CLASS AT ALL and there was no `badge.css` — one
 * inline style object with a hardcoded 9.5px, on a component that appears on all
 * seven admin screens. "A consumer cannot select, restyle or resize one."
 *
 * The load-bearing assertion here is `has no inline typography`, not
 * `has a class`. Adding `ds-atom-badge` beside the inline object would satisfy a
 * grep and change nothing that matters: an inline style beats a class rule
 * without `!important`, so the size would still be unreachable. 01-16 recorded
 * the same shape one plan ago — `.ds-atom-confirm-panel` was already on both
 * elements and the only edit that painted anything was DELETING
 * `style={panelStyle}`.
 */
describe("Badge is selectable and resizable (F-15-4)", () => {
	it("emits ds-atom-badge", () => {
		const { container } = render(<Badge>x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.className).toContain("ds-atom-badge");
	});

	it("concatenates a consumer className", () => {
		const { container } = render(<Badge className="mine">x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.className).toContain("ds-atom-badge");
		expect(span.className).toContain("mine");
	});

	it("emits data-tone so every tone is reachable from CSS", () => {
		for (const tone of ["info", "success", "warning", "error", "neutral", "count"] as const) {
			const { container, unmount } = render(<Badge tone={tone}>x</Badge>);
			const span = container.querySelector("span") as HTMLSpanElement;
			expect(span.dataset.tone).toBe(tone);
			unmount();
		}
	});

	it("has no inline typography, so a consumer stylesheet can resize it", () => {
		// THE decisive case. `fontSize: 9.5` was a NUMBER in the inline object, so
		// the plan's own `grep -qE '9\.5px'` gate could never see it — it matched
		// only the explanatory comment three lines below. This assertion reads the
		// rendered element instead of the source.
		const { container } = render(<Badge>x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.style.fontSize).toBe("");
		expect(span.style.fontFamily).toBe("");
		expect(span.style.padding).toBe("");
		expect(span.style.borderRadius).toBe("");
		expect(span.style.textTransform).toBe("");
		// The whole point: nothing inline at all unless the consumer asked for it.
		expect(span.getAttribute("style")).toBeNull();
	});

	it("still lets an explicit style prop win, which is the documented escape", () => {
		const { container } = render(<Badge style={{ fontSize: 20 }}>x</Badge>);
		const span = container.querySelector("span") as HTMLSpanElement;
		expect(span.style.fontSize).toBe("20px");
	});

	it("gives the dot a class, and keeps dotColor as the only inline exception", () => {
		// dotColor is a runtime string, so it has nowhere to live but inline. The
		// tone-mapped default does NOT: it moves to CSS with everything else.
		const plain = render(
			<Badge tone="success" dot>
				x
			</Badge>,
		);
		const dot = plain.container.querySelector(".ds-atom-badge-dot") as HTMLSpanElement;
		expect(dot).not.toBeNull();
		expect(dot.getAttribute("style")).toBeNull();

		const overridden = render(
			<Badge tone="success" dot dotColor="#ff00ff">
				x
			</Badge>,
		);
		const od = overridden.container.querySelector(".ds-atom-badge-dot") as HTMLSpanElement;
		expect(od.style.background).toContain("rgb(255, 0, 255)");
	});
});
