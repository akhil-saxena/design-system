import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from ".";

const meta: Meta<typeof Pagination> = {
	title: "Data Display/Pagination",
	component: Pagination,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	argTypes: {
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// ─── Controlled demo wrapper ────────────────────────────────────────────────

function PaginationDemo(props: {
	totalPages: number;
	initialPage?: number;
	variant?: "full" | "compact";
}) {
	const [page, setPage] = useState(props.initialPage ?? 3);
	return (
		<Pagination
			totalPages={props.totalPages}
			currentPage={page}
			onPageChange={setPage}
			variant={props.variant ?? "full"}
		/>
	);
}

// ─── Source code strings ─────────────────────────────────────────────────────

const SRC: Record<string, string> = {
	FullVariant: `<Pagination
  totalPages={12}
  currentPage={page}
  onPageChange={setPage}
  variant="full"
/>`,
	CompactVariant: `<Pagination
  totalPages={12}
  currentPage={page}
  onPageChange={setPage}
  variant="compact"
/>`,
};

// ─── Stories ─────────────────────────────────────────────────────────────────

/**
 * Full variant with 12 pages. Shows ellipsis when page range exceeds window.
 * Controlled — click to navigate.
 */
export const FullVariant: Story = {
	parameters: {
		docs: { source: { code: SRC.FullVariant } },
	},
	render: () => <PaginationDemo totalPages={12} initialPage={3} />,
};

/**
 * Compact variant shows 'N / M' text between prev/next arrows.
 */
export const CompactVariant: Story = {
	parameters: {
		docs: { source: { code: SRC.CompactVariant } },
	},
	render: () => <PaginationDemo totalPages={12} initialPage={3} variant="compact" />,
};

/**
 * First page — previous button is disabled.
 */
export const FirstPage: Story = {
	render: () => <PaginationDemo totalPages={12} initialPage={1} />,
};

/**
 * Last page — next button is disabled.
 */
export const LastPage: Story = {
	render: () => <PaginationDemo totalPages={12} initialPage={12} />,
};

/**
 * 5 pages or fewer — all page buttons shown, no ellipsis.
 */
export const FewPages: Story = {
	render: () => <PaginationDemo totalPages={5} initialPage={2} />,
};

/**
 * Both variants on a dark background to verify dark-mode token coverage.
 */
export const DarkMode: Story = {
	render: () => (
		<div
			className="dark"
			style={{
				background: "#1c1917",
				padding: 32,
				borderRadius: 8,
				overflowX: "auto",
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
				gap: 24,
			}}
		>
			<div>
				<p
					style={{
						color: "#a8a29e",
						fontSize: 12,
						marginBottom: 12,
						fontFamily: "sans-serif",
					}}
				>
					Full variant
				</p>
				<PaginationDemo totalPages={12} initialPage={6} />
			</div>
			<div>
				<p
					style={{
						color: "#a8a29e",
						fontSize: 12,
						marginBottom: 12,
						fontFamily: "sans-serif",
					}}
				>
					Compact variant
				</p>
				<PaginationDemo totalPages={12} initialPage={6} variant="compact" />
			</div>
		</div>
	),
};
