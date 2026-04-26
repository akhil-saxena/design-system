import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, FC } from "react";

// Every token from Plan 01's index.css regen, grouped into 10 visible sections.
// This is the formal regression net for token correctness — if a hex value
// drifted during transcription, a swatch will look wrong here AND a baseline
// PNG diff will surface it.

const sectionStyle: CSSProperties = {
	padding: 16,
	borderRadius: 10,
	background: "var(--cream-2)",
	color: "var(--ink)",
	border: "1px solid var(--ink-5)",
};

const labelStyle: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 10,
	fontWeight: 600,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	color: "var(--ink-3)",
	marginBottom: 8,
};

const swatchRow: CSSProperties = {
	display: "flex",
	gap: 8,
	flexWrap: "wrap",
};

const swatchTile = (cssVar: string): CSSProperties => ({
	width: 80,
	height: 60,
	background: `var(${cssVar})`,
	borderRadius: 6,
	border: "1px solid var(--ink-5)",
	display: "flex",
	alignItems: "flex-end",
	justifyContent: "center",
	color: "transparent",
	fontFamily: "var(--mono)",
	fontSize: 10,
	padding: 4,
});

interface SwatchProps {
	v: string;
	name: string;
}
const Swatch: FC<SwatchProps> = ({ v, name }) => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			gap: 4,
			alignItems: "center",
		}}
	>
		<div style={swatchTile(v)} aria-label={`${name} swatch`} />
		<span
			style={{
				fontFamily: "var(--mono)",
				fontSize: 10,
				color: "var(--ink-3)",
			}}
		>
			{name}
		</span>
	</div>
);

