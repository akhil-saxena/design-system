import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DSPortal } from "./DSPortal";

describe("DSPortal", () => {
	it("portals children into document.body by default", () => {
		const { container } = render(
			<DSPortal>
				<div data-testid="portaled">hello</div>
			</DSPortal>,
		);
		// Children are NOT inside the wrapper container...
		expect(container.querySelector('[data-testid="portaled"]')).toBeNull();
		// ...they ARE inside document.body.
		expect(document.body.querySelector('[data-testid="portaled"]')).not.toBeNull();
	});

	it("honors a custom target element", () => {
		const customTarget = document.createElement("div");
		customTarget.setAttribute("id", "custom-portal-target");
		document.body.appendChild(customTarget);

		render(
			<DSPortal target={customTarget}>
				<div data-testid="custom-portaled" />
			</DSPortal>,
		);

		expect(customTarget.querySelector('[data-testid="custom-portaled"]')).not.toBeNull();

		document.body.removeChild(customTarget);
	});

	it("unmounts cleanly (children removed from body)", () => {
		const { unmount } = render(
			<DSPortal>
				<div data-testid="ephemeral" />
			</DSPortal>,
		);
		expect(document.body.querySelector('[data-testid="ephemeral"]')).not.toBeNull();
		unmount();
		expect(document.body.querySelector('[data-testid="ephemeral"]')).toBeNull();
	});
});
