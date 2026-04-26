import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
	it("renders with role=switch and is unchecked by default", () => {
		render(<Toggle label="Notifications" />);
		expect(screen.getByRole("switch")).toBeInTheDocument();
		expect(screen.getByRole("switch")).not.toBeChecked();
	});

	it("calls onChange when clicked", () => {
		const fn = vi.fn();
		render(<Toggle label="X" onChange={fn} />);
		fireEvent.click(screen.getByRole("switch"));
		expect(fn).toHaveBeenCalled();
	});

	it("disabled prevents change", () => {
		render(<Toggle label="X" disabled />);
		expect(screen.getByRole("switch")).toBeDisabled();
	});

	it("controlled checked prop is reflected", () => {
		const { rerender } = render(<Toggle label="X" checked={true} onChange={() => {}} />);
		expect(screen.getByRole("switch")).toBeChecked();
		rerender(<Toggle label="X" checked={false} onChange={() => {}} />);
		expect(screen.getByRole("switch")).not.toBeChecked();
	});

	it("defaultChecked starts checked (uncontrolled)", () => {
		render(<Toggle label="X" defaultChecked />);
		expect(screen.getByRole("switch")).toBeChecked();
	});

	it("forwards ref to native input", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Toggle ref={ref} label="X" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
		expect(ref.current?.type).toBe("checkbox");
	});

	it("renders label text", () => {
		render(<Toggle label="Email notifications" />);
		expect(screen.getByText("Email notifications")).toBeInTheDocument();
	});
});
