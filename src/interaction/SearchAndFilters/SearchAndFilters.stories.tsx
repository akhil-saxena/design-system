import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchAndFilters, type SearchFilter, type SearchSuggestion } from ".";
const meta: Meta<typeof SearchAndFilters> = {
	title: "Interaction/SearchAndFilters",
	component: SearchAndFilters,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Search input with DSDropdown autocomplete and Chip filter tokens (DS-78). Consumer filters the `suggestions` list on each keystroke. Active filters render as dismissible Chips below the bar.",
			},
		},
	},
	argTypes: {
		value: {
			control: "text",
			description: "Controlled search input value; omit to leave the input uncontrolled.",
			table: { type: { summary: "string" } },
		},
		placeholder: {
			control: "text",
			description: "Placeholder text displayed in the search input when empty.",
			table: { type: { summary: "string" } },
		},
		suggestions: {
			control: false,
			description: "Consumer-filtered suggestion list shown in the autocomplete dropdown.",
			table: { type: { summary: "SearchSuggestion[]" } },
		},
		activeFilters: {
			control: false,
			description: "Currently applied filter tokens rendered as dismissible Chips below the bar.",
			table: { type: { summary: "SearchFilter[]" } },
		},
		onSearch: {
			control: false,
			description: "Called on every keystroke with the current query string.",
			table: { type: { summary: "(query: string) => void" } },
		},
		onSuggestionSelect: {
			control: false,
			description: "Called when the user selects a suggestion from the dropdown.",
			table: { type: { summary: "(suggestion: SearchSuggestion) => void" } },
		},
		onFilterRemove: {
			control: false,
			description: "Called when the user clicks the × on an active filter Chip.",
			table: { type: { summary: "(filter: SearchFilter) => void" } },
		},
		onClearFilters: {
			control: false,
			description: "Called when the user clicks the 'Clear all' button.",
			table: { type: { summary: "() => void" } },
		},
	},
};

export default meta;
type Story = StoryObj<typeof SearchAndFilters>;

const ALL_SUGGESTIONS: SearchSuggestion[] = [
	{ id: "1", label: "Dashboard" },
	{ id: "2", label: "Analytics" },
	{ id: "3", label: "Projects" },
	{ id: "4", label: "Team members" },
	{ id: "5", label: "Billing" },
	{ id: "6", label: "Settings" },
	{ id: "7", label: "API keys" },
	{ id: "8", label: "Audit log" },
];

function SearchDemo() {
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilter[]>([]);

	const suggestions = ALL_SUGGESTIONS.filter(
		(s) => query.length > 0 && s.label.toLowerCase().includes(query.toLowerCase()),
	);

	function addFilter(s: SearchSuggestion) {
		if (!filters.find((f) => f.id === s.id)) {
			setFilters((prev) => [...prev, { id: s.id, label: s.label }]);
		}
	}

	return (
		<div style={{ maxWidth: 360, width: "100%" }}>
			<SearchAndFilters
				suggestions={suggestions}
				activeFilters={filters}
				onSearch={setQuery}
				onSuggestionSelect={addFilter}
				onFilterRemove={(f) => setFilters((prev) => prev.filter((x) => x.id !== f.id))}
				onClearFilters={() => setFilters([])}
				placeholder="Search pages…"
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <SearchDemo />,
};

export const WithFilters: Story = {
	name: "Pre-populated filters",
	render: () => {
		const [filters, setFilters] = useState<SearchFilter[]>([
			{ id: "1", label: "Dashboard" },
			{ id: "3", label: "Projects" },
			{ id: "5", label: "Billing" },
		]);
		return (
			<div style={{ maxWidth: 400, width: "100%" }}>
				<SearchAndFilters
					activeFilters={filters}
					onFilterRemove={(f) => setFilters((prev) => prev.filter((x) => x.id !== f.id))}
					onClearFilters={() => setFilters([])}
					placeholder="Search…"
				/>
			</div>
		);
	},
};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div
				className="dark"
				style={{
					background: "#1c1917",
					padding: 32,
					borderRadius: 8,
					overflow: "hidden",
					width: "100%",
					boxSizing: "border-box",
				}}
			>
				<Story />
			</div>
		),
	],
	render: () => <SearchDemo />,
};
