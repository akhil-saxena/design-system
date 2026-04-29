import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./Accordion";

describe("Accordion", () => {
	// ─── Structural / ARIA ─────────────────────────────────────────────────────

	it("renders trigger as a button with aria-expanded=false initially", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		expect(btn).toHaveAttribute("aria-expanded", "false");
	});

	it("renders panel as div with role=region hidden initially", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const panel = screen.getByRole("region", { hidden: true });
		expect(panel).toHaveAttribute("hidden");
	});

	it("panel aria-labelledby matches button id", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		const panelId = btn.getAttribute("aria-controls");
		const panelEl = panelId ? document.getElementById(panelId) : null;
		expect(panelEl?.getAttribute("aria-labelledby")).toBe(btn.id);
	});

	it("renders heading at default level h3", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const heading = document.querySelector("h3.ds-atom-accordion-heading");
		expect(heading).not.toBeNull();
	});

	it("renders heading at custom headingLevel", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A" headingLevel={2}>
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const heading = document.querySelector("h2.ds-atom-accordion-heading");
		expect(heading).not.toBeNull();
	});

	// ─── Toggle: click toggles aria-expanded and hidden ───────────────────────

	it("clicking trigger toggles aria-expanded and reveals panel", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		expect(btn).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(btn);
		expect(btn).toHaveAttribute("aria-expanded", "true");
		const panelId = btn.getAttribute("aria-controls");
		const panel = panelId ? document.getElementById(panelId) : null;
		expect(panel).not.toHaveAttribute("hidden");

		fireEvent.click(btn);
		expect(btn).toHaveAttribute("aria-expanded", "false");
		expect(panel).toHaveAttribute("hidden");
	});

	// ─── Single mode: opening one closes others ────────────────────────────────

	it("single mode: opening item B closes item A", () => {
		render(
			<Accordion mode="single">
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
				<Accordion.Item id="b" title="Item B">
					Content B
				</Accordion.Item>
			</Accordion>,
		);
		const btnA = screen.getByRole("button", { name: /Item A/i });
		const btnB = screen.getByRole("button", { name: /Item B/i });

		fireEvent.click(btnA);
		expect(btnA).toHaveAttribute("aria-expanded", "true");
		expect(btnB).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(btnB);
		expect(btnA).toHaveAttribute("aria-expanded", "false");
		expect(btnB).toHaveAttribute("aria-expanded", "true");
	});

	// ─── Multi mode: independent toggling ─────────────────────────────────────

	it("multi mode: items toggle independently", () => {
		render(
			<Accordion mode="multi">
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
				<Accordion.Item id="b" title="Item B">
					Content B
				</Accordion.Item>
			</Accordion>,
		);
		const btnA = screen.getByRole("button", { name: /Item A/i });
		const btnB = screen.getByRole("button", { name: /Item B/i });

		fireEvent.click(btnA);
		expect(btnA).toHaveAttribute("aria-expanded", "true");
		expect(btnB).toHaveAttribute("aria-expanded", "false");

		fireEvent.click(btnB);
		expect(btnA).toHaveAttribute("aria-expanded", "true");
		expect(btnB).toHaveAttribute("aria-expanded", "true");

		fireEvent.click(btnA);
		expect(btnA).toHaveAttribute("aria-expanded", "false");
		expect(btnB).toHaveAttribute("aria-expanded", "true");
	});

	// ─── Controlled mode ──────────────────────────────────────────────────────

	it("controlled mode: openIds prop controls which item is open", () => {
		render(
			<Accordion openIds={["b"]}>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
				<Accordion.Item id="b" title="Item B">
					Content B
				</Accordion.Item>
			</Accordion>,
		);
		const btnA = screen.getByRole("button", { name: /Item A/i });
		const btnB = screen.getByRole("button", { name: /Item B/i });
		expect(btnA).toHaveAttribute("aria-expanded", "false");
		expect(btnB).toHaveAttribute("aria-expanded", "true");
	});

	it("controlled mode: onOpenIdsChange fires with new ids on click", () => {
		const onOpenIdsChange = vi.fn();
		render(
			<Accordion openIds={[]} onOpenIdsChange={onOpenIdsChange}>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		fireEvent.click(btn);
		expect(onOpenIdsChange).toHaveBeenCalledWith(["a"]);
	});

	// ─── Uncontrolled: defaultOpenIds ─────────────────────────────────────────

	it("uncontrolled: defaultOpenIds opens specified items initially", () => {
		render(
			<Accordion defaultOpenIds={["a"]}>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
				<Accordion.Item id="b" title="Item B">
					Content B
				</Accordion.Item>
			</Accordion>,
		);
		const btnA = screen.getByRole("button", { name: /Item A/i });
		const btnB = screen.getByRole("button", { name: /Item B/i });
		expect(btnA).toHaveAttribute("aria-expanded", "true");
		expect(btnB).toHaveAttribute("aria-expanded", "false");
	});

	// ─── Disabled item ────────────────────────────────────────────────────────

	it("disabled item button is disabled and click is no-op", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A" disabled>
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		expect(btn).toBeDisabled();

		fireEvent.click(btn);
		expect(btn).toHaveAttribute("aria-expanded", "false");
	});

	// ─── Chevron data-open attribute ──────────────────────────────────────────

	it("chevron svg has data-open attribute when panel is open", () => {
		render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		const btn = screen.getByRole("button", { name: /Item A/i });
		// Before click — no data-open on chev
		const chevBefore = btn.querySelector(".ds-atom-accordion-chev");
		expect(chevBefore).not.toHaveAttribute("data-open");

		fireEvent.click(btn);
		const chevAfter = btn.querySelector(".ds-atom-accordion-chev");
		expect(chevAfter).toHaveAttribute("data-open", "true");
	});

	// ─── Root wrapper class ───────────────────────────────────────────────────

	it("root wrapper has ds-atom-accordion class", () => {
		const { container } = render(
			<Accordion>
				<Accordion.Item id="a" title="Item A">
					Content A
				</Accordion.Item>
			</Accordion>,
		);
		expect(container.firstChild).toHaveClass("ds-atom-accordion");
	});

	// ─── Error guard: Item outside Accordion ──────────────────────────────────

	it("throws if Accordion.Item is rendered outside <Accordion>", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(
				<Accordion.Item id="x" title="Orphan">
					Oops
				</Accordion.Item>,
			),
		).toThrow("Accordion.Item must be rendered inside <Accordion>");
		spy.mockRestore();
	});
});
