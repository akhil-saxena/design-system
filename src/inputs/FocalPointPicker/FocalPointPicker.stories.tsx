import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { type FocalPoint, FocalPointPicker } from ".";

/**
 * A local SVG data URI rather than a fetched photograph.
 *
 * Two reasons, both of them recorded in this repository already:
 * `tests/visual/storybook.spec.ts` had to swap Carousel's and Avatar's live
 * picsum/pravatar fetches for local data URIs because a network image makes a
 * pixel baseline non-deterministic; and a focal point is only legible against an
 * image with obvious structure, so this one carries a horizon, a sun and a
 * lettered grid. Move the point and it is instantly clear WHICH part of the
 * frame is being kept.
 */
const IMAGE = `data:image/svg+xml,${encodeURIComponent(
	`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
	<rect width="1200" height="800" fill="#7fb5d5"/>
	<circle cx="240" cy="170" r="95" fill="#fde68a"/>
	<rect y="470" width="1200" height="330" fill="#3f6212"/>
	<rect y="440" width="1200" height="34" fill="#65a30d"/>
	<rect x="880" y="230" width="150" height="240" fill="#7c2d12"/>
	<rect x="905" y="270" width="40" height="40" fill="#fed7aa"/>
	<rect x="965" y="270" width="40" height="40" fill="#fed7aa"/>
	<rect x="905" y="345" width="40" height="40" fill="#fed7aa"/>
	<g fill="#ffffff" font-family="monospace" font-size="64" opacity="0.55">
		<text x="40" y="90">TL</text><text x="1060" y="90">TR</text>
		<text x="40" y="760">BL</text><text x="1060" y="760">BR</text>
	</g>
	<g stroke="#ffffff" stroke-width="2" opacity="0.3">
		<line x1="400" y1="0" x2="400" y2="800"/><line x1="800" y1="0" x2="800" y2="800"/>
		<line x1="0" y1="267" x2="1200" y2="267"/><line x1="0" y1="533" x2="1200" y2="533"/>
	</g>
</svg>`,
)}`;

const ALT = "Illustrated landscape with a sun top left, a hut right of centre and a horizon";

const meta: Meta<typeof FocalPointPicker> = {
	title: "Inputs/FocalPointPicker",
	component: FocalPointPicker,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: [
					"Choose the point a cropped image is anchored to, by dragging a marker on a real",
					"aspect-ratio frame with a live `object-position` preview (G-1).",
					"",
					"**Operable three ways through one code path.** Pointer events with",
					"`setPointerCapture`, so mouse, touch and pen are the same path; arrow keys at 1%,",
					"Shift and an arrow at 10%, `Home` to recentre; and a polite live region that",
					"speaks the position in words. The control this replaces bound `mousedown` only,",
					"had no `tabIndex` and no key handler, and removed its `document` listeners on",
					"mouse-up only — so it was inert to touch and to pen, the only stored crop in the",
					"product could not be set without a mouse, and an unmount mid-drag leaked",
					"listeners.",
					"",
					"**It places the focal point; it does not drag the image.** The rejected model",
					"accumulates an inverted pixel delta with a `/ 2` damping factor, which makes the",
					"same gesture mean different things on a 320px and a 640px frame. See the",
					"`FrameWidths` story, and the docstring in the source for why the choice is",
					"recorded rather than left to be re-derived.",
				].join("\n"),
			},
		},
	},
	argTypes: {
		value: { control: false },
		onChange: { control: false },
		src: { control: false },
		className: { control: false },
		aspectRatio: {
			control: { type: "number", step: 0.1 },
			description:
				"Per-instance override. Omit it and the 3:2 default comes from `--ds-focalpoint-ratio` on `.ds-atom-focalpoint-frame`, which a media query can re-declare — see the RatioFromCss story.",
		},
	},
};

export default meta;
type Story = StoryObj<typeof FocalPointPicker>;

const MONO: React.CSSProperties = { fontFamily: "var(--mono)", fontSize: 11, opacity: 0.75 };

