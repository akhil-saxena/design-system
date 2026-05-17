import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileInput } from ".";

const meta: Meta<typeof FileInput> = {
	title: "Inputs/FileInput",
	component: FileInput,
};

export default meta;

type Story = StoryObj<typeof FileInput>;

function Wrap(props: Parameters<typeof FileInput>[0]) {
	const [picked, setPicked] = useState<File[]>([]);
	return (
		<div style={{ width: "100%", maxWidth: 480 }}>
			<FileInput
				{...props}
				onSelect={(f) => {
					setPicked(f);
					props.onSelect?.(f);
				}}
			/>
			<ul
				style={{
					marginTop: 12,
					fontFamily: "var(--mono)",
					fontSize: 12,
					color: "var(--ink-3)",
					padding: 0,
					listStyle: "none",
				}}
			>
				{picked.map((f, i) => (
					<li key={`${f.name}-${i}`}>
						{f.name} · {f.size} bytes
					</li>
				))}
			</ul>
		</div>
	);
}

export const Dropzone: Story = { render: () => <Wrap onSelect={() => {}} /> };

export const DropzoneWithContent: Story = {
	render: () => (
		<Wrap onSelect={() => {}}>
			<span style={{ fontFamily: "var(--font)", color: "var(--ink)" }}>Custom child content</span>
		</Wrap>
	),
};

export const DropzonePDFOnly: Story = {
	render: () => (
		<Wrap onSelect={() => {}} accept="application/pdf" maxSizeBytes={5 * 1024 * 1024} />
	),
};

export const ButtonVariant: Story = { render: () => <Wrap onSelect={() => {}} variant="button" /> };

export const Disabled: Story = { render: () => <Wrap onSelect={() => {}} disabled /> };
