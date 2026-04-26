/**
 * # Usage Audit — TextInput
 *
 * Consumers (post v2.1):
 * - kanban/QuickAddModal — bare, controlled `value` + `onChange`
 * - detail/EditField — bare for inline edit; error variant on validation
 * - filters/SearchBar — wrapped with leading <Search /> icon
 * - settings/SalaryInput — wrapped with currency `prefix="$"` and `suffix="USD"`
 * - kanban/UrlField — wrapped with leading <Link /> icon for postingUrl
 *
 * API expectations:
 * - bare `<input>` when no icon/prefix/suffix; wrapped when any present
 * - `value` + `onChange` (controlled-first per spec §5)
 * - `error` boolean for invalid state (red border + red shadow)
 *
 * Out of scope: kbd-shortcut hint slot (deferred — handoff has it but no Wave-1 consumer needs it).
 */
import type { Meta, StoryObj } from "@storybook/react";
import { Link as LinkIcon, Search } from "lucide-react";
import { TextInput } from "./TextInput";

const meta: Meta<typeof TextInput> = {
	title: "Atoms/TextInput",
	component: TextInput,
	parameters: { layout: "centered" },
	args: { placeholder: "Type here…" },
	decorators: [
		(Story) => (
			<div style={{ width: 320 }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "Acme Corp" } };

export const ErrorState: Story = {
	args: { error: true, defaultValue: "Invalid email" },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "—" } };

export const WithIcon: Story = {
	args: { icon: <Search size={14} />, placeholder: "Search applications…" },
};

export const WithPrefix: Story = {
	args: { prefix: "$", suffix: "USD", placeholder: "85000" },
};

export const WithUrlIcon: Story = {
	args: {
		icon: <LinkIcon size={14} />,
		placeholder: "https://acme.com/jobs/123",
	},
};

export const Playground: Story = {
	args: { placeholder: "Playground", error: false, disabled: false },
};

export const DarkMode: Story = {
	render: () => (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 8,
				width: 320,
			}}
		>
			<TextInput placeholder="Default" />
			<TextInput defaultValue="With value" />
			<TextInput error defaultValue="Error" />
			<TextInput disabled defaultValue="Disabled" />
			<TextInput icon={<Search size={14} />} placeholder="With icon" />
		</div>
	),
	globals: { theme: "dark" },
};
