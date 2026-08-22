import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Lightbox } from ".";
import { Button } from "../../inputs/Button";
const SRC = {
	SingleImage: `const [open, setOpen] = useState(false);
return (
  <>
    <button type="button" onClick={() => setOpen(true)}>Open lightbox</button>
    <Lightbox
      open={open}
      onClose={() => setOpen(false)}
      items={[{ src: resumeImageUrl, alt: "Senior Engineer Resume" }]}
      activeIndex={0}
    />
  </>
);`,
	Gallery: `const [open, setOpen] = useState(false);
const [idx, setIdx] = useState(0);
const items = [
  { src: resumeUrl, alt: "Resume" },
  { src: portfolioUrl, alt: "Portfolio" },
  { src: coverLetterUrl, alt: "Cover letter" },
];
return (
  <>
    <button type="button" onClick={() => setOpen(true)}>Open gallery</button>
    <Lightbox
      open={open}
      onClose={() => setOpen(false)}
      items={items}
      activeIndex={idx}
      onIndexChange={setIdx}
    />
  </>
);`,
	WithCaption: `<Lightbox
  open={open}
  onClose={() => setOpen(false)}
  items={[{
    src: diagramUrl,
    alt: "Architecture diagram",
    caption: "System architecture - payments service v2",
  }]}
  activeIndex={0}
/>`,
	ResponsiveGallery: `const [open, setOpen] = useState(false);
const [idx, setIdx] = useState(0);
const items = [
  {
    src: "/cliffs-1200.jpg",
    srcSet: "/cliffs-600.jpg 600w, /cliffs-1200.jpg 1200w, /cliffs-2400.jpg 2400w",
    sizes: "100vw",
    alt: "Cliffs at dawn",
    caption: "Cliffs at dawn - Moher, 05:41",
  },
  // ...
];
return (
  <Lightbox
    open={open}
    onClose={() => setOpen(false)}
    items={items}
    activeIndex={idx}
    onIndexChange={setIdx}
  />
);`,
	DarkMode: `const [open, setOpen] = useState(false);
const [idx, setIdx] = useState(0);
return (
  <Lightbox
    open={open}
    onClose={() => setOpen(false)}
    items={[{ src: firstUrl, alt: "First" }, { src: secondUrl, alt: "Second" }]}
    activeIndex={idx}
    onIndexChange={setIdx}
  />
);`,
};

const meta: Meta<typeof Lightbox> = {
	title: "Overlays/Lightbox",
	component: Lightbox,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Full-bleed media overlay for image galleries; controlled via `activeIndex` + `onIndexChange` with keyboard arrow navigation and Escape to close.",
			},
		},
	},
	argTypes: {
		open: {
			control: "boolean",
			description: "Controls visibility; component returns null when false.",
		},
		onClose: {
			control: false,
			description: "Called when the user closes the lightbox via button or Escape.",
		},
		items: { control: false, description: "Ordered array of images to display." },
		activeIndex: {
			control: "number",
			description: "Controlled index of the currently displayed image.",
		},
		onIndexChange: {
			control: false,
			description: "Called when the user navigates to a different image.",
		},
	},
};
export default meta;
type Story = StoryObj<typeof Lightbox>;

