import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	it("renders children", () => {
		const { getByRole } = render(<Button>Save</Button>);
		expect(getByRole("button")).toHaveTextContent("Save");
	});

	it("calls onClick when clicked", () => {
		const onClick = vi.fn();
		const { getByRole } = render(<Button onClick={onClick}>Save</Button>);
		fireEvent.click(getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("disabled state suppresses onClick", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<Button onClick={onClick} disabled>
				Save
			</Button>,
		);
		fireEvent.click(getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
		expect(getByRole("button")).toBeDisabled();
	});

	it("loading state renders spinner and disables button", () => {
		const onClick = vi.fn();
		const { getByRole, container } = render(
			<Button onClick={onClick} loading>
				Save
			</Button>,
		);
		expect(getByRole("button")).toBeDisabled();
		expect(container.querySelector(".ds-atom-btn-spinner")).toBeInTheDocument();
		fireEvent.click(getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Save</Button>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("style prop merges last (consumer overrides internal styles)", () => {
		const { getByRole } = render(<Button style={{ background: "red" }}>Save</Button>);
		const button = getByRole("button");
		expect(button.style.background).toContain("red");
	});

	it("renders icon before children", () => {
		const { getByRole, getByTestId } = render(
			<Button icon={<span data-testid="icon">★</span>}>Save</Button>,
		);
		const button = getByRole("button");
		expect(button).toContainElement(getByTestId("icon"));
		// Icon should appear before the text "Save" in the DOM.
		const iconIndex = button.textContent?.indexOf("★") ?? -1;
		const textIndex = button.textContent?.indexOf("Save") ?? -1;
		expect(iconIndex).toBeLessThan(textIndex);
	});

	it("renders all variant + size combinations without crashing", () => {
		const variants = ["primary", "amber", "secondary", "ghost", "danger"] as const;
		const sizes = ["xs", "sm", "md", "lg"] as const;
		for (const variant of variants) {
			for (const size of sizes) {
				const { unmount } = render(
					<Button variant={variant} size={size}>
						{variant}-{size}
					</Button>,
				);
				unmount();
			}
		}
	});

	it("data-variant attribute reflects the variant prop", () => {
		const { getByRole } = render(<Button variant="amber">Click</Button>);
		expect(getByRole("button")).toHaveAttribute("data-variant", "amber");
	});
});