const TokenCheck: FC = () => (
	<div
		style={{
			padding: 24,
			fontFamily: "var(--font)",
			color: "var(--ink)",
			minHeight: "100vh",
			background: "var(--cream)",
			display: "grid",
			gridTemplateColumns: "1fr",
			gap: 16,
		}}
	>
		{/* 1. Ink ramp */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Ink Ramp</div>
			<div style={swatchRow}>
				<Swatch v="--ink" name="--ink" />
				<Swatch v="--ink-2" name="--ink-2" />
				<Swatch v="--ink-3" name="--ink-3" />
				<Swatch v="--ink-4" name="--ink-4" />
				<Swatch v="--ink-5" name="--ink-5" />
			</div>
		</section>

		{/* 2. Cream ramp */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Cream Ramp</div>
			<div style={swatchRow}>
				<Swatch v="--cream" name="--cream" />
				<Swatch v="--cream-2" name="--cream-2" />
				<Swatch v="--cream-3" name="--cream-3" />
			</div>
		</section>

		{/* 3. Amber */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Amber</div>
			<div style={swatchRow}>
				<Swatch v="--amber" name="--amber" />
				<Swatch v="--amber-d" name="--amber-d" />
				<Swatch v="--amber-l" name="--amber-l" />
			</div>
		</section>

		{/* 4. Status text-safe */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Status (text-safe)</div>
			<div style={swatchRow}>
				<Swatch v="--blue" name="--blue" />
				<Swatch v="--purple" name="--purple" />
				<Swatch v="--green" name="--green" />
				<Swatch v="--red" name="--red" />
			</div>
		</section>

		{/* 5. Vivids decorative */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Vivids (decorative-only)</div>
			<div style={swatchRow}>
				<Swatch v="--amber-vivid" name="--amber-vivid" />
				<Swatch v="--blue-vivid" name="--blue-vivid" />
				<Swatch v="--purple-vivid" name="--purple-vivid" />
				<Swatch v="--green-vivid" name="--green-vivid" />
				<Swatch v="--red-vivid" name="--red-vivid" />
			</div>
		</section>

		{/* 6. Glass */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Glass effect</div>
			<div style={swatchRow}>
				<div
					className="glass"
					style={{
						width: 120,
						height: 80,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 10,
					}}
				>
					.glass
				</div>
				<div
					className="glass-subtle"
					style={{
						width: 120,
						height: 80,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 10,
					}}
				>
					.glass-subtle
				</div>
				<div
					className="glass-heavy"
					style={{
						width: 120,
						height: 80,
						padding: 12,
						fontFamily: "var(--mono)",
						fontSize: 10,
					}}
				>
					.glass-heavy
				</div>
			</div>
		</section>

		{/* 7. Typography */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Typography</div>
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 800,
					fontSize: 40,
					letterSpacing: "-0.03em",
				}}
			>
				Display 40 Archivo 800
			</div>
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 28,
					letterSpacing: "-0.025em",
					marginTop: 8,
				}}
			>
				Heading 1 — 28 Archivo 700
			</div>
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 20,
					letterSpacing: "-0.015em",
					marginTop: 8,
				}}
			>
				Heading 2 — 20 Archivo 700
			</div>
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 15,
					letterSpacing: "-0.01em",
					marginTop: 8,
				}}
			>
				Heading 3 — 15 Archivo 700
			</div>
			<div
				style={{
					fontFamily: "var(--font)",
					fontWeight: 400,
					fontSize: 14,
					marginTop: 8,
				}}
			>
				Body — 14 system sans 400. The quick brown fox jumps over the lazy dog.
			</div>
			<div
				style={{
					fontFamily: "var(--font)",
					fontWeight: 500,
					fontSize: 12,
					marginTop: 8,
					color: "var(--ink-3)",
				}}
			>
				Small — 12 system sans 500
			</div>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontWeight: 600,
					fontSize: 10,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					marginTop: 8,
					color: "var(--ink-3)",
				}}
			>
				Mono Label — 10 JetBrains Mono 600
			</div>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontWeight: 500,
					fontSize: 13,
					letterSpacing: "0.04em",
					marginTop: 8,
					color: "var(--ink-2)",
				}}
			>
				Mono Data — 13 JetBrains Mono 500 — 12345.67
			</div>
		</section>

		{/* 8. Radii */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Radii</div>
			<div style={swatchRow}>
				{(
					[
						["--radius-sm", "sm 4"],
						["--radius-md", "md 7"],
						["--radius-lg", "lg 10"],
						["--radius-xl", "xl 14"],
						["--radius-2xl", "2xl 18"],
						["--radius-full", "full 999"],
					] as const
				).map(([v, name]) => (
					<div
						key={v}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 4,
							alignItems: "center",
						}}
					>
						<div
							style={{
								width: 60,
								height: 60,
								background: "var(--ink)",
								borderRadius: `var(${v})`,
							}}
						/>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-3)",
							}}
						>
							{name}
						</span>
					</div>
				))}
			</div>
		</section>

		{/* 9. Shadows */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Shadows</div>
			<div style={swatchRow}>
				{(
					[
						["--shadow-subtle", "subtle"],
						["--shadow-card", "card"],
						["--shadow-elevated", "elevated"],
						["--shadow-overlay", "overlay"],
					] as const
				).map(([v, name]) => (
					<div
						key={v}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 4,
							alignItems: "center",
						}}
					>
						<div
							style={{
								width: 100,
								height: 60,
								background: "var(--cream)",
								borderRadius: 8,
								boxShadow: `var(${v})`,
								border: "1px solid var(--ink-5)",
							}}
						/>
						<span
							style={{
								fontFamily: "var(--mono)",
								fontSize: 10,
								color: "var(--ink-3)",
							}}
						>
							{name}
						</span>
					</div>
				))}
			</div>
		</section>

		{/* 10. Focus ring + label utility classes */}
		<section style={sectionStyle}>
			<div style={labelStyle}>Utility classes</div>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<button
					type="button"
					className="ds-focus-ring"
					style={{
						background: "var(--ink)",
						color: "var(--cream)",
						padding: "7px 14px",
						borderRadius: "var(--radius-md)",
						fontFamily: "var(--font)",
						fontSize: 12,
						fontWeight: 600,
						border: "1px solid var(--ink-5)",
					}}
				>
					.ds-focus-ring (button)
				</button>
				<span className="ds-label">.ds-label utility</span>
				<div
					className="ds-dot-grid"
					style={{
						width: 100,
						height: 60,
						borderRadius: 6,
						border: "1px solid var(--ink-5)",
					}}
					aria-label=".ds-dot-grid"
				/>
			</div>
		</section>
	</div>
);

const meta: Meta<typeof TokenCheck> = {
	title: "Foundation/TokenCheck",
	component: TokenCheck,
	parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof TokenCheck>;

export const Light: Story = { globals: { theme: "light" } };
export const Dark: Story = { globals: { theme: "dark" } };
