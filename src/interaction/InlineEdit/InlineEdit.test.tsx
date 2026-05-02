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
