import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchAndFilters, type SearchFilter, type SearchSuggestion } from "./SearchAndFilters";

const SUGGESTIONS: SearchSuggestion[] = [
	{ id: "s1", label: "Stripe" },
	{ id: "s2", label: "Linear" },
	{ id: "s3", label: "Figma" },
];

const FILTERS: SearchFilter[] = [
	{ id: "f1", label: "Remote" },
	{ id: "f2", label: "Engineering", tone: "tag" },
];

describe("SearchAndFilters", () => {
	// Test 1: renders search input with placeholder
	it("renders search input with placeholder", () => {
		render(<SearchAndFilters placeholder="Find something..." />);
		const input = screen.getByPlaceholderText("Find something...");
		expect(input).toBeInTheDocument();
	});

	// Test 1b: uses default placeholder "Search..." when none provided
	it("uses default placeholder when none provided", () => {
		render(<SearchAndFilters />);
		expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
	});

	// Test 2: typing in the input calls onSearch with the typed string
	it("typing in input calls onSearch with the typed string", () => {
		const onSearch = vi.fn();
		render(<SearchAndFilters onSearch={onSearch} />);
		const input = screen.getByPlaceholderText("Search...");
		fireEvent.change(input, { target: { value: "stripe" } });
		expect(onSearch).toHaveBeenCalledWith("stripe");
	});

	// Test 3: with suggestions prop, DSDropdown opens when input has value
	it("with suggestions, dropdown opens on input change", async () => {
		render(<SearchAndFilters suggestions={SUGGESTIONS} />);
		const input = screen.getByPlaceholderText("Search...");
		fireEvent.change(input, { target: { value: "s" } });
		await waitFor(() => {
			expect(screen.getByRole("listbox")).toBeInTheDocument();
		});
	});

	// Test 4: selecting a suggestion (via click on option) adds a filter Chip
	it("selecting a suggestion calls onSuggestionSelect", async () => {
		const onSuggestionSelect = vi.fn();
		render(<SearchAndFilters suggestions={SUGGESTIONS} onSuggestionSelect={onSuggestionSelect} />);
		const input = screen.getByPlaceholderText("Search...");
		fireEvent.change(input, { target: { value: "s" } });
		await waitFor(() => {
			expect(screen.getByRole("listbox")).toBeInTheDocument();
		});
		// Click the first option
		const options = screen.getAllByRole("option");
		fireEvent.click(options[0]!);
		expect(onSuggestionSelect).toHaveBeenCalledWith(SUGGESTIONS[0]);
	});

	// Test 5: filter chips are rendered for each activeFilters item
	it("renders filter chips for each activeFilters item", () => {
		render(<SearchAndFilters activeFilters={FILTERS} />);
		expect(screen.getByText("Remote")).toBeInTheDocument();
		expect(screen.getByText("Engineering")).toBeInTheDocument();
	});

	// Test 6: clicking × on a filter chip calls onFilterRemove with that filter
	it("clicking × on a chip calls onFilterRemove with that filter", () => {
		const onFilterRemove = vi.fn();
		render(<SearchAndFilters activeFilters={FILTERS} onFilterRemove={onFilterRemove} />);
		// Each Chip renders an aria-label="Remove" button for ×
		const removeButtons = screen.getAllByRole("button", { name: /remove/i });
		fireEvent.click(removeButtons[0]!);
		expect(onFilterRemove).toHaveBeenCalledWith(FILTERS[0]);
	});

	// Test 7: "Clear all" button appears when activeFilters.length > 0
	it("shows Clear all button when activeFilters.length > 0", () => {
		render(<SearchAndFilters activeFilters={FILTERS} />);
		expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
	});

	// Test 8: clicking "Clear all" calls onClearFilters
	it("clicking Clear all calls onClearFilters", () => {
		const onClearFilters = vi.fn();
		render(<SearchAndFilters activeFilters={FILTERS} onClearFilters={onClearFilters} />);
		fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
		expect(onClearFilters).toHaveBeenCalled();
	});

	// Test 9: no "Clear all" when activeFilters is empty or not provided
	it("does not show Clear all when activeFilters is empty", () => {
		render(<SearchAndFilters activeFilters={[]} />);
		expect(screen.queryByRole("button", { name: /clear all/i })).toBeNull();
	});

	it("does not show Clear all when activeFilters is not provided", () => {
		render(<SearchAndFilters />);
		expect(screen.queryByRole("button", { name: /clear all/i })).toBeNull();
	});
});
