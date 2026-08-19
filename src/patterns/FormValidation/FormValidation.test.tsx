import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FieldError, FormErrorSummary, PasswordStrength } from ".";
afterEach(cleanup);

describe("PasswordStrength", () => {
	it("score=0 renders 4 grey segments", () => {
		const { container } = render(<PasswordStrength score={0} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		// All segments use --ink-5 (grey) background
		for (const seg of segs) {
			expect((seg as HTMLElement).style.background).toContain("ink-5");
		}
	});

	it("score=1 renders 1 red segment + 3 grey segments", () => {
		const { container } = render(<PasswordStrength score={1} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		expect((segs[0] as HTMLElement).style.background).toContain("red");
		expect((segs[1] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[2] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[3] as HTMLElement).style.background).toContain("ink-5");
	});

	it("score=2 renders 2 amber segments + 2 grey segments", () => {
		const { container } = render(<PasswordStrength score={2} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		expect((segs[0] as HTMLElement).style.background).toContain("amber");
		expect((segs[1] as HTMLElement).style.background).toContain("amber");
		expect((segs[2] as HTMLElement).style.background).toContain("ink-5");
		expect((segs[3] as HTMLElement).style.background).toContain("ink-5");
	});

	it("score=4 renders 4 green segments", () => {
		const { container } = render(<PasswordStrength score={4} />);
		const segs = container.querySelectorAll(".ds-atom-pwstrength-seg");
		expect(segs).toHaveLength(4);
		for (const seg of segs) {
			expect((seg as HTMLElement).style.background).toContain("green");
		}
	});

	it("renders strength label for each score", () => {
		const { rerender } = render(<PasswordStrength score={1} />);
		expect(screen.getByText("Weak")).toBeTruthy();

		rerender(<PasswordStrength score={2} />);
		expect(screen.getByText("Fair")).toBeTruthy();

		rerender(<PasswordStrength score={3} />);
		expect(screen.getByText("Good")).toBeTruthy();

		rerender(<PasswordStrength score={4} />);
		expect(screen.getByText("Strong")).toBeTruthy();
	});
});

describe("FieldError", () => {
	it("renders message text with role=alert", () => {
		render(<FieldError message="This field is required" />);
		const el = screen.getByRole("alert");
		expect(el.textContent).toBe("This field is required");
	});

	it("renders nothing when message is falsy", () => {
		const { container } = render(<FieldError message={null} />);
		expect(container.firstChild).toBeNull();
	});
});

describe("FormErrorSummary", () => {
	it("renders all error strings as a list with role=alert", () => {
		render(<FormErrorSummary errors={["Name is required", "Email is invalid"]} />);
		const alert = screen.getByRole("alert");
		expect(alert).toBeTruthy();
		expect(screen.getByText("Name is required")).toBeTruthy();
		expect(screen.getByText("Email is invalid")).toBeTruthy();
		expect(alert.querySelector("ul")).toBeTruthy();
	});

	it("renders nothing when errors array is empty", () => {
		const { container } = render(<FormErrorSummary errors={[]} />);
		expect(container.firstChild).toBeNull();
	});
});

/**
 * G-6 — a summary entry could not carry a link. Both surfaces that needed one
 * (the D-18 publish modal and the inline publish block) had to render their
 * "Go to Résumé" / "Go to Photos" / "Go to Home" actions as separate elements
 * beside the summary, in a second ordered list whose only binding to the first
 * was that the two arrays happened to be in the same order. Reordering or
 * renumbering either one desynchronised them with nothing to catch it.
 *
 * So the assertion that matters is not "an href is accepted" — it is that the
 * anchor is ON the item that names the failure, and that nothing renders outside
 * the <ul>.
 */
describe("FormErrorSummary anchored entries (G-6)", () => {
	it("still accepts a plain string array, rendering exactly as before", () => {
		const { container } = render(<FormErrorSummary errors={["Name is required"]} />);
		const li = container.querySelector("li");
		expect(li?.textContent).toBe("Name is required");
		expect(li?.querySelector("a"), "a string entry must not become a link").toBeNull();
	});

	it("renders an anchor whose accessible text is the message", () => {
		// The link text IS the failure. "Go to Résumé" beside "Résumé is missing a
		// role" is a navigation aside; this is a deep link, which is the finding.
		render(
			<FormErrorSummary errors={[{ message: "Résumé is missing a role", href: "/resume" }]} />,
		);
		const link = screen.getByRole("link", { name: "Résumé is missing a role" });
		expect(link).toHaveAttribute("href", "/resume");
	});

	it("puts the anchor inside the <li>, with no second list anywhere", () => {
		const { container } = render(
			<FormErrorSummary
				errors={[
					{ message: "a", href: "/a" },
					{ message: "b", href: "/b" },
				]}
			/>,
		);
		const lists = container.querySelectorAll("ul, ol");
		expect(lists, "a second list is the workaround this finding exists to remove").toHaveLength(1);
		for (const link of container.querySelectorAll("a")) {
			expect(link.closest("li"), "anchor rendered beside the list, not on the item").not.toBeNull();
		}
		// Nothing outside the <ul> but the title.
		const root = container.firstElementChild as HTMLElement;
		expect(Array.from(root.children).map((c) => c.tagName)).toEqual(["STRONG", "UL"]);
	});

	it("renders plain text, not a dead link, when an entry has no href", () => {
		const { container } = render(<FormErrorSummary errors={[{ message: "No target" }]} />);
		expect(container.querySelector("li")?.textContent).toBe("No target");
		expect(container.querySelector("a")).toBeNull();
	});

	it("renders a mixed array of strings and objects", () => {
		const { container } = render(
			<FormErrorSummary
				errors={["plain", { message: "linked", href: "/x" }, { message: "bare" }]}
			/>,
		);
		const items = Array.from(container.querySelectorAll("li"));
		expect(items.map((li) => li.textContent)).toEqual(["plain", "linked", "bare"]);
		expect(container.querySelectorAll("a")).toHaveLength(1);
	});

	it("keeps role=alert on the container", () => {
		// Deliberately NOT symmetric with FieldError's warning tone: a summary that
		// appears after a failed submit should preempt.
		render(<FormErrorSummary errors={[{ message: "a", href: "/a" }]} />);
		expect(screen.getByRole("alert")).toBeTruthy();
	});

	describe("T-11-01: only in-app hrefs become anchors", () => {
		// React does not block `javascript:` in href the way it does some
		// attributes, so an entry's href is a real XSS vector. Anything that is not
		// shaped like an in-app link renders as plain text — the failure is still
		// named, it just is not clickable.
		const rejected = [
			"javascript:alert(1)",
			// biome-ignore lint/suspicious/noExplicitAny: exercising a hostile value
			"JaVaScRiPt:alert(1)" as any,
			"data:text/html,<script>alert(1)</script>",
			"//evil.example.com",
			"https://evil.example.com",
			"vbscript:msgbox(1)",
			" /leading-space",
		];

		for (const href of rejected) {
			it(`refuses ${JSON.stringify(href)}`, () => {
				const { container } = render(<FormErrorSummary errors={[{ message: "hostile", href }]} />);
				expect(container.querySelector("a"), `${href} was rendered as an anchor`).toBeNull();
				expect(container.querySelector("li")?.textContent).toBe("hostile");
			});
		}

		for (const href of ["/resume", "#alt-text", "./photos", "../home"]) {
			it(`accepts ${JSON.stringify(href)}`, () => {
				const { container } = render(<FormErrorSummary errors={[{ message: "ok", href }]} />);
				expect(container.querySelector("a"), `${href} should have been a link`).not.toBeNull();
				expect(container.querySelector("a")).toHaveAttribute("href", href);
			});
		}
	});
});
