import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	CalendarEvent,
	Celebrate,
	Chart,
	Cloud,
	ConnectionLost,
	Documents,
	EmptyBox,
	GraphUp,
	Idea,
	IllustrationError,
	IllustrationSearch,
	IllustrationSuccess,
	Inbox,
	Lightbulb,
	Lock,
	MailSent,
	PhoneScreen,
	Plant,
	Puzzle,
	Rocket,
	Team,
	Thinking,
	Travel,
	Workflow,
} from "./index";

const ALL_ILLUSTRATIONS = [
	MailSent,
	Documents,
	Rocket,
	Celebrate,
	Lightbulb,
	Idea,
	IllustrationSearch,
	Plant,
	Cloud,
	EmptyBox,
	ConnectionLost,
	IllustrationError,
	Inbox,
	GraphUp,
	Chart,
	CalendarEvent,
	Team,
	Thinking,
	Lock,
	Puzzle,
	Workflow,
	Travel,
	IllustrationSuccess,
	PhoneScreen,
];

describe("Illustrations", () => {
	it("exports exactly 24 named components", () => {
		expect(ALL_ILLUSTRATIONS).toHaveLength(24);
	});

	for (const Illust of ALL_ILLUSTRATIONS) {
		it(`${Illust.name} renders an SVG with correct viewBox`, () => {
			const { container } = render(<Illust />);
			const svg = container.querySelector("svg");
			expect(svg).toBeTruthy();
			expect(svg?.getAttribute("viewBox")).toBe("0 0 120 90");
			expect(svg?.getAttribute("aria-hidden")).toBe("true");
		});

		it(`${Illust.name} respects width + height props`, () => {
			const { container } = render(<Illust width={80} height={60} />);
			const svg = container.querySelector("svg");
			expect(svg?.getAttribute("width")).toBe("80");
			expect(svg?.getAttribute("height")).toBe("60");
		});
	}
});
