/**
 * # Icon wrapper stories (DS-60, D-17-02)
 *
 * The brand-lock Icon component enforces size=20, strokeWidth=1.5,
 * color=currentColor at import time. Consumers can override per-callsite
 * via props (size={14} etc.). Pre-wrapped icons live in
 * @akhil-saxena/design-system/icons subpath.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Check, ChevronDown, Star, X } from "lucide-react";
import { Icon } from "./Icon";

const SRC = {
	Default: `<Icon icon={Check} />
<Icon icon={ChevronDown} />
<Icon icon={X} />
<Icon icon={Star} />`,
	WithAriaLabel: `<Icon icon={X} aria-label="Close dialog" />
<Icon icon={Check} aria-label="Confirmed" />`,
	CustomSize: `<Icon icon={Check} size={14} />
<Icon icon={Check} size={20} />
<Icon icon={Check} size={24} />
<Icon icon={Check} size={32} />`,
	CustomStrokeWidth: `<Icon icon={Star} strokeWidth={1} />
<Icon icon={Star} strokeWidth={1.5} />
<Icon icon={Star} strokeWidth={2} />
<Icon icon={Star} strokeWidth={2.5} />`,
	ChildrenEscapeHatch: `<Icon aria-label="Custom clock icon">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l3 3" />
  </svg>
</Icon>`,
	DarkMode: `<Icon icon={Check} style={{ color: "var(--ink-1)" }} />
<Icon icon={X} style={{ color: "var(--ink-1)" }} />
<Icon icon={Star} style={{ color: "var(--ink-1)" }} />`,
};

const meta: Meta<typeof Icon> = {
	title: "Internals/Icon",
	component: Icon,
	parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Icon icon={Check} />
			<Icon icon={ChevronDown} />
			<Icon icon={X} />
			<Icon icon={Star} />
		</div>
	),
};

export const WithAriaLabel: Story = {
	parameters: { docs: { source: { code: SRC.WithAriaLabel } } },
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Icon icon={X} aria-label="Close dialog" />
			<Icon icon={Check} aria-label="Confirmed" />
		</div>
	),
};

export const CustomSize: Story = {
	parameters: { docs: { source: { code: SRC.CustomSize } } },
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Icon icon={Check} size={14} />
			<Icon icon={Check} size={20} />
			<Icon icon={Check} size={24} />
			<Icon icon={Check} size={32} />
		</div>
	),
};

export const CustomStrokeWidth: Story = {
	parameters: { docs: { source: { code: SRC.CustomStrokeWidth } } },
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Icon icon={Star} strokeWidth={1} />
			<Icon icon={Star} strokeWidth={1.5} />
			<Icon icon={Star} strokeWidth={2} />
			<Icon icon={Star} strokeWidth={2.5} />
		</div>
	),
};

export const ChildrenEscapeHatch: Story = {
	parameters: { docs: { source: { code: SRC.ChildrenEscapeHatch } } },
	render: () => (
		<Icon aria-label="Custom clock icon">
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: aria-label on Icon wrapper's span provides accessible text */}
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v4l3 3" />
			</svg>
		</Icon>
	),
};

export const DarkMode: Story = {
	parameters: { backgrounds: { default: "dark" }, docs: { source: { code: SRC.DarkMode } } },
	render: () => (
		<div
			className="dark"
			style={{
				display: "flex",
				gap: 16,
				alignItems: "center",
				padding: 16,
				background: "var(--surface-1, #1a1a1a)",
				borderRadius: 8,
			}}
		>
			<Icon icon={Check} style={{ color: "var(--ink-1, #fff)" }} />
			<Icon icon={X} style={{ color: "var(--ink-1, #fff)" }} />
			<Icon icon={Star} style={{ color: "var(--ink-1, #fff)" }} />
		</div>
	),
};
