import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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

/**
 * F-15-1: the `mounted` gate below `useEffect` means the default path renders
 * NOTHING on the server — measured at 0 B for Modal, ConfirmDialog,
 * TypeToConfirm and Sheet. `inline` is the opt-in escape, so these assert both
 * directions: the escape produces bytes, and the default still produces none.
 */
describe("DSPortal — inline escape (F-15-1)", () => {
	it("inline renders children in place rather than in document.body", () => {
		const { container } = render(
			<DSPortal inline>
				<div data-testid="in-place">hello</div>
			</DSPortal>,
		);
		expect(container.querySelector('[data-testid="in-place"]')).not.toBeNull();
		// Non-vacuity: it is not in BOTH places. A portal that also left a copy
		// behind would satisfy the assertion above.
		expect(document.body.querySelectorAll('[data-testid="in-place"]')).toHaveLength(1);
	});

	it("inline server-renders to bytes where the default server-renders to nothing", () => {
		const child = <div data-testid="ssr">server text</div>;
		const withInline = renderToStaticMarkup(<DSPortal inline>{child}</DSPortal>);
		const withoutInline = renderToStaticMarkup(<DSPortal>{child}</DSPortal>);
		expect(withoutInline.length).toBe(0);
		expect(withInline.length).toBeGreaterThan(0);
		expect(withInline).toContain("server text");
	});

	it("inline={false} is byte-identical to omitting the prop, on the server and the client", () => {
		// The degenerate value must NOT be a third behaviour. 01-15 measured a
		// library where the "empty" configuration threw instead of no-opping.
		const child = <div data-testid="degenerate" />;
		expect(renderToStaticMarkup(<DSPortal inline={false}>{child}</DSPortal>)).toBe(
			renderToStaticMarkup(<DSPortal>{child}</DSPortal>),
		);
		const { container } = render(<DSPortal inline={false}>{child}</DSPortal>);
		expect(container.querySelector('[data-testid="degenerate"]')).toBeNull();
		expect(document.body.querySelector('[data-testid="degenerate"]')).not.toBeNull();
	});

	it("inline takes precedence over target — there is no portal to aim", () => {
		const customTarget = document.createElement("div");
		document.body.appendChild(customTarget);
		const { container } = render(
			<DSPortal inline target={customTarget}>
				<div data-testid="inline-with-target" />
			</DSPortal>,
		);
		expect(container.querySelector('[data-testid="inline-with-target"]')).not.toBeNull();
		expect(customTarget.querySelector('[data-testid="inline-with-target"]')).toBeNull();
		document.body.removeChild(customTarget);
	});

	it("documents the ancestor-coupling tradeoff the escape reintroduces (D-310)", () => {
		// The prop exists for server-rendered and no-JS reachability, and it gives
		// up exactly what document.body was chosen to avoid. A consumer who cannot
		// read that from the source will reach for it as a general-purpose option.
		const src = readFileSync(join(__dirname, "DSPortal.tsx"), "utf8");
		const doc = src.slice(0, src.indexOf("export function DSPortal"));
		expect(doc).toMatch(/overflow/i);
		expect(doc).toMatch(/transform/i);
		expect(doc).toMatch(/z-index/i);
		expect(doc).toMatch(/server-render|no-JS/i);
	});
});
