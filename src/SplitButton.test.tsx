import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitButton, type SplitButtonAction } from "./SplitButton";

afterEach(() => {
	cleanup();
});

function makeActions() {
	const a0 = vi.fn();
	const a1 = vi.fn();
	const a2 = vi.fn();
	const actions: [SplitButtonAction, SplitButtonAction, SplitButtonAction] = [
		{ label: "Save", onClick: a0 },
		{ label: "Save as draft", onClick: a1 },
		{ label: "Save and close", onClick: a2 },
	];
	return { actions, a0, a1, a2 };
}

describe("SplitButton", () => {
	it("primary face renders actions[0] by default and click fires its onClick", () => {
		const { actions, a0 } = makeActions();
		render(<SplitButton actions={actions} />);

		const primary = screen.getByRole("button", { name: "Save" });
		expect(primary).toHaveAttribute("data-part", "primary");
		fireEvent.click(primary);
		expect(a0).toHaveBeenCalledTimes(1);
	});

	it("chevron click opens popover menu listing all actions", () => {
		const { actions } = makeActions();
		render(<SplitButton actions={actions} />);

		const chevron = screen.getByRole("button", { name: "More actions" });
		expect(chevron).toHaveAttribute("aria-haspopup", "menu");
		expect(chevron).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(chevron);
		expect(chevron).toHaveAttribute("aria-expanded", "true");

		const items = screen.getAllByRole("menuitem");
		expect(items).toHaveLength(3);
		expect(items.map((el) => el.textContent)).toEqual(["Save", "Save as draft", "Save and close"]);
	});

	it("selecting an alternative updates primary face and fires that action's onClick on subsequent primary click", () => {
		const { actions, a0, a1 } = makeActions();
		render(<SplitButton actions={actions} />);

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));

		const items = screen.getAllByRole("menuitem");
		fireEvent.click(items[1]); // pick "Save as draft"
		expect(a1).toHaveBeenCalledTimes(1);

		// Primary face is now "Save as draft"
		const primary = screen.getByRole("button", { name: "Save as draft" });
		expect(primary).toHaveAttribute("data-part", "primary");

		fireEvent.click(primary);
		expect(a1).toHaveBeenCalledTimes(2);
		expect(a0).not.toHaveBeenCalled();
	});

	it("per-action variant renders data-action-variant on the menu item (v0.5.1)", () => {
		const actions: [SplitButtonAction, SplitButtonAction, SplitButtonAction] = [
			{ label: "Save", onClick: () => {}, variant: "primary" },
			{ label: "Save as draft", onClick: () => {}, variant: "secondary" },
			{ label: "Discard", onClick: () => {}, variant: "danger" },
		];
		render(<SplitButton actions={actions} />);
		fireEvent.click(screen.getByRole("button", { name: "More actions" }));
		const items = screen.getAllByRole("menuitem");
		expect(items[0].getAttribute("data-action-variant")).toBe("primary");
		expect(items[1].getAttribute("data-action-variant")).toBe("secondary");
		expect(items[2].getAttribute("data-action-variant")).toBe("danger");
	});

	it("selecting an action with a different variant updates the primary face's data-variant (v0.5.1)", () => {
		const actions: [SplitButtonAction, SplitButtonAction] = [
			{ label: "Save", onClick: () => {}, variant: "primary" },
			{ label: "Discard", onClick: () => {}, variant: "danger" },
		];
		const { container } = render(<SplitButton actions={actions} />);
		const wrapper = container.querySelector(".ds-atom-split") as HTMLElement;
		expect(wrapper.getAttribute("data-variant")).toBe("primary");

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));
		fireEvent.click(screen.getAllByRole("menuitem")[1]); // pick "Discard"
		expect(wrapper.getAttribute("data-variant")).toBe("danger");
		const primary = screen.getByRole("button", { name: "Discard" });
		expect(primary.getAttribute("data-variant")).toBe("danger");
	});

	it("re-mount resets currentIdx to 0 (in-instance state only — D-530)", () => {
		const { actions } = makeActions();
		const { unmount } = render(<SplitButton actions={actions} />);

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));
		const items = screen.getAllByRole("menuitem");
		fireEvent.click(items[2]); // pick "Save and close"

		expect(screen.getByRole("button", { name: "Save and close" })).toHaveAttribute(
			"data-part",
			"primary",
		);

		unmount();

		render(<SplitButton actions={actions} />);
		// Fresh instance — primary face must be actions[0]
		expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("data-part", "primary");
		expect(screen.queryByRole("button", { name: "Save and close" })).toBeNull();
	});
});