/**
 * The stored value is shown as the string a consumer actually persists.
 *
 * `home_config.json` in the consuming portfolio holds `peekPositions` as
 * `"50% 25%"` strings, and one of its six entries is set — because setting a crop
 * by hand means typing that string into JSON and redeploying to see whether the
 * horizon landed. Printing the exact string beside the frame is the shortest way
 * to show what this control is for.
 */
function Demo({
	start,
	width,
	...rest
}: { start?: FocalPoint; width?: number; aspectRatio?: number }) {
	const [value, setValue] = useState<FocalPoint>(start ?? { x: 50, y: 25 });
	return (
		<div style={{ display: "grid", gap: 8, width: width ?? 420, maxWidth: "100%" }}>
			<FocalPointPicker
				label="Crop focus"
				src={IMAGE}
				alt={ALT}
				value={value}
				onChange={setValue}
				{...rest}
			/>
			<code style={MONO} data-testid="stored">{`"${value.x}% ${value.y}%"`}</code>
		</div>
	);
}

export const Default: Story = { render: () => <Demo /> };

/**
 * The ratio is a prop with a 3:2 default, and 3:2 is D-23's case. It is
 * implemented with the CSS `aspect-ratio` property rather than the legacy
 * padding-top percentage hack — that hack needed a wrapper element, an inset
 * child and a hardcoded percentage per ratio, and it was 86 of the 269
 * non-comment lines a consumer had to write without this component.
 */
export const AspectRatios: Story = {
	parameters: { layout: "padded" },
	render: () => (
		<div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
			<div style={{ display: "grid", gap: 6 }}>
				<code style={MONO}>3:2 — the default, no prop</code>
				<Demo width={260} />
			</div>
			<div style={{ display: "grid", gap: 6 }}>
				<code style={MONO}>aspectRatio=&#123;1&#125;</code>
				<Demo width={260} aspectRatio={1} />
			</div>
			<div style={{ display: "grid", gap: 6 }}>
				<code style={MONO}>aspectRatio=&#123;0.75&#125;</code>
				<Demo width={260} aspectRatio={0.75} />
			</div>
		</div>
	),
};

/**
 * The recorded interaction-model divergence, as a story.
 *
 * Drag to the same *place* in each frame — a quarter across, three quarters down
 * — and both commit `25% 75%`. That is what "frame-size independent" means, and
 * it is the whole reason this component places the point instead of accumulating
 * a damped pixel delta the way the legacy control did.
 *
 * `tests/visual/focalpoint.spec.ts` drives exactly this story at both widths in
 * Chromium and asserts the two agree, because reasoning about percentages is not
 * a measurement.
 */
export const FrameWidths: Story = {
	parameters: { layout: "padded" },
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
			<div style={{ display: "grid", gap: 6 }} data-testid="frame-320">
				<code style={MONO}>320px frame</code>
				<Demo width={320} />
			</div>
			<div style={{ display: "grid", gap: 6 }} data-testid="frame-640">
				<code style={MONO}>640px frame</code>
				<Demo width={640} />
			</div>
		</div>
	),
};

/**
 * The 3:2 default is a CSS knob, not a prop default — `--ds-focalpoint-ratio` on
 * `.ds-atom-focalpoint-frame`.
 *
 * Neither picker below passes `aspectRatio`. The right one is inside a scope that
 * re-declares the knob, and its frame is square. That reachability is the point:
 * a custom property written from a component's `style` object is fixed at
 * construction, so no media query, container query or future density axis can
 * touch it — finding E2, measured on AppShell's `--ds-sidebar-w`.
 */
export const RatioFromCss: Story = {
	parameters: { layout: "padded" },
	render: () => (
		<>
			<style>{".sb-square-frames .ds-atom-focalpoint-frame { --ds-focalpoint-ratio: 1 }"}</style>
			<div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
				<div style={{ display: "grid", gap: 6 }}>
					<code style={MONO}>no prop, no override — 3:2</code>
					<Demo width={280} />
				</div>
				<div className="sb-square-frames" style={{ display: "grid", gap: 6 }}>
					<code style={MONO}>no prop, --ds-focalpoint-ratio: 1</code>
					<Demo width={280} />
				</div>
			</div>
		</>
	),
};
