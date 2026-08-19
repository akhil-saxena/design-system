import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineEdit } from ".";
describe("InlineEdit", () => {
	// Test 1: idle state renders display span with the current value text
	it("idle state renders display span with the current value text", () => {
		render(<InlineEdit value="Hello World" onSave={vi.fn()} />);
		expect(screen.getByText("Hello World")).toBeInTheDocument();
		// Should NOT render an input in idle state
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	// Test 2: clicking display span enters editing state (input appears with current value)
	it("clicking display span enters editing state", () => {
		render(<InlineEdit value="Hello World" onSave={vi.fn()} />);
		const span = screen.getByRole("button", { name: /click to edit/i });
		fireEvent.click(span);
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue("Hello World");
	});

	// Test 3: pressing Enter commits and calls onSave with new value
	it("pressing Enter commits and calls onSave with new value", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		render(<InlineEdit value="Hello World" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "Updated Value" } });
		await act(async () => {
			fireEvent.keyDown(input, { key: "Enter" });
		});
		expect(onSave).toHaveBeenCalledWith("Updated Value");
	});

	// Test 4: pressing Escape cancels and restores original value; onSave not called
	it("pressing Escape cancels and restores original value without calling onSave", () => {
		const onSave = vi.fn();
		render(<InlineEdit value="Original" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "Changed" } });
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onSave).not.toHaveBeenCalled();
		expect(screen.getByText("Original")).toBeInTheDocument();
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	// Test 5: while onSave Promise is pending, input is disabled (saving state)
	it("shows saving state (disabled input) while onSave is pending", async () => {
		let resolvePromise!: () => void;
		const onSave = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolvePromise = resolve;
				}),
		);
		render(<InlineEdit value="Hello" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		await act(async () => {
			fireEvent.keyDown(input, { key: "Enter" });
		});
		// While saving, input should be disabled
		expect(screen.getByRole("textbox")).toBeDisabled();
		// Clean up
		await act(async () => {
			resolvePromise();
		});
	});

	// Test 6: when onSave resolves, returns to idle with new value displayed
	it("returns to idle state with new value after onSave resolves", async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		const { rerender } = render(<InlineEdit value="Old Value" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "New Value" } });
		await act(async () => {
			fireEvent.keyDown(input, { key: "Enter" });
		});
		// After save, should be back in idle (no textbox)
		await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
		// Re-render with new value to simulate parent updating
		rerender(<InlineEdit value="New Value" onSave={onSave} />);
		expect(screen.getByText("New Value")).toBeInTheDocument();
	});

	// Test 7: when onSave rejects, error state shows error message; input re-enabled
	it("shows error message when onSave rejects and re-enables input", async () => {
		const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
		render(<InlineEdit value="Hello" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "New" } });
		await act(async () => {
			fireEvent.keyDown(input, { key: "Enter" });
		});
		await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
		// Input should be re-enabled
		expect(screen.getByRole("textbox")).not.toBeDisabled();
	});

	// Test 8: multiline=true renders a textarea instead of input
	it("renders a textarea when multiline=true", () => {
		render(<InlineEdit value="Multiline text" onSave={vi.fn()} multiline />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		expect(screen.queryByRole("textbox")).toBeInTheDocument();
		// Check it's a textarea specifically (not an input)
		const textarea = document.querySelector("textarea");
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveValue("Multiline text");
		// And no single-line input
		expect(document.querySelector("input")).toBeNull();
	});

	// Test 9: disabled=true prevents clicking to edit
	it("disabled=true prevents clicking to edit", () => {
		render(<InlineEdit value="Cannot edit" onSave={vi.fn()} disabled />);
		const span = screen.getByText("Cannot edit").closest("[data-state]");
		if (span) fireEvent.click(span);
		// Still no textbox
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	// Test 10: clicking outside (blur) cancels editing and restores original value
	it("blur cancels editing and restores original value", () => {
		const onSave = vi.fn();
		render(<InlineEdit value="Original" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "Changed" } });
		fireEvent.blur(input);
		expect(onSave).not.toHaveBeenCalled();
		expect(screen.getByText("Original")).toBeInTheDocument();
		expect(screen.queryByRole("textbox")).toBeNull();
	});
});

/**
 * F-15-8 — the accessible name was the hardcoded string "Click to edit", with no
 * prop, so all seven rows on /admin/site announced the same three words. "Click
 * to edit" describes the *interaction*, which role="button" already conveys; a
 * name should describe the *target*. That distinction is the finding.
 *
 * The prop is named `ariaLabel` to match the sibling `InlineEditField`, which
 * already requires one — so the family agrees rather than inventing a second
 * spelling.
 */
describe("InlineEdit accessible name (F-15-8)", () => {
	it("names the idle trigger with ariaLabel", () => {
		render(<InlineEdit value="akhilsaxena.com" onSave={vi.fn()} ariaLabel="Site title" />);
		expect(screen.getByRole("button", { name: "Site title" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /click to edit/i })).toBeNull();
	});

	it("falls back to the old string when ariaLabel is omitted", () => {
		// Seven existing tests in this file select by /click to edit/i, and every
		// existing consumer relies on it. The default is what makes this additive.
		render(<InlineEdit value="akhilsaxena.com" onSave={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Click to edit" })).toBeInTheDocument();
	});

	it("gives distinct names to distinct rows", () => {
		// The measured defect: seven rows, one name. This is the assertion that would
		// have caught it.
		render(
			<>
				<InlineEdit value="a" onSave={vi.fn()} ariaLabel="Site title" />
				<InlineEdit value="b" onSave={vi.fn()} ariaLabel="Tagline" />
			</>,
		);
		const names = screen.getAllByRole("button").map((el) => el.getAttribute("aria-label"));
		expect(new Set(names).size, "two rows announced the same name").toBe(2);
	});

	it("carries the name onto the input in edit mode", () => {
		// The editing input had NO accessible name at all — sharedProps never set one.
		// Adopting the prop fixes both states, which is what InlineEditField does.
		render(<InlineEdit value="a" onSave={vi.fn()} ariaLabel="Site title" />);
		fireEvent.click(screen.getByRole("button", { name: "Site title" }));
		expect(screen.getByRole("textbox", { name: "Site title" })).toBeInTheDocument();
	});

	it("leaves the edit-mode input exactly as it was when ariaLabel is omitted", () => {
		// Deliberately NOT defaulted onto the input: "Click to edit" is a nonsense name
		// for a field you are already editing. Omitting the prop must change nothing.
		render(<InlineEdit value="a" onSave={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: /click to edit/i }));
		expect(screen.getByRole("textbox").hasAttribute("aria-label")).toBe(false);
	});

	it("does not touch the control's geometry (F-15-7 / G-2 is Phase 06.1)", () => {
		// T-11-06 scope guard: the 25px height against the 44px touch floor belongs to
		// another phase. If this plan ever grows a height, this fails.
		const { container } = render(<InlineEdit value="a" onSave={vi.fn()} ariaLabel="Site title" />);
		const span = container.querySelector(".ds-atom-inlineedit") as HTMLElement;
		expect(span.style.height).toBe("");
		expect(span.style.minHeight).toBe("");
	});
});
