/**
 * # Usage Audit — HoverCard (D-87, D-355)
 *
 * Consumers (post v2.1):
 * - mentions/UserMentionPreview — @username triggers profile preview on hover
 *   (avatar + name + role + 1-line bio + Message/Profile actions)
 * - jd/JobLinkPreview — application card link triggers a job-meta preview
 *   (company logo + title + salary range + posted-ago + 1-line summary)
 * - analytics/MetricPreview — hover a stat to see a sparkline + trend context
 *
 * API shape consumers expect:
 * - anchorRef: caller owns the trigger and supplies a ref (HoverCard does
 *   NOT clone or wrap the trigger — distinct from Tooltip's cloneElement
 *   pattern; consumers can attach the ref to ANY element, including
 *   composed components that forward refs)
 * - children: arbitrary ReactNode (rich content — avatars, charts, action
 *   buttons; max-width 320px for visual stability)
 * - placement: 4 fixed variants (bottom-start default; -end variants
 *   align right edge; top variants align bottom edge — handled via CSS
 *   transform, no JS measurement of panel size)
 * - openDelay default 300ms (filters cursor pass-throughs); closeDelay
 *   default 150ms (cursor-into-card grace window)
 *
 * Behavior notes:
 * - Hover trigger: mouseenter → openDelay → render
 * - Cursor-into-card grace window: leaving anchor + entering panel within
 *   closeDelay keeps the card open (the canonical hover-card UX)
 * - Click-to-pin: clicking the anchor pins the card open; mouseleave is
 *   ignored while pinned; click anywhere outside (anchor + panel) unpins
 * - Non-modal: NO focus trap; Tab from anchor moves into panel's focusable
 *   children naturally (safest default for non-blocking previews)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { HoverCard } from "./HoverCard";

const SRC = {
	UserProfilePreview: `const ref = useRef(null);
return (
  <p>
    Hover{" "}
    <span ref={ref} style={{ color: "var(--amber-d)", fontWeight: 600, cursor: "pointer" }}>
      @anya.patel
    </span>{" "}
    to see her profile.
    <HoverCard anchorRef={ref}>
      <div style={{ fontWeight: 700 }}>Anya Patel</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Recruiter · Stripe</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 8 }}>
        Senior recruiter focused on staff+ engineering.
      </div>
    </HoverCard>
  </p>
);`,
	LinkPreview: `const ref = useRef(null);
return (
  <p>
    Applied to{" "}
    <a ref={ref} href="#" style={{ color: "var(--blue)", fontWeight: 600 }}>
      Staff Engineer at Stripe
    </a>{" "}
    two weeks ago.
    <HoverCard anchorRef={ref}>
      <div style={{ fontWeight: 700 }}>Staff Engineer</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Stripe · San Francisco</div>
    </HoverCard>
  </p>
);`,
	WithImage: `const ref = useRef(null);
return (
  <div>
    <Button ref={ref} variant="secondary">Hover for preview</Button>
    <HoverCard anchorRef={ref}>
      <div style={{ width: 280, height: 140, borderRadius: 8, background: "linear-gradient(135deg, #b45309, #f59e0b)", marginBottom: 8 }} />
      <div style={{ fontWeight: 700 }}>Resume preview</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>PDF · 2 pages · 245 KB</div>
    </HoverCard>
  </div>
);`,
	ButtonAnchor: `const ref = useRef(null);
return (
  <div>
    <Button ref={ref} variant="primary">Hover the Button</Button>
    <HoverCard anchorRef={ref}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Button-anchored card</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-2)" }}>
        HoverCard's anchorRef accepts any element, including design-system Button.
      </div>
    </HoverCard>
  </div>
);`,
	DarkMode: `const ref = useRef(null);
return (
  <p>
    Hover <span ref={ref} style={{ color: "var(--amber-d)", fontWeight: 600, cursor: "pointer" }}>@user</span>.
    <HoverCard anchorRef={ref}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>User Profile</div>
      <div style={{ fontSize: 12 }}>HoverCard renders themed via :root.dark CSS overrides.</div>
    </HoverCard>
  </p>
);`,
};

const meta: Meta<typeof HoverCard> = {
	title: "Surfaces/HoverCard",
	component: HoverCard,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Anchor-positioned popover that opens on hover or focus delay, used to show rich preview content without a click.",
			},
		},
	},
	argTypes: {
		anchorRef: {
			control: false,
			description: "Ref to the trigger element; HoverCard installs mouse/click listeners on it.",
		},
		children: { control: false, description: "Rich card content rendered inside the panel." },
		placement: {
			control: "select",
			options: ["bottom-start", "bottom-end", "top-start", "top-end"],
			description: "Panel placement relative to the anchor.",
		},
		offset: {
			control: "number",
			description: "Gap in pixels between the anchor edge and the panel.",
		},
		openDelay: {
			control: "number",
			description: "Milliseconds to wait after mouseenter before opening.",
		},
		closeDelay: {
			control: "number",
			description: "Milliseconds to wait after mouseleave before closing.",
		},
		className: { control: false },
	},
};
export default meta;
type Story = StoryObj<typeof HoverCard>;

export const UserProfilePreview: Story = {
	parameters: { docs: { source: { code: SRC.UserProfilePreview } } },
	render: () => {
		const ref = useRef<HTMLSpanElement>(null);
		return (
			<p style={{ fontSize: 13, lineHeight: 1.5, padding: 16 }}>
				Anya brought this candidate in — hover{" "}
				<span
					ref={ref}
					style={{
						color: "var(--amber-d)",
						fontWeight: 600,
						cursor: "pointer",
						borderBottom: "1px dashed var(--amber)",
					}}
				>
					@anya.patel
				</span>{" "}
				to see her profile.
				<HoverCard anchorRef={ref}>
					<div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
						<Avatar name="Anya Patel" size={40} gradient />
						<div>
							<div style={{ fontWeight: 700 }}>Anya Patel</div>
							<div style={{ fontSize: 11, color: "var(--ink-3)" }}>Recruiter · Stripe</div>
						</div>
					</div>
					<div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
						Senior recruiter focused on staff+ engineering. Met at SF Tech Mixer.
					</div>
					<div style={{ display: "flex", gap: 6 }}>
						<Button size="xs" variant="secondary">
							Message
						</Button>
						<Button size="xs" variant="ghost">
							Profile
						</Button>
					</div>
				</HoverCard>
			</p>
		);
	},
};

export const LinkPreview: Story = {
	parameters: { docs: { source: { code: SRC.LinkPreview } } },
	render: () => {
		const ref = useRef<HTMLAnchorElement>(null);
		return (
			<p style={{ fontSize: 13, lineHeight: 1.5, padding: 16 }}>
				Applied to{" "}
				{/* biome-ignore lint/a11y/useValidAnchor: link preview story intentionally targets <a> to demonstrate ref-on-anchor pattern; href + preventDefault keep it inert in Storybook */}
				<a
					ref={ref}
					href="#"
					onClick={(e) => e.preventDefault()}
					style={{ color: "var(--blue, #1d4ed8)", fontWeight: 600 }}
				>
					Staff Engineer at Stripe
				</a>{" "}
				two weeks ago.
				<HoverCard anchorRef={ref}>
					<div style={{ fontWeight: 700, marginBottom: 4 }}>Staff Engineer</div>
					<div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 8 }}>
						Stripe · San Francisco
					</div>
					<div style={{ fontSize: 12, lineHeight: 1.5 }}>
						Lead infrastructure team building payments primitives. Remote OK with quarterly onsites.
					</div>
				</HoverCard>
			</p>
		);
	},
};

