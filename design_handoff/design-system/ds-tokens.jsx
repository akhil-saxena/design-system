/* ═══ TOKEN EXPORT — design tokens as CSS, JSON, JS ═══ */

const TOKENS = {
	color: {
		cream: "#f5f3f0",
		"cream-2": "#ece8e3",
		"cream-3": "#dcd6cd",
		ink: "#292524",
		"ink-2": "#57534e",
		"ink-3": "#6b6560",
		"ink-4": "#928a82",
		amber: "#f59e0b",
		"amber-d": "#b45309",
		"amber-l": "#fef3c7",
		green: "#15803d",
		"green-l": "#dcfce7",
		blue: "#1e40af",
		"blue-l": "#dbeafe",
		red: "#dc2626",
		"red-l": "#fee2e2",
		rule: "rgba(0,0,0,.08)",
	},
	type: {
		display: "'Fraunces', 'Times New Roman', serif",
		sans: "'Inter', system-ui, sans-serif",
		mono: "'JetBrains Mono', ui-monospace, monospace",
	},
	space: {
		1: "4px",
		2: "8px",
		3: "12px",
		4: "16px",
		5: "20px",
		6: "24px",
		8: "32px",
		10: "40px",
		12: "48px",
		16: "64px",
		20: "80px",
		24: "96px",
	},
	radius: {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "18px",
		pill: "999px",
	},
	shadow: {
		sm: "0 1px 2px rgba(0,0,0,.06)",
		md: "0 4px 14px rgba(0,0,0,.08)",
		lg: "0 8px 28px rgba(0,0,0,.12)",
		xl: "0 16px 48px rgba(0,0,0,.16)",
	},
	motion: {
		fast: "120ms",
		base: "200ms",
		slow: "320ms",
		"ease-out": "cubic-bezier(.16,1,.3,1)",
		"ease-in-out": "cubic-bezier(.65,0,.35,1)",
	},
};

function buildCSS() {
	let out = ":root {\n";
	for (const [group, items] of Object.entries(TOKENS)) {
		out += `  /* ${group} */\n`;
		for (const [k, v] of Object.entries(items)) {
			out += `  --${group}-${k}: ${v};\n`;
		}
	}
	out += "}\n";
	return out;
}

function buildJSON() {
	return JSON.stringify(TOKENS, null, 2);
}

function buildJS() {
	return `export const tokens = ${JSON.stringify(TOKENS, null, 2)};\n`;
}

function CodeBlock({ code, lang, height = 280 }) {
	const [copied, setCopied] = React.useState(false);
	const onCopy = () => {
		navigator.clipboard?.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1400);
	};
	return (
		<div
			style={{
				position: "relative",
				borderRadius: 10,
				border: "1px solid rgba(255,255,255,.08)",
				background: "#1c1917",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 14px",
					borderBottom: "1px solid rgba(255,255,255,.08)",
				}}
			>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: "rgba(245,243,240,.5)",
						letterSpacing: ".1em",
						textTransform: "uppercase",
						fontWeight: 700,
					}}
				>
					{lang}
				</span>
				<span
					onClick={onCopy}
					style={{
						cursor: "pointer",
						fontFamily: "var(--mono)",
						fontSize: 10,
						color: copied ? "#22c55e" : "rgba(245,243,240,.7)",
						letterSpacing: ".05em",
						padding: "4px 10px",
						borderRadius: 5,
						background: "rgba(255,255,255,.06)",
						fontWeight: 700,
					}}
				>
					{copied ? "✓ COPIED" : "COPY"}
				</span>
			</div>
			<pre
				style={{
					margin: 0,
					padding: 14,
					fontFamily: "var(--mono)",
					fontSize: 11,
					lineHeight: 1.6,
					color: "rgba(245,243,240,.9)",
					height,
					overflow: "auto",
					whiteSpace: "pre",
				}}
			>
				{code}
			</pre>
		</div>
	);
}

function TokenSwatch({ name, value }) {
	const isColor = typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb"));
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "6px 10px",
				borderRadius: 6,
				background: "var(--surf-1)",
				border: "1px solid var(--rule)",
			}}
		>
			{isColor && (
				<div
					style={{
						width: 18,
						height: 18,
						borderRadius: 4,
						background: value,
						border: "1px solid var(--rule)",
					}}
				/>
			)}
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 10.5,
						fontWeight: 700,
						color: "var(--ink)",
					}}
				>
					--{name}
				</div>
				<div
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9.5,
						color: "var(--ink-3)",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
					{value}
				</div>
			</div>
		</div>
	);
}

