import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineAddRow } from "./index";

describe("InlineAddRow", () => {
	it("renders the dashed trigger with the placeholder", () => {
		render(<InlineAddRow placeholder="Add a question…" onSave={() => {}} />);
		expect(screen.getByRole("button", { name: "Add a question…" })).toBeTruthy();
	});

	it("expands to an input on click and saves the trimmed value on Enter", () => {
		const onSave = vi.fn();
		render(<InlineAddRow placeholder="Add…" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button"));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "  hello  " } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSave).toHaveBeenCalledWith("hello");
	});

	it("discards on Escape without saving and returns to the trigger", () => {
		const onSave = vi.fn();
		render(<InlineAddRow placeholder="Add…" onSave={onSave} />);
		fireEvent.click(screen.getByRole("button"));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "draft" } });
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onSave).not.toHaveBeenCalled();
		expect(screen.getByRole("button")).toBeTruthy();
	});

	it("does not save empty / whitespace-only input", () => {
		const onSave = vi.fn();
		render(<InlineAddRow onSave={onSave} />);
		fireEvent.click(screen.getByRole("button"));
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSave).not.toHaveBeenCalled();
	});
});