export const WithImage: Story = {
	parameters: { docs: { source: { code: SRC.WithImage } } },
	render: () => {
		const ref = useRef<HTMLButtonElement>(null);
		return (
			<div style={{ padding: 16 }}>
				<Button ref={ref} variant="secondary">
					Hover for preview
				</Button>
				<HoverCard anchorRef={ref}>
					<div
						style={{
							width: 280,
							height: 140,
							borderRadius: 8,
							background: "linear-gradient(135deg, #b45309, #f59e0b)",
							marginBottom: 8,
						}}
					/>
					<div style={{ fontWeight: 700 }}>Resume preview</div>
					<div style={{ fontSize: 11, color: "var(--ink-3)" }}>PDF · 2 pages · 245 KB</div>
				</HoverCard>
			</div>
		);
	},
};

export const ButtonAnchor: Story = {
	parameters: { docs: { source: { code: SRC.ButtonAnchor } } },
	render: () => {
		const ref = useRef<HTMLButtonElement>(null);
		return (
			<div style={{ padding: 32 }}>
				<Button ref={ref} variant="primary">
					Hover the Button
				</Button>
				<HoverCard anchorRef={ref}>
					<div style={{ fontWeight: 700, marginBottom: 4 }}>Button-anchored card</div>
					<div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-2)" }}>
						HoverCard's anchorRef accepts any element — including the design-system Button
						primitive. Forwards ref directly via Button's forwardRef.
					</div>
				</HoverCard>
			</div>
		);
	},
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => {
		const ref = useRef<HTMLSpanElement>(null);
		return (
			<p style={{ fontSize: 13, lineHeight: 1.5, padding: 16 }}>
				Dark mode preview — hover{" "}
				<span
					ref={ref}
					style={{
						color: "var(--amber-d)",
						fontWeight: 600,
						cursor: "pointer",
					}}
				>
					@user
				</span>
				.
				<HoverCard anchorRef={ref}>
					<div style={{ fontWeight: 700, marginBottom: 4 }}>User Profile</div>
					<div style={{ fontSize: 12 }}>HoverCard renders themed via :root.dark CSS overrides.</div>
				</HoverCard>
			</p>
		);
	},
};
