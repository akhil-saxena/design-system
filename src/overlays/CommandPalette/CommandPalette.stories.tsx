import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Check, Copy, Plus, Search, Star, Trash } from "../../icons";
import { Button } from "../../inputs/Button";
import { Kbd } from "../../inputs/Kbd";
import { CommandPalette, type CommandPaletteItem } from "./index";

// ─── Source snippets ──────────────────────────────────────────────────────────

const SRC = {
	Default: `const [open, setOpen] = useState(false);

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

return (
  <>
    <Button variant="secondary" onClick={() => setOpen(true)}>
      Open Command Palette <Kbd size="sm">⌘K</Kbd>
    </Button>
    <CommandPalette
      open={open}
      onClose={() => setOpen(false)}
      items={ITEMS}
    />
  </>
);`,
	WithIcons: `<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  items={[
    { id: "add", label: "Add application", group: "Actions", icon: <Plus />, onSelect: () => {} },
    { id: "search", label: "Search", group: "Actions", icon: <Search />, shortcut: "⌘K", onSelect: () => {} },
    // …
  ]}
/>`,
	FilteredEmpty: `<CommandPalette
  open
  onClose={() => {}}
  items={ITEMS}
/>
// User types "xyzzy" — no items match the filter
// → renders <div class="ds-atom-cmd-empty">No results for "xyzzy"</div>`,
	DarkMode: `<div className="dark" style={{ background: "#1c1917", padding: 32, minHeight: "100vh" }}>
  <CommandPalette open onClose={() => {}} items={ITEMS} />
</div>`,
};

// ─── Sample items ─────────────────────────────────────────────────────────────

const PLAIN_ITEMS: CommandPaletteItem[] = [
	{ id: "add-app", label: "Add application", group: "Actions", onSelect: () => {} },
	{
		id: "search-apps",
		label: "Search applications",
		group: "Actions",
		shortcut: "⌘K",
		onSelect: () => {},
	},
	{ id: "duplicate", label: "Duplicate selection", group: "Actions", onSelect: () => {} },
	{ id: "go-board", label: "Go to Board", group: "Navigation", onSelect: () => {} },
	{ id: "go-pipeline", label: "Go to Pipeline", group: "Navigation", onSelect: () => {} },
	{ id: "go-archive", label: "Go to Archive", group: "Navigation", onSelect: () => {} },
	{
		id: "stripe",
		label: "Stripe — Staff Engineer",
		group: "Recent",
		onSelect: () => {},
	},
	{
		id: "automattic",
		label: "Automattic — Experienced Engineer",
		group: "Recent",
		onSelect: () => {},
	},
	{
		id: "vercel",
		label: "Vercel — Senior Frontend Engineer",
		group: "Recent",
		onSelect: () => {},
	},
];

const ICON_ITEMS: CommandPaletteItem[] = [
	{
		id: "add",
		label: "Add application",
		group: "Actions",
		icon: <Plus size={16} />,
		shortcut: "⌘N",
		onSelect: () => {},
	},
	{
		id: "search",
		label: "Search applications",
		group: "Actions",
		icon: <Search size={16} />,
		shortcut: "⌘K",
		onSelect: () => {},
	},
	{
		id: "duplicate",
		label: "Duplicate selection",
		group: "Actions",
		icon: <Copy size={16} />,
		onSelect: () => {},
	},
	{
		id: "favorite",
		label: "Mark as favorite",
		group: "Actions",
		icon: <Star size={16} />,
		onSelect: () => {},
	},
	{
		id: "complete",
		label: "Mark complete",
		group: "Status",
		icon: <Check size={16} />,
		onSelect: () => {},
	},
	{
		id: "delete",
		label: "Delete selection",
		group: "Status",
		icon: <Trash size={16} />,
		shortcut: "⌫",
		onSelect: () => {},
	},
];

// ─── Demo wrappers ────────────────────────────────────────────────────────────

function CommandPaletteDemo({ items = PLAIN_ITEMS }: { items?: CommandPaletteItem[] }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Open Command Palette <Kbd size="sm">⌘K</Kbd>
			</Button>
			<CommandPalette open={open} onClose={() => setOpen(false)} items={items} />
		</>
	);
}

function FilteredEmptyDemo() {
	// Open by default with a query that matches nothing — demonstrates the empty state.
	// We use an items array whose labels don't contain the placeholder; consumer would
	// type a query to see the same effect. To force the empty state in the rendered
	// docs, we open the palette and pass items but the user can type any non-matching
	// substring. For visual demonstration we open the palette so the search row is
	// visible; reviewers are expected to type "xyzzy" to observe the empty state.
	const [open, setOpen] = useState(true);
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Reopen Palette
			</Button>
			<CommandPalette
				open={open}
				onClose={() => setOpen(false)}
				items={PLAIN_ITEMS}
				placeholder='Type "xyzzy" to see the empty state…'
			/>
		</>
	);
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof CommandPalette> = {
	title: "Overlays/CommandPalette",
	component: CommandPalette,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Cmd+K command palette — DSPortal-mounted, focus-trapped, keyboard-driven (Arrow/Enter/Escape) search overlay with grouped results. The component is controlled (open + onClose); the consumer registers the Cmd+K listener.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

// ─── Story exports ────────────────────────────────────────────────────────────

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <CommandPaletteDemo />,
};

export const WithIcons: Story = {
	name: "With icons",
	parameters: { docs: { source: { code: SRC.WithIcons } } },
	render: () => <CommandPaletteDemo items={ICON_ITEMS} />,
};

export const FilteredEmpty: Story = {
	name: "Filtered empty state",
	parameters: { docs: { source: { code: SRC.FilteredEmpty } } },
	render: () => <FilteredEmptyDemo />,
};

export const DarkMode: Story = {
	name: "Dark Mode",
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					minHeight: "100vh",
					borderRadius: 8,
					overflow: "hidden",
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <CommandPaletteDemo items={ICON_ITEMS} />,
};
