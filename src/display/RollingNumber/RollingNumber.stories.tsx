import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { RollingNumber } from ".";
// ─── Hooks ────────────────────────────────────────────────────────────────────

function useClock() {
	const [t, setT] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setT(new Date()), 1000);
		return () => clearInterval(id);
	}, []);
	return { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
}

function useCounter(step = 1, interval = 1200, max = 99) {
	const [v, setV] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setV((p) => (p + step > max ? 0 : p + step)), interval);
		return () => clearInterval(id);
	}, [step, interval, max]);
	return v;
}

// ─── Separator ────────────────────────────────────────────────────────────────

function Sep({ children, dark }: Readonly<{ children: string; dark?: boolean }>) {
	return (
		<span
			style={{
				fontFamily: "var(--mono)",
				fontWeight: 700,
				fontSize: 15,
				color: dark ? "#6b6057" : "#9b9490",
				padding: "0 2px",
				lineHeight: "22px",
				userSelect: "none",
			}}
		>
			{children}
		</span>
	);
}

// ─── Demo components ──────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

function AnimatedCounterDemo() {
	const v = useCounter(1, 1200, 99);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
			<RollingNumber value={v} />
			<span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--mono)" }}>
				+1 every 1.2 s
			</span>
		</div>
	);
}

function CounterDarkDemo() {
	const score = useCounter(7, 1400, 9999);
	const price = useCounter(100, 2000, 99999);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						fontFamily: "var(--mono)",
						marginBottom: 8,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
					}}
				>
					Score
				</div>
				<RollingNumber value={score} variant="dark" suffix=" pts" />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						fontFamily: "var(--mono)",
						marginBottom: 8,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
					}}
				>
					Price
				</div>
				<RollingNumber value={price} variant="dark" prefix="$" format={(n) => n.toLocaleString()} />
			</div>
		</div>
	);
}

function ClockDarkDemo() {
	const { h, m, s } = useClock();
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
			<RollingNumber value={h} variant="dark" format={pad} />
			<Sep dark>:</Sep>
			<RollingNumber value={m} variant="dark" format={pad} />
			<Sep dark>:</Sep>
			<RollingNumber value={s} variant="dark" format={pad} />
		</div>
	);
}

function CounterLightDemo() {
	const { h, m, s } = useClock();
	const score = useCounter(3, 1600, 999);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						fontFamily: "var(--mono)",
						marginBottom: 8,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
					}}
				>
					Score
				</div>
				<RollingNumber value={score} variant="light" suffix=" pts" />
			</div>
			<div>
				<div
					style={{
						fontSize: 11,
						color: "var(--ink-3)",
						fontFamily: "var(--mono)",
						marginBottom: 8,
						textTransform: "uppercase",
						letterSpacing: "0.06em",
					}}
				>
					Time
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
					<RollingNumber value={h} variant="light" format={pad} />
					<Sep>:</Sep>
					<RollingNumber value={m} variant="light" format={pad} />
					<Sep>:</Sep>
					<RollingNumber value={s} variant="light" format={pad} />
				</div>
			</div>
		</div>
	);
}

// ─── Source snippets ──────────────────────────────────────────────────────────

