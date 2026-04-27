/**
 * # Usage Audit — Lightbox (D-87, D-350)
 *
 * Consumers (post v2.1):
 * - documents/ResumePreview — preview attached resume / cover letter PDFs
 *   converted to images
 * - jd/JDScreenshot — display archived job-description screenshot at full
 *   size when user clicks the thumbnail in the JD viewer
 * - portfolio/Gallery — multi-image walkthrough of a candidate's work
 *   samples; ArrowLeft/Right navigate
 *
 * API shape consumers expect:
 * - controlled-pattern: caller manages activeIndex + onIndexChange
 *   (Lightbox has NO internal state; pairs cleanly with a state hook
 *   driven by the gallery/thumbnail strip)
 * - items: LightboxItem[] with src + alt + optional caption
 * - single-item case: prev/next buttons hidden automatically
 *
 * a11y notes:
 * - role="dialog" + aria-modal="true" + aria-label includes active image alt
 *   so screen readers announce "Image lightbox: <alt>"
 * - close button gets initial focus (image is non-focusable)
 * - keyboard: Escape closes; ArrowLeft/Right navigate (wrap-around); Tab
 *   cycles close → prev → next
 * - ALWAYS-DARK invariant (D-350): the heavy black backdrop does NOT flip
 *   in dark mode (handoff parallel to StickyNote always-dark text)
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Lightbox } from "./Lightbox";

const meta: Meta<typeof Lightbox> = {
	title: "Surfaces/Lightbox",
	component: Lightbox,
	parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Lightbox>;

const placeholder = (color: string, label: string) =>
	`data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${color}"/><text x="300" y="200" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="sans-serif" font-size="40">${label}</text></svg>`,
	)}`;

export const SingleImage: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Open lightbox
				</button>
				<Lightbox
					open={open}
					onClose={() => setOpen(false)}
					items={[{ src: placeholder("#b45309", "Resume"), alt: "Senior Engineer Resume" }]}
					activeIndex={0}
				/>
			</>
		);
	},
};

export const Gallery: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		const [idx, setIdx] = useState(0);
		const items = [
			{ src: placeholder("#b45309", "Resume"), alt: "Resume" },
			{ src: placeholder("#1d4ed8", "Portfolio"), alt: "Portfolio" },
			{ src: placeholder("#15803d", "Cover letter"), alt: "Cover letter" },
		];
		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Open gallery
				</button>
				<Lightbox
					open={open}
					onClose={() => setOpen(false)}
					items={items}
					activeIndex={idx}
					onIndexChange={setIdx}
				/>
			</>
		);
	},
};

export const WithCaption: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={[
					{
						src: placeholder("#7c3aed", "Diagram"),
						alt: "Architecture diagram",
						caption: "System architecture — payments service v2",
					},
				]}
				activeIndex={0}
			/>
		);
	},
};

export const DarkMode: Story = {
	parameters: { globals: { theme: "dark" } },
	render: () => {
		const [open, setOpen] = useState(true);
		const [idx, setIdx] = useState(0);
		const items = [
			{ src: placeholder("#b45309", "First"), alt: "First" },
			{ src: placeholder("#1d4ed8", "Second"), alt: "Second" },
		];
		return (
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={items}
				activeIndex={idx}
				onIndexChange={setIdx}
			/>
		);
	},
};
