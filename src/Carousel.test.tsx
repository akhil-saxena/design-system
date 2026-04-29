import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Carousel } from "./Carousel";
import type { CarouselSlide } from "./Carousel";

// ─── Shared test fixtures ─────────────────────────────────────────────────────

const makeSlides = (n = 3): CarouselSlide[] =>
	Array.from({ length: n }, (_, i) => ({
		id: `slide-${i + 1}`,
		content: <div data-testid={`slide-content-${i + 1}`}>Slide {i + 1}</div>,
	}));

// Helper to mock matchMedia so prefers-reduced-motion: reduce returns given value
function mockReducedMotion(matches: boolean) {
	Object.defineProperty(globalThis, "matchMedia", {
		writable: true,
		value: (query: string): MediaQueryList => ({
			matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	});
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Carousel", () => {
	// ─── Structural / ARIA ────────────────────────────────────────────────────

	it("renders a <section> with aria-roledescription='carousel'", () => {
		render(<Carousel slides={makeSlides()} ariaLabel="Demo carousel" />);
		const section = screen.getByRole("region", { name: "Demo carousel" });
		expect(section.tagName).toBe("SECTION");
		expect(section).toHaveAttribute("aria-roledescription", "carousel");
	});

	it("renders N slides each with role=group, aria-roledescription=slide, and aria-label 'i of N'", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const groups = screen.getAllByRole("group");
		expect(groups).toHaveLength(3);
		expect(groups[0]).toHaveAttribute("aria-roledescription", "slide");
		expect(groups[0]).toHaveAttribute("aria-label", "1 of 3");
		expect(groups[1]).toHaveAttribute("aria-label", "2 of 3");
		expect(groups[2]).toHaveAttribute("aria-label", "3 of 3");
	});

	it("renders slide content inside each slide group", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		expect(screen.getByTestId("slide-content-1")).toBeTruthy();
		expect(screen.getByTestId("slide-content-2")).toBeTruthy();
		expect(screen.getByTestId("slide-content-3")).toBeTruthy();
	});

	it("renders Previous slide and Next slide buttons when showArrows=true (default)", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		expect(screen.getByRole("button", { name: "Previous slide" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Next slide" })).toBeTruthy();
	});

	it("does not render arrow buttons when showArrows=false", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" showArrows={false} />);
		expect(screen.queryByRole("button", { name: "Previous slide" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull();
	});

	it("renders dot navigation when showDots=true (default)", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const tablist = screen.getByRole("tablist");
		expect(tablist).toBeTruthy();
		const dots = screen.getAllByRole("tab");
		expect(dots).toHaveLength(3);
	});

	it("does not render dot tablist when showDots=false", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" showDots={false} />);
		expect(screen.queryByRole("tablist")).toBeNull();
	});

	// ─── Arrow navigation ─────────────────────────────────────────────────────

	it("Previous slide button is disabled at the first slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const prev = screen.getByRole("button", { name: "Previous slide" });
		expect(prev).toBeDisabled();
	});

	it("Next slide button is disabled at the last slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" defaultIndex={2} />);
		const next = screen.getByRole("button", { name: "Next slide" });
		expect(next).toBeDisabled();
	});

	it("clicking Next advances to the next slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const next = screen.getByRole("button", { name: "Next slide" });
		fireEvent.click(next);
		// Prev should now be enabled (no longer at slide 0)
		const prev = screen.getByRole("button", { name: "Previous slide" });
		expect(prev).not.toBeDisabled();
	});

	it("clicking Prev decrements to the previous slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" defaultIndex={2} />);
		const prev = screen.getByRole("button", { name: "Previous slide" });
		fireEvent.click(prev);
		// Next should now be enabled (no longer at last slide)
		const next = screen.getByRole("button", { name: "Next slide" });
		expect(next).not.toBeDisabled();
	});

	// ─── Dot navigation ───────────────────────────────────────────────────────

	it("first dot is aria-selected=true initially", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const dots = screen.getAllByRole("tab");
		expect(dots[0]).toHaveAttribute("aria-selected", "true");
		expect(dots[1]).toHaveAttribute("aria-selected", "false");
		expect(dots[2]).toHaveAttribute("aria-selected", "false");
	});

	it("clicking a dot jumps to that slide index", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const dots = screen.getAllByRole("tab");
		fireEvent.click(dots[2]);
		// dot[2] should now be selected
		expect(dots[2]).toHaveAttribute("aria-selected", "true");
		expect(dots[0]).toHaveAttribute("aria-selected", "false");
		// Last dot selected => Next should now be disabled
		const next = screen.getByRole("button", { name: "Next slide" });
		expect(next).toBeDisabled();
	});

	// ─── Keyboard navigation ──────────────────────────────────────────────────

	it("ArrowRight key on the section advances to the next slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const section = screen.getByRole("region", { name: "Demo" });
		fireEvent.keyDown(section, { key: "ArrowRight" });
		const prev = screen.getByRole("button", { name: "Previous slide" });
		expect(prev).not.toBeDisabled();
	});

	it("ArrowLeft key on the section retreats to the previous slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" defaultIndex={2} />);
		const section = screen.getByRole("region", { name: "Demo" });
		fireEvent.keyDown(section, { key: "ArrowLeft" });
		const next = screen.getByRole("button", { name: "Next slide" });
		expect(next).not.toBeDisabled();
	});

	// ─── Controlled mode ──────────────────────────────────────────────────────

	it("controlled mode: index prop overrides internal state", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" index={2} />);
		const dots = screen.getAllByRole("tab");
		expect(dots[2]).toHaveAttribute("aria-selected", "true");
		expect(dots[0]).toHaveAttribute("aria-selected", "false");
	});

	it("controlled mode: onIndexChange fires with new index on Next click", () => {
		const onIndexChange = vi.fn();
		render(
			<Carousel slides={makeSlides(3)} ariaLabel="Demo" index={0} onIndexChange={onIndexChange} />,
		);
		const next = screen.getByRole("button", { name: "Next slide" });
		fireEvent.click(next);
		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	// ─── Autoplay ─────────────────────────────────────────────────────────────

	describe("autoplay", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			mockReducedMotion(false);
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it("advances to the next slide after autoPlayInterval ms", () => {
			render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" autoPlayInterval={2000} />);
			const dots = screen.getAllByRole("tab");
			expect(dots[0]).toHaveAttribute("aria-selected", "true");
			act(() => {
				vi.advanceTimersByTime(2000);
			});
			expect(dots[1]).toHaveAttribute("aria-selected", "true");
		});

		it("wraps to first slide when autoplay reaches the last slide", () => {
			render(
				<Carousel
					slides={makeSlides(3)}
					ariaLabel="Demo"
					autoPlayInterval={2000}
					defaultIndex={2}
				/>,
			);
			const dots = screen.getAllByRole("tab");
			expect(dots[2]).toHaveAttribute("aria-selected", "true");
			act(() => {
				vi.advanceTimersByTime(2000);
			});
			expect(dots[0]).toHaveAttribute("aria-selected", "true");
		});

		it("does NOT start autoplay when reducedMotion=true", () => {
			mockReducedMotion(true);
			render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" autoPlayInterval={2000} />);
			const dots = screen.getAllByRole("tab");
			act(() => {
				vi.advanceTimersByTime(5000);
			});
			// Should still be on first slide
			expect(dots[0]).toHaveAttribute("aria-selected", "true");
		});

		it("pauses autoplay on mouseenter and resumes on mouseleave", () => {
			render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" autoPlayInterval={2000} />);
			const section = screen.getByRole("region", { name: "Demo" });
			const dots = screen.getAllByRole("tab");

			// Hover — pauses autoplay
			fireEvent.mouseEnter(section);
			act(() => {
				vi.advanceTimersByTime(4000);
			});
			// Still on slide 0
			expect(dots[0]).toHaveAttribute("aria-selected", "true");

			// Leave — resumes
			fireEvent.mouseLeave(section);
			act(() => {
				vi.advanceTimersByTime(2000);
			});
			expect(dots[1]).toHaveAttribute("aria-selected", "true");
		});
	});

	// ─── Touch swipe ──────────────────────────────────────────────────────────

	it("touch swipe left (delta < -40) advances to next slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const viewport = document.querySelector(".ds-atom-carousel-viewport")!;

		fireEvent.pointerDown(viewport, {
			pointerType: "touch",
			clientX: 200,
			pointerId: 1,
		});
		fireEvent.pointerUp(viewport, {
			pointerType: "touch",
			clientX: 140, // delta = -60 → next
			pointerId: 1,
		});

		const prev = screen.getByRole("button", { name: "Previous slide" });
		expect(prev).not.toBeDisabled();
	});

	it("touch swipe right (delta > 40) retreats to previous slide", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" defaultIndex={2} />);
		const viewport = document.querySelector(".ds-atom-carousel-viewport")!;

		fireEvent.pointerDown(viewport, {
			pointerType: "touch",
			clientX: 100,
			pointerId: 1,
		});
		fireEvent.pointerUp(viewport, {
			pointerType: "touch",
			clientX: 160, // delta = +60 → prev
			pointerId: 1,
		});

		const next = screen.getByRole("button", { name: "Next slide" });
		expect(next).not.toBeDisabled();
	});

	it("mouse pointer events (non-touch) do NOT trigger swipe", () => {
		render(<Carousel slides={makeSlides(3)} ariaLabel="Demo" />);
		const viewport = document.querySelector(".ds-atom-carousel-viewport")!;

		fireEvent.pointerDown(viewport, {
			pointerType: "mouse",
			clientX: 200,
			pointerId: 1,
		});
		fireEvent.pointerUp(viewport, {
			pointerType: "mouse",
			clientX: 100, // delta = -100 but mouse → no swipe
			pointerId: 1,
		});

		// Should still be on slide 0 (Prev still disabled)
		const prev = screen.getByRole("button", { name: "Previous slide" });
		expect(prev).toBeDisabled();
	});

	// ─── Custom ariaLabel on slides ───────────────────────────────────────────

	it("uses custom slide.ariaLabel when provided", () => {
		const slides: CarouselSlide[] = [
			{ id: 1, content: <div>A</div>, ariaLabel: "Brevo HQ photo" },
			{ id: 2, content: <div>B</div> },
		];
		render(<Carousel slides={slides} ariaLabel="Photos" />);
		const groups = screen.getAllByRole("group");
		expect(groups[0]).toHaveAttribute("aria-label", "Brevo HQ photo");
		expect(groups[1]).toHaveAttribute("aria-label", "2 of 2");
	});

	// ─── CSS class ───────────────────────────────────────────────────────────

	it("root section has ds-atom-carousel class", () => {
		const { container } = render(<Carousel slides={makeSlides(2)} ariaLabel="Demo" />);
		expect(container.firstChild).toHaveClass("ds-atom-carousel");
	});

	it("passes through className and style props", () => {
		const { container } = render(
			<Carousel slides={makeSlides(2)} ariaLabel="Demo" className="extra" style={{ width: 400 }} />,
		);
		const section = container.firstChild as HTMLElement;
		expect(section).toHaveClass("extra");
		expect(section.style.width).toBe("400px");
	});
});
