import { render } from "@testing-library/react";
import { Check, X } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Icon, wrap } from "./Icon";

describe("Icon", () => {
	it("renders lucide icon with brand-lock defaults (size 20, stroke 1.5)", () => {
		const { container } = render(<Icon icon={Check} />);
		const svg = container.querySelector("svg")!;
		expect(svg.getAttribute("width")).toBe("20");
		expect(svg.getAttribute("height")).toBe("20");
		expect(svg.getAttribute("stroke-width")).toBe("1.5");
	});

	it("applies aria-hidden=true by default", () => {
		const { container } = render(<Icon icon={Check} />);
		expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
	});

	it("with aria-label, sets role=img and removes aria-hidden", () => {
		const { container } = render(<Icon icon={X} aria-label="Close" />);
		const svg = container.querySelector("svg")!;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.getAttribute("aria-label")).toBe("Close");
		expect(svg.getAttribute("aria-hidden")).toBeNull();
	});

	it("consumer size override wins over default", () => {
		const { container } = render(<Icon icon={Check} size={14} />);
		expect(container.querySelector("svg")!.getAttribute("width")).toBe("14");
	});

	it("wrap() factory produces pre-bound component with brand-lock defaults", () => {
		const Pre = wrap(Check);
		const { container } = render(<Pre size={16} />);
		const svg = container.querySelector("svg")!;
		expect(svg.getAttribute("width")).toBe("16");
		expect(svg.getAttribute("stroke-width")).toBe("1.5"); // brand-lock still applies
	});

	it("renders children when no icon prop provided (escape hatch)", () => {
		const { container } = render(
			<Icon>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: escape-hatch test — Icon wrapper provides accessible span */}
				<svg data-testid="custom">
					<path />
				</svg>
			</Icon>,
		);
		expect(container.querySelector("span.ds-atom-icon")).not.toBeNull();
		expect(container.querySelector("[data-testid='custom']")).not.toBeNull();
	});

	it("children escape hatch applies aria-hidden by default", () => {
		const { container } = render(
			<Icon>
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: escape-hatch test — Icon wrapper provides accessible span */}
				<svg />
			</Icon>,
		);
		const span = container.querySelector("span.ds-atom-icon")!;
		expect(span.getAttribute("aria-hidden")).toBe("true");
	});

	it("children escape hatch with aria-label sets role=img", () => {
		const { container } = render(
			<Icon aria-label="Custom icon">
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: escape-hatch test — Icon wrapper provides aria-label on parent span */}
				<svg />
			</Icon>,
		);
		const span = container.querySelector("span.ds-atom-icon")!;
		expect(span.getAttribute("role")).toBe("img");
		expect(span.getAttribute("aria-label")).toBe("Custom icon");
	});

	it("color defaults to currentColor (renders as stroke attribute)", () => {
		const { container } = render(<Icon icon={Check} />);
		const svg = container.querySelector("svg")!;
		// Lucide maps the color prop to the SVG stroke attribute
		expect(svg.getAttribute("stroke")).toBe("currentColor");
	});
});
