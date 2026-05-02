import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Coachmark } from ".";
afterEach(() => {
	cleanup();
	localStorage.clear();
});

beforeEach(() => {
	localStorage.clear();
});

// Minimal anchor ref for Popover
function makeAnchorRef() {
	const el = document.createElement("div");
	document.body.appendChild(el);
	return { current: el };
}

describe("Coachmark", () => {
	it("renders hint bubble (title + desc text) when not dismissed", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Welcome!" desc="This is a helpful hint." />);
		expect(screen.getByText("Welcome!")).toBeTruthy();
		expect(screen.getByText("This is a helpful hint.")).toBeTruthy();
	});

	it("clicking dismiss button sets dismissed state (hides content)", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Welcome!" desc="This is a helpful hint." />);
		const dismissBtn = screen.getByLabelText("Dismiss");
		fireEvent.click(dismissBtn);
		expect(screen.queryByText("Welcome!")).toBeNull();
	});

	it("after dismiss, Coachmark renders null", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Welcome!" />);
		const dismissBtn = screen.getByLabelText("Dismiss");
		fireEvent.click(dismissBtn);
		// The Popover returns null when open=false, so there should be no coachmark content
		expect(screen.queryByText("Welcome!")).toBeNull();
	});

	it("storageKey provided — dismiss writes 'dismissed' to localStorage", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Welcome!" storageKey="coachmark-tour-1" />);
		const dismissBtn = screen.getByLabelText("Dismiss");
		fireEvent.click(dismissBtn);
		expect(localStorage.getItem("coachmark-tour-1")).toBe("dismissed");
	});

	it("on mount, reads localStorage[storageKey]='dismissed' → renders null immediately", () => {
		localStorage.setItem("coachmark-already", "dismissed");
		const anchorRef = makeAnchorRef();
		render(
			<Coachmark anchorRef={anchorRef} title="Should not show" storageKey="coachmark-already" />,
		);
		expect(screen.queryByText("Should not show")).toBeNull();
	});

	it("storageKey not provided — dismiss does not write to localStorage", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Welcome!" />);
		const dismissBtn = screen.getByLabelText("Dismiss");
		fireEvent.click(dismissBtn);
		// No key should be written
		expect(localStorage.length).toBe(0);
	});

	it("onNext called when Next button clicked (step < total)", () => {
		const onNext = vi.fn();
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Step 1" step={1} total={3} onNext={onNext} />);
		fireEvent.click(screen.getByText("Next"));
		expect(onNext).toHaveBeenCalledOnce();
	});

	it("onDone called when Done button clicked (last step)", () => {
		const onDone = vi.fn();
		const anchorRef = makeAnchorRef();
		render(
			<Coachmark anchorRef={anchorRef} title="Last Step" step={3} total={3} onDone={onDone} />,
		);
		fireEvent.click(screen.getByText("Done"));
		expect(onDone).toHaveBeenCalledOnce();
	});

	it("step/total renders dot progress indicators", () => {
		const anchorRef = makeAnchorRef();
		render(<Coachmark anchorRef={anchorRef} title="Step title" step={2} total={4} />);
		const dots = document.querySelectorAll(".ds-atom-coachmark-dot");
		expect(dots.length).toBe(4);
		// second dot (index 1) is active
		expect((dots[1] as HTMLElement | undefined)?.dataset.active).toBe("true");
		// others are inactive
		expect((dots[0] as HTMLElement | undefined)?.dataset.active).toBe("false");
		expect((dots[2] as HTMLElement | undefined)?.dataset.active).toBe("false");
	});
});