function TokenExportSection() {
	const [format, setFormat] = React.useState("css");
	const code = format === "css" ? buildCSS() : format === "json" ? buildJSON() : buildJS();
	const lang =
		format === "css"
			? "CSS · variables"
			: format === "json"
				? "JSON · raw tokens"
				: "JS · ES module";

	return (
		<div>
			<DSSubsection title="Token Export">
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-3)",
						marginBottom: 20,
						lineHeight: 1.5,
						maxWidth: 640,
					}}
				>
					Every design decision in the system is encoded as a token — colour, typography, spacing,
					radius, shadow, motion. Export in the format your toolchain wants. Token names match what
					you've already seen in the components on every other page.
				</p>

				{/* Format switcher + code */}
				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24, marginBottom: 32 }}
				>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 10,
							}}
						>
							Choose format
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
							{[
								{ id: "css", label: "CSS Variables", sub: "Drop into :root" },
								{ id: "json", label: "JSON", sub: "For Style Dictionary, Tokens Studio" },
								{ id: "js", label: "JavaScript module", sub: "import { tokens } from ..." },
							].map((o) => (
								<div
									key={o.id}
									onClick={() => setFormat(o.id)}
									style={{
										cursor: "pointer",
										padding: 12,
										borderRadius: 8,
										border: format === o.id ? "1.5px solid var(--ink)" : "1px solid var(--rule)",
										background: format === o.id ? "var(--cream)" : "var(--surf-1)",
									}}
								>
									<div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--ink)" }}>
										{o.label}
									</div>
									<div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{o.sub}</div>
								</div>
							))}
						</div>

						<div
							style={{
								padding: 14,
								background: "rgba(245,158,11,.08)",
								border: "1px solid rgba(245,158,11,.3)",
								borderRadius: 10,
							}}
						>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9.5,
									color: "var(--amber-d)",
									letterSpacing: ".08em",
									textTransform: "uppercase",
									fontWeight: 700,
									marginBottom: 6,
								}}
							>
								Naming convention
							</div>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 11.5,
									color: "var(--ink)",
									fontWeight: 700,
									marginBottom: 4,
								}}
							>
								--<span style={{ color: "var(--amber-d)" }}>group</span>-
								<span style={{ color: "var(--ink-3)" }}>name</span>
							</div>
							<div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.45 }}>
								e.g.{" "}
								<code style={{ fontFamily: "var(--mono)", fontSize: 10.5 }}>--color-amber</code>,{" "}
								<code style={{ fontFamily: "var(--mono)", fontSize: 10.5 }}>--space-4</code>.
								Numbered scales are evenly stepped; named values describe role.
							</div>
						</div>
					</div>

					<CodeBlock code={code} lang={lang} height={400} />
				</div>

				{/* Token tables */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 8,
							}}
						>
							Colour · {Object.keys(TOKENS.color).length} tokens
						</div>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
							{Object.entries(TOKENS.color).map(([k, v]) => (
								<TokenSwatch key={k} name={`color-${k}`} value={v} />
							))}
						</div>
					</div>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 8,
							}}
						>
							Spacing · {Object.keys(TOKENS.space).length} tokens
						</div>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
							{Object.entries(TOKENS.space).map(([k, v]) => (
								<TokenSwatch key={k} name={`space-${k}`} value={v} />
							))}
						</div>
					</div>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 8,
							}}
						>
							Radius
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{Object.entries(TOKENS.radius).map(([k, v]) => (
								<TokenSwatch key={k} name={`radius-${k}`} value={v} />
							))}
						</div>
					</div>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 8,
							}}
						>
							Shadow
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{Object.entries(TOKENS.shadow).map(([k, v]) => (
								<TokenSwatch key={k} name={`shadow-${k}`} value={v} />
							))}
						</div>
					</div>
					<div>
						<div
							style={{
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "var(--ink-3)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
								marginBottom: 8,
							}}
						>
							Motion
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{Object.entries(TOKENS.motion).map(([k, v]) => (
								<TokenSwatch key={k} name={`motion-${k}`} value={v} />
							))}
						</div>
					</div>
				</div>

				{/* Stats footer */}
				<div
					style={{
						marginTop: 32,
						padding: "20px 22px",
						background: "#1c1917",
						color: "#f5f3f0",
						borderRadius: 12,
						display: "flex",
						gap: 32,
					}}
				>
					{[
						["53", "Sections"],
						[
							Object.keys(TOKENS.color).length +
								Object.keys(TOKENS.space).length +
								Object.keys(TOKENS.radius).length +
								Object.keys(TOKENS.shadow).length +
								Object.keys(TOKENS.motion).length +
								Object.keys(TOKENS.type).length,
							"Total tokens",
						],
						["3", "Export formats"],
						["MIT", "Licence"],
					].map(([n, l], i) => (
						<div key={i} style={{ flex: 1 }}>
							<div
								style={{
									fontFamily: "var(--display)",
									fontSize: 32,
									fontWeight: 800,
									letterSpacing: "-.02em",
									lineHeight: 1,
									color: "#f5f3f0",
								}}
							>
								{n}
							</div>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 10,
									color: "rgba(245,243,240,.6)",
									letterSpacing: ".1em",
									textTransform: "uppercase",
									fontWeight: 700,
									marginTop: 6,
								}}
							>
								{l}
							</div>
						</div>
					))}
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { TokenExportSection });
