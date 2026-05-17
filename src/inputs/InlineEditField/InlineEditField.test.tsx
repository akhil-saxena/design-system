import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineEditField } from ".";

describe("InlineEditField", () => {
	it("renders idle state with value text", () => {
		const { getByText } = render(
			<InlineEditField value="Hello" onSave={() => {}} ariaLabel="Test" />,
		);
		expect(getByText("Hello")).toBeInTheDocument();
	});

	it("renders italic placeholder when value empty", () => {
		const { getByText } = render(
			<InlineEditField value="" placeholder="Empty…" onSave={() => {}} ariaLabel="Test" />,
		);
		const ph = getByText("Empty…");
		expect(ph).toHaveStyle({ fontStyle: "italic" });
	});

	it("click on idle span enters edit state (input appears)", () => {
		const { getByRole, container } = render(
			<InlineEditField value="Hi" onSave={() => {}} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		expect(container.querySelector("input")).toBeInTheDocument();
	});

	it("Enter key in idle enters edit state", () => {
		const { getByRole, container } = render(
			<InlineEditField value="Hi" onSave={() => {}} ariaLabel="Test" />,
		);
		fireEvent.keyDown(getByRole("button"), { key: "Enter" });
		expect(container.querySelector("input")).toBeInTheDocument();
	});

	it("typing + blur calls onSave with new value", async () => {
		const onSave = vi.fn();
		const { getByRole, container } = render(
			<InlineEditField value="old" onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "new" } });
		fireEvent.blur(input);
		expect(onSave).toHaveBeenCalledWith("new");
	});

	it("Enter in single-line edit state calls onSave", () => {
		const onSave = vi.fn();
		const { getByRole, container } = render(
			<InlineEditField value="old" onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "next" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSave).toHaveBeenCalledWith("next");
	});

	it("Esc reverts to original value and does NOT call onSave", () => {
		const onSave = vi.fn();
		const { getByRole, container } = render(
			<InlineEditField value="keep" onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "discard" } });
		fireEvent.keyDown(input, { key: "Escape" });
		expect(onSave).not.toHaveBeenCalled();
	});

	it("⌘Enter in multiline mode commits", () => {
		const onSave = vi.fn();
		const { getByRole, container } = render(
			<InlineEditField value="" multiline onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const ta = container.querySelector("textarea") as HTMLTextAreaElement;
		fireEvent.change(ta, { target: { value: "multi" } });
		fireEvent.keyDown(ta, { key: "Enter", metaKey: true });
		expect(onSave).toHaveBeenCalledWith("multi");
	});

	it("plain Enter in multiline mode does NOT commit (newline insert)", () => {
		const onSave = vi.fn();
		const { getByRole, container } = render(
			<InlineEditField value="" multiline onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const ta = container.querySelector("textarea") as HTMLTextAreaElement;
		fireEvent.change(ta, { target: { value: "x" } });
		fireEvent.keyDown(ta, { key: "Enter" });
		expect(onSave).not.toHaveBeenCalled();
	});

	it("onSave returning a Promise shows saving state (input disabled)", async () => {
		let resolve!: () => void;
		const promise = new Promise<void>((r) => {
			resolve = r;
		});
		const onSave = vi.fn(() => promise);
		const { getByRole, container } = render(
			<InlineEditField value="" onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "go" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(container.querySelector("input")).toBeDisabled();
		resolve();
	});

	it("onSave rejecting shows error state with FieldError", async () => {
		const onSave = vi.fn(() => Promise.reject(new Error("boom")));
		const { getByRole, container, findByText } = render(
			<InlineEditField value="" onSave={onSave} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "go" } });
		fireEvent.keyDown(input, { key: "Enter" });
		expect(await findByText("boom")).toBeInTheDocument();
	});

	it("disabled=true → click does nothing", () => {
		const { getByRole, container } = render(
			<InlineEditField value="x" disabled onSave={() => {}} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		expect(container.querySelector("input")).not.toBeInTheDocument();
	});

	it("font='mono' applies var(--mono) font-family in edit mode", () => {
		const { getByRole, container } = render(
			<InlineEditField value="" font="mono" onSave={() => {}} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const input = container.querySelector("input") as HTMLInputElement;
		expect(input.style.fontFamily).toBe("var(--mono)");
	});

	it("font='serif' applies Newsreader font-family to textarea in multiline mode", () => {
		const { getByRole, container } = render(
			<InlineEditField value="" font="serif" multiline onSave={() => {}} ariaLabel="Test" />,
		);
		fireEvent.click(getByRole("button"));
		const ta = container.querySelector("textarea") as HTMLTextAreaElement;
		expect(ta.style.fontFamily).toContain("Newsreader");
	});
});
