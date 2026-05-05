import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from ".";

describe("Kbd", () => {
	it("renders a <kbd> element", () => {
		const { container } = render(<Kbd>⌘K</Kbd>);
		expect(container.querySelector("kbd")).not.toBeNull();
	});

	it("root element has className containing 'ds-atom-kbd'", () => {
		const { container } = render(<Kbd>⌘K</Kbd>);
		const kbd = container.querySelector("kbd");
		expect(kbd?.className).toContain("ds-atom-kbd");
	});

	it("renders children text content", () => {
		render(<Kbd>⌘K</Kbd>);
		expect(screen.getByText("⌘K")).toBeInTheDocument();
	});

	it("size='md' (default) inline style contains fontSize 11", () => {
		const { container } = render(<Kbd size="md">⌘K</Kbd>);
		const kbd = container.querySelector("kbd") as HTMLElement;
		expect(kbd.style.fontSize).toBe("11px");
	});

	it("size='sm' inline style contains fontSize 9.5", () => {
		const { container } = render(<Kbd size="sm">⌘K</Kbd>);
		const kbd = container.querySelector("kbd") as HTMLElement;
		expect(kbd.style.fontSize).toBe("9.5px");
	});

	it("forwards ref to the kbd DOM element", () => {
		const ref = createRef<HTMLElement>();
		const { container } = render(<Kbd ref={ref}>⌘K</Kbd>);
		const kbd = container.querySelector("kbd");
		expect(ref.current).toBe(kbd);
	});

	it("spreads rest props — data-testid is present on rendered element", () => {
		render(<Kbd data-testid="my-kbd">⌘K</Kbd>);
		expect(screen.getByTestId("my-kbd")).toBeInTheDocument();
	});

	it("custom className is appended alongside ds-atom-kbd", () => {
		const { container } = render(<Kbd className="custom-class">⌘K</Kbd>);
		const kbd = container.querySelector("kbd");
		expect(kbd?.className).toContain("ds-atom-kbd");
		expect(kbd?.className).toContain("custom-class");
	});
});