const SRC = {
	Default: "<RollingNumber value={42} />",
	Currency: `<RollingNumber value={120000} prefix="$" format={(v) => v.toLocaleString()} />`,
	Percentage: `<RollingNumber value={78} suffix="%" />`,
	AnimatedCounter: `const [v, setV] = useState(0);
useEffect(() => {
  const id = setInterval(() => setV((p) => (p + 1 > 99 ? 0 : p + 1)), 1200);
  return () => clearInterval(id);
}, []);
return <RollingNumber value={v} />;`,
	CounterDark: `// variant="dark" - recessed black tiles, white digits
<RollingNumber value={score} variant="dark" suffix=" pts" />
<RollingNumber value={price} variant="dark" prefix="$" format={(n) => n.toLocaleString()} />`,
	ClockDark: `const pad = (n) => String(n).padStart(2, "0");

<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
  <RollingNumber value={hours}   variant="dark" format={pad} />
  <span style={{ color: "#6b6057", fontWeight: 700 }}>:</span>
  <RollingNumber value={minutes} variant="dark" format={pad} />
  <span style={{ color: "#6b6057", fontWeight: 700 }}>:</span>
  <RollingNumber value={seconds} variant="dark" format={pad} />
</div>`,
	CounterLight: `// variant="light" - raised white tiles for dark surfaces
const pad = (n) => String(n).padStart(2, "0");

<RollingNumber value={score} variant="light" suffix=" pts" />
<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
  <RollingNumber value={hours}   variant="light" format={pad} />
  <span style={{ color: "#9b9490", fontWeight: 700 }}>:</span>
  <RollingNumber value={minutes} variant="light" format={pad} />
  <span style={{ color: "#9b9490", fontWeight: 700 }}>:</span>
  <RollingNumber value={seconds} variant="light" format={pad} />
</div>`,
	Playground: `<RollingNumber value={42} variant="default" />`,
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof RollingNumber> = {
	title: "Display/RollingNumber",
	component: RollingNumber,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Animated numeric display - each digit rolls vertically when the value changes. No JS animation library required.\n\n**Variants:** `default` (no background), `dark` (recessed black tiles - scoreboard/clock), `light` (raised white tiles - for dark surfaces).",
			},
		},
	},
	argTypes: {
		value: {
			control: { type: "range", min: 0, max: 9999, step: 1 },
			description: "Numeric value - triggers rolling animation on change.",
		},
		variant: {
			control: "select",
			options: ["default", "dark", "light"],
			description:
				"`default` - transparent. `dark` - recessed black tiles + white digits. `light` - raised white tiles + dark digits (for dark surfaces).",
		},
		prefix: { control: "text", description: "Static text prepended (e.g. `'$'`)." },
		suffix: { control: "text", description: "Static text appended (e.g. `' pts'`)." },
		format: {
			control: false,
			description: "Custom number formatter, e.g. `(v) => v.toLocaleString()`.",
		},
		ariaLabel: {
			control: "text",
			description: "Accessible label; defaults to the rendered string.",
		},
		className: { control: false },
		style: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof RollingNumber>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
	args: { value: 42, variant: "default" },
	parameters: {
		docs: {
			description: {
				story:
					"Use the Controls panel to change `value`, `variant`, `prefix`, and `suffix` in real time.",
			},
			source: { code: SRC.Default },
		},
	},
};

export const Currency: Story = {
	args: { value: 120000, prefix: "$", format: (v: number) => v.toLocaleString() },
	parameters: {
		docs: {
			description: { story: "Locale-formatted with `$` prefix." },
			source: { code: SRC.Currency },
		},
	},
};

export const Percentage: Story = {
	args: { value: 78, suffix: "%" },
	parameters: {
		docs: {
			description: { story: "`%` suffix - use for progress, scores, fill rates." },
			source: { code: SRC.Percentage },
		},
	},
};

export const AnimatedCounter: Story = {
	parameters: {
		docs: {
			description: { story: "Auto-incrementing counter showing the roll animation." },
			source: { code: SRC.AnimatedCounter },
		},
	},
	render: () => <AnimatedCounterDemo />,
};

export const CounterDark: Story = {
	name: "Variant - dark",
	parameters: {
		docs: {
			description: {
				story:
					'`variant="dark"` - recessed black digit tiles on a near-black shell. Ideal for scoreboards, counters, live prices.',
			},
			source: { code: SRC.CounterDark },
		},
	},
	render: () => <CounterDarkDemo />,
};

export const ClockDark: Story = {
	name: "Clock - dark tiles",
	parameters: {
		docs: {
			description: {
				story:
					'Live HH:MM:SS clock assembled from three `variant="dark"` instances. Seconds update every tick.',
			},
			source: { code: SRC.ClockDark },
		},
	},
	render: () => <ClockDarkDemo />,
};

export const CounterLight: Story = {
	name: "Variant - light (on dark surface)",
	parameters: {
		docs: {
			description: {
				story:
					'`variant="light"` - raised white tiles with dark digits. Use when the surrounding surface is dark.',
			},
			source: { code: SRC.CounterLight },
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 32, borderRadius: 12 }}>
				<Story />
			</div>
		),
	],
	render: () => <CounterLightDemo />,
};

export const DarkMode: Story = {
	name: "Dark mode - default variant",
	parameters: {
		docs: {
			description: {
				story:
					"Default transparent variant on a dark surface - `--ink` flips to near-white automatically.",
			},
			source: { code: SRC.Default },
		},
	},
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 24, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
			<RollingNumber value={42} />
			<RollingNumber value={120000} prefix="$" format={(v) => v.toLocaleString()} />
			<RollingNumber value={78} suffix="%" />
		</div>
	),
};