const placeholder = (color: string, label: string) =>
	`data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${color}"/><text x="300" y="200" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="sans-serif" font-size="40">${label}</text></svg>`,
	)}`;

// ─── Demo components ──────────────────────────────────────────────────────────

function SingleImageDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Open lightbox
			</Button>
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={[{ src: placeholder("#b45309", "Resume"), alt: "Senior Engineer Resume" }]}
				activeIndex={0}
			/>
		</>
	);
}

function GalleryDemo() {
	const [open, setOpen] = useState(false);
	const [idx, setIdx] = useState(0);
	const items = [
		{ src: placeholder("#b45309", "Resume"), alt: "Resume" },
		{ src: placeholder("#1d4ed8", "Portfolio"), alt: "Portfolio" },
		{ src: placeholder("#15803d", "Cover letter"), alt: "Cover letter" },
	];
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Open gallery (3 images)
			</Button>
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={items}
				activeIndex={idx}
				onIndexChange={setIdx}
			/>
		</>
	);
}

function WithCaptionDemo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Open with caption
			</Button>
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={[
					{
						src: placeholder("#7c3aed", "Diagram"),
						alt: "Architecture diagram",
						caption: "System architecture - payments service v2",
					},
				]}
				activeIndex={0}
			/>
		</>
	);
}

function DarkModeDemo() {
	const [open, setOpen] = useState(false);
	const [idx, setIdx] = useState(0);
	const items = [
		{ src: placeholder("#b45309", "First"), alt: "First" },
		{ src: placeholder("#1d4ed8", "Second"), alt: "Second" },
	];
	return (
		<>
			<Button variant="ghost" onClick={() => setOpen(true)}>
				Open lightbox (dark surface)
			</Button>
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={items}
				activeIndex={idx}
				onIndexChange={setIdx}
			/>
		</>
	);
}

/**
 * Multi-image set carrying srcSet/sizes and a caption. Exists so the visual and
 * a11y suites cover the markup added for G-14 - the responsive image attributes,
 * the polite live region, and the swipe surface - rather than only the four
 * pre-existing stories, none of which pass a srcSet or a caption alongside
 * navigation.
 *
 * Images are local SVG data URIs, not a remote placeholder service: the visual
 * suite records that two stories had to be converted away from live picsum /
 * pravatar fetches because a network round trip is not deterministic.
 */
function ResponsiveGalleryDemo() {
	const [open, setOpen] = useState(false);
	const [idx, setIdx] = useState(0);
	// One 600w and one 1200w candidate per slide. The 1200w file is also `src`,
	// so a browser that ignores srcset still shows the same picture.
	const items = [
		{
			src: placeholder("#b45309", "Cliffs 1200w"),
			srcSet: `${placeholder("#b45309", "Cliffs 600w")} 600w, ${placeholder("#b45309", "Cliffs 1200w")} 1200w`,
			sizes: "100vw",
			alt: "Cliffs at dawn",
			caption: "Cliffs at dawn - Moher, 05:41",
		},
		{
			src: placeholder("#1d4ed8", "Harbour 1200w"),
			srcSet: `${placeholder("#1d4ed8", "Harbour 600w")} 600w, ${placeholder("#1d4ed8", "Harbour 1200w")} 1200w`,
			sizes: "100vw",
			alt: "Harbour wall",
			caption: "Harbour wall - low light, handheld",
		},
		{
			src: placeholder("#15803d", "Low tide 1200w"),
			srcSet: `${placeholder("#15803d", "Low tide 600w")} 600w, ${placeholder("#15803d", "Low tide 1200w")} 1200w`,
			sizes: "100vw",
			alt: "Low tide",
			caption: "Low tide - long exposure",
		},
	];
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Open responsive gallery (3 images)
			</Button>
			<Lightbox
				open={open}
				onClose={() => setOpen(false)}
				items={items}
				activeIndex={idx}
				onIndexChange={setIdx}
			/>
		</>
	);
}

export const SingleImage: Story = {
	parameters: {
		docs: {
			description: { story: "Single image - close button, no navigation arrows." },
			source: { code: SRC.SingleImage },
		},
	},
	render: () => <SingleImageDemo />,
};

export const Gallery: Story = {
	parameters: {
		docs: {
			description: {
				story: "Multi-image gallery - arrow navigation, keyboard ArrowLeft/Right, wrap-around.",
			},
			source: { code: SRC.Gallery },
		},
	},
	render: () => <GalleryDemo />,
};

export const WithCaption: Story = {
	parameters: {
		docs: {
			description: { story: "Caption rendered below the image." },
			source: { code: SRC.WithCaption },
		},
	},
	render: () => <WithCaptionDemo />,
};

export const ResponsiveGallery: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Responsive gallery - each slide carries srcSet/sizes and a caption. Swipe horizontally to navigate on a touch or pen surface; slide changes are announced through a polite live region.",
			},
			source: { code: SRC.ResponsiveGallery },
		},
	},
	render: () => <ResponsiveGalleryDemo />,
};

export const DarkMode: Story = {
	globals: { theme: "dark" },
	parameters: {
		docs: {
			description: {
				story:
					"Lightbox is always-dark (handoff invariant) - backdrop and chrome do not flip with the page theme.",
			},
			source: { code: SRC.DarkMode },
		},
	},
	decorators: [
		(Story) => (
			<div
				style={{
					background: "var(--cream-2)",
					padding: 16,
					borderRadius: 8,
					overflowX: "auto",
					minWidth: 0,
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <DarkModeDemo />,
};
