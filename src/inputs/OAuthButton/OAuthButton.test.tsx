import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { OAuthButton, type OAuthProvider } from ".";

describe("OAuthButton", () => {
	it("renders the default label for each provider", () => {
		const cases: Array<[OAuthProvider, string]> = [
			["google", "Continue with Google"],
			["github", "Continue with GitHub"],
			["apple", "Continue with Apple"],
		];
		for (const [provider, label] of cases) {
			const { getByText, unmount } = render(<OAuthButton provider={provider} />);
			expect(getByText(label)).toBeInTheDocument();
			unmount();
		}
	});

	it("renders an override label when provided", () => {
		const { getByText } = render(<OAuthButton provider="google" label="Sign in with Google" />);
		expect(getByText("Sign in with Google")).toBeInTheDocument();
	});

	it("emits data-provider", () => {
		const { container } = render(<OAuthButton provider="github" />);
		const btn = container.querySelector("button") as HTMLButtonElement;
		expect(btn.dataset.provider).toBe("github");
	});

	it("emits data-dark only when dark=true", () => {
		const { container, rerender } = render(<OAuthButton provider="google" />);
		const btnLight = container.querySelector("button") as HTMLButtonElement;
		expect(btnLight.dataset.dark).toBeUndefined();
		rerender(<OAuthButton provider="google" dark />);
		const btnDark = container.querySelector("button") as HTMLButtonElement;
		expect(btnDark.dataset.dark).toBe("true");
	});

	it("defaults to type=button", () => {
		const { container } = render(<OAuthButton />);
		const btn = container.querySelector("button") as HTMLButtonElement;
		expect(btn.type).toBe("button");
	});

	it("honors explicit type prop (e.g. submit)", () => {
		const { container } = render(<OAuthButton type="submit" />);
		const btn = container.querySelector("button") as HTMLButtonElement;
		expect(btn.type).toBe("submit");
	});

	it("fires onClick", () => {
		const onClick = vi.fn();
		const { getByRole } = render(<OAuthButton onClick={onClick} />);
		fireEvent.click(getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("does not fire onClick when disabled", () => {
		const onClick = vi.fn();
		const { getByRole } = render(<OAuthButton onClick={onClick} disabled />);
		fireEvent.click(getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<OAuthButton ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("renders inline SVG logo", () => {
		const { container } = render(<OAuthButton provider="apple" />);
		expect(container.querySelector("svg")).not.toBeNull();
	});
});
