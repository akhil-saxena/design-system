import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from ".";

function makeFile(name: string, type: string, sizeBytes = 1024): File {
	const f = new File(["a".repeat(sizeBytes)], name, { type });
	// jsdom sometimes ignores the size — overwrite explicitly.
	Object.defineProperty(f, "size", { value: sizeBytes });
	return f;
}

describe("FileInput", () => {
	it("renders dropzone variant with default content", () => {
		const { getByText } = render(<FileInput onSelect={() => {}} />);
		expect(getByText("Drop a file here, or click to upload")).toBeInTheDocument();
	});

	it("click on trigger calls inputRef.current.click()", () => {
		const { container } = render(<FileInput onSelect={() => {}} />);
		const hidden = container.querySelector("input[type='file']") as HTMLInputElement;
		const spy = vi.spyOn(hidden, "click");
		const trigger = container.querySelector("button") as HTMLButtonElement;
		fireEvent.click(trigger);
		expect(spy).toHaveBeenCalled();
	});

	it("dragOver state applied on onDragOver event", () => {
		const { container } = render(<FileInput onSelect={() => {}} />);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		fireEvent.dragOver(trigger);
		expect(trigger.className).toContain("ds-atom-fileinput--dragover");
	});

	it("dragOver state removed on onDragLeave", () => {
		const { container } = render(<FileInput onSelect={() => {}} />);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		fireEvent.dragOver(trigger);
		fireEvent.dragLeave(trigger);
		expect(trigger.className).not.toContain("ds-atom-fileinput--dragover");
	});

	it("drop event calls onSelect with File array", () => {
		const onSelect = vi.fn();
		const { container } = render(<FileInput onSelect={onSelect} />);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		const file = makeFile("a.pdf", "application/pdf");
		fireEvent.drop(trigger, { dataTransfer: { files: [file] } });
		expect(onSelect).toHaveBeenCalledWith([file]);
	});

	it("MIME mismatch calls onError with reason string", () => {
		const onError = vi.fn();
		const onSelect = vi.fn();
		const { container } = render(
			<FileInput onSelect={onSelect} onError={onError} accept="application/pdf" />,
		);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		const file = makeFile("a.png", "image/png");
		fireEvent.drop(trigger, { dataTransfer: { files: [file] } });
		expect(onError).toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("size overrun calls onError with reason string", () => {
		const onError = vi.fn();
		const onSelect = vi.fn();
		const { container } = render(
			<FileInput onSelect={onSelect} onError={onError} maxSizeBytes={1024} />,
		);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		const file = makeFile("a.pdf", "application/pdf", 2048);
		fireEvent.drop(trigger, { dataTransfer: { files: [file] } });
		expect(onError).toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("disabled=true → click does nothing", () => {
		const { container } = render(<FileInput onSelect={() => {}} disabled />);
		const hidden = container.querySelector("input[type='file']") as HTMLInputElement;
		const spy = vi.spyOn(hidden, "click");
		const trigger = container.querySelector("button") as HTMLButtonElement;
		fireEvent.click(trigger);
		expect(spy).not.toHaveBeenCalled();
	});

	it("multiple=false delivers only the first file when multiple dropped", () => {
		const onSelect = vi.fn();
		const { container } = render(<FileInput onSelect={onSelect} multiple={false} />);
		const trigger = container.querySelector("button") as HTMLButtonElement;
		const f1 = makeFile("a.pdf", "application/pdf");
		const f2 = makeFile("b.pdf", "application/pdf");
		fireEvent.drop(trigger, { dataTransfer: { files: [f1, f2] } });
		expect(onSelect).toHaveBeenCalledWith([f1]);
	});

	it("button variant renders (smoke test)", () => {
		const { container, getByRole } = render(
			<FileInput onSelect={() => {}} variant="button" ariaLabel="Pick" />,
		);
		expect(getByRole("button")).toBeInTheDocument();
		// No drop zone class on the button variant's outer wrapper:
		expect(container.querySelector(".ds-atom-fileinput")).toBeNull();
		expect(container.querySelector(".ds-atom-fileinput-button")).toBeInTheDocument();
	});
});

describe("FileInput — re-selecting the same file", () => {
	/**
	 * Seed a file input with a value that the component is expected to clear.
	 *
	 * jsdom does not implement the browser rule this behaviour exists for — that
	 * a file input fires `change` only when its value actually differs — and it
	 * reports `value` as `""` regardless. So the browser bug (pick a file, remove
	 * it, pick the same file again → nothing happens) cannot be reproduced here
	 * directly. What we *can* pin is the mechanism that prevents it: the change
	 * handler must write `""` back to the element. We install a real accessor to
	 * observe that write, since without one the assertion passes vacuously.
	 */
	function pick(input: HTMLInputElement, file: File) {
		let value = "C:\\fakepath\\report.pdf";
		Object.defineProperty(input, "value", {
			configurable: true,
			get: () => value,
			set: (v: string) => {
				value = v;
			},
		});
		Object.defineProperty(input, "files", { value: [file], configurable: true });
		fireEvent.change(input);
		return () => value;
	}

	it("clears its value after a pick, so the same file can be chosen twice", () => {
		const onSelect = vi.fn();
		const { container } = render(<FileInput onSelect={onSelect} />);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const readValue = pick(input, makeFile("report.pdf", "application/pdf"));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(readValue()).toBe("");
	});

	it("clears its value after a rejected file so the retry is not swallowed", () => {
		// The rejection path is the one most likely to be missed: validation
		// returns early, and if the value survives, the user's obvious next move —
		// retrying the same file — does nothing at all.
		const onError = vi.fn();
		const onSelect = vi.fn();
		const { container } = render(
			<FileInput onSelect={onSelect} onError={onError} maxSizeBytes={1} />,
		);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const readValue = pick(input, makeFile("big.pdf", "application/pdf", 4096));

		expect(onError).toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		expect(readValue()).toBe("");
	});

	it("exposes the underlying input via ref", () => {
		const ref = createRef<HTMLInputElement>();
		render(<FileInput onSelect={() => {}} ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
		expect(ref.current?.type).toBe("file");
	});
});
