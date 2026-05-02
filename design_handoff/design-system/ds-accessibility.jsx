/* ═══ ACCESSIBILITY — focus rings, contrast, posture ═══ */

/* WCAG ratio computation */
function _srgb(v) {
	v /= 255;
	return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function _lum(hex) {
	const m = hex
		.replace("#", "")
		.match(/.{2}/g)
		.map((h) => Number.parseInt(h, 16));
	const [r, g, b] = m.map(_srgb);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function _ratio(a, b) {
	const [la, lb] = [_lum(a), _lum(b)].sort((x, y) => y - x);
	return (la + 0.05) / (lb + 0.05);
}
function _gradeText(r) {
	if (r >= 7) return { grade: "AAA", color: "var(--green)", bg: "rgba(34,197,94,.12)" };
	if (r >= 4.5) return { grade: "AA", color: "var(--amber-d)", bg: "rgba(245,158,11,.15)" };
	return { grade: "FAIL", color: "var(--red)", bg: "rgba(239,68,68,.12)" };
}

const LIGHT_TOKENS = {
	cream: "#f5f3f0",
	cream2: "#ece8e3",
	cream3: "#e7e2dc",
	ink: "#292524",
	ink2: "#4a4641",
	ink3: "#544e48",
	ink4: "#8a8380",
	ink5: "#d6d3d1",
	amber: "#f59e0b",
	amberD: "#7c2d12",
	blue: "#1e3a8a",
	green: "#14532d",
	red: "#991b1b",
	purple: "#5b21b6",
};
const DARK_TOKENS = {
	cream: "#1c1917",
	cream2: "#292524",
	cream3: "#44403c",
	ink: "#f5f3f0",
	ink2: "#d6d3d1",
	ink3: "#b8b3af",
	ink4: "#aaa39e",
	ink5: "#44403c",
	amber: "#f59e0b",
	amberD: "#fbbf24",
	blue: "#7cb8fb",
	green: "#4ade80",
	red: "#fb8888",
	purple: "#bfa3fb",
};

function ContrastRow({ pair, p, mode }) {
	const r = _ratio(p[pair.fg], p[pair.bg]);
	const g = _gradeText(r);
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1.4fr 90px 70px 80px",
				alignItems: "center",
				gap: 12,
				padding: "8px 12px",
				borderBottom: "1px solid var(--rule)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div
					style={{
						width: 80,
						height: 36,
						borderRadius: 6,
						background: p[pair.bg],
						border: "1px solid var(--rule)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: p[pair.fg],
						fontWeight: 700,
						fontSize: 13,
					}}
				>
					Aa
				</div>
				<div>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 11,
							color: "var(--ink)",
							fontWeight: 700,
						}}
					>
						{pair.label}
					</div>
					<div style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "var(--ink-3)" }}>
						{pair.fg} on {pair.bg}
					</div>
				</div>
			</div>
			<div
				style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
			>
				{r.toFixed(2)}:1
			</div>
			<span
				style={{
					display: "inline-block",
					textAlign: "center",
					padding: "3px 10px",
					borderRadius: 999,
					fontSize: 10,
					fontFamily: "var(--mono)",
					fontWeight: 700,
					letterSpacing: ".06em",
					color: g.color,
					background: g.bg,
					width: "fit-content",
				}}
			>
				{g.grade}
			</span>
			<div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{pair.use}</div>
		</div>
	);
}

const PAIRS = [
	{ fg: "ink", bg: "cream", label: "Body text", use: "Headings, copy" },
	{ fg: "ink2", bg: "cream", label: "Secondary", use: "Sub-headings" },
	{ fg: "ink3", bg: "cream", label: "Tertiary / labels", use: "Captions, mono labels" },
	{ fg: "ink4", bg: "cream", label: "Decorative", use: "Hints, dividers (UI)" },
	{ fg: "ink", bg: "cream2", label: "On surface", use: "Cards, inputs" },
	{ fg: "amberD", bg: "cream", label: "Links / accent text", use: "Inline links" },
	{ fg: "blue", bg: "cream", label: "Info text", use: "Banners, badges" },
	{ fg: "green", bg: "cream", label: "Success text", use: "Confirmations" },
	{ fg: "red", bg: "cream", label: "Error text", use: "Validation" },
	{ fg: "purple", bg: "cream", label: "Marker text", use: "Tags, highlights" },
	{ fg: "cream", bg: "ink", label: "Inverse", use: "Dark buttons, footer" },
];

function ContrastTable({ mode }) {
	const p = mode === "dark" ? DARK_TOKENS : LIGHT_TOKENS;
	const isDark = mode === "dark";
	return (
		<div
			style={{
				borderRadius: 10,
				overflow: "hidden",
				border: "1px solid var(--rule)",
				background: isDark ? "#1c1917" : "#f5f3f0",
			}}
		>
			<div
				style={{
					padding: "10px 14px",
					background: isDark ? "#292524" : "#ece8e3",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: "1px solid var(--rule)",
				}}
			>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9.5,
						letterSpacing: ".1em",
						textTransform: "uppercase",
						fontWeight: 700,
						color: isDark ? "#f5f3f0" : "#292524",
					}}
				>
					{mode} mode · {PAIRS.length} pairs
				</span>
				<span style={{ fontSize: 11, color: isDark ? "#b8b3af" : "#544e48" }}>
					Target: 7:1 for AAA · 4.5:1 for AA
				</span>
			</div>
			<div
				style={{
					"--ink": isDark ? "#f5f3f0" : "#292524",
					"--ink-2": isDark ? "#d6d3d1" : "#4a4641",
					"--ink-3": isDark ? "#b8b3af" : "#544e48",
					"--rule": isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)",
				}}
			>
				{PAIRS.map((pair, i) => (
					<ContrastRow key={i} pair={pair} p={p} mode={mode} />
				))}
			</div>
		</div>
	);
}

function FocusRingDemo() {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
			{[
				{
					label: "Button",
					el: (
						<button
							className="ds-btn dark"
							style={{ boxShadow: "var(--focus-ring)", borderColor: "var(--focus)" }}
						>
							Submit
						</button>
					),
				},
				{
					label: "Input",
					el: (
						<input
							className="ds-input"
							defaultValue="Sarah Marshall"
							style={{ boxShadow: "var(--focus-ring)", borderColor: "var(--focus)", maxWidth: 200 }}
						/>
					),
				},
				{
					label: "Checkbox",
					el: (
						<label className="ds-check-label">
							<span className="ds-checkbox checked" style={{ boxShadow: "var(--focus-ring)" }}>
								<svg
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#fff"
									strokeWidth="3.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</span>
							Notify me
						</label>
					),
				},
				{
					label: "Toggle",
					el: (
						<div className="ds-toggle on" style={{ boxShadow: "var(--focus-ring)" }}>
							<div className="ds-toggle-thumb" />
						</div>
					),
				},
				{
					label: "Link",
					el: (
						<a
							href="#"
							onClick={(e) => e.preventDefault()}
							style={{
								color: "var(--amber-d)",
								textDecoration: "underline",
								textUnderlineOffset: 3,
								fontWeight: 600,
								fontSize: 13.5,
								padding: "4px 6px",
								borderRadius: 4,
								boxShadow: "var(--focus-ring)",
								outline: "none",
							}}
						>
							View application
						</a>
					),
				},
				{
					label: "Sidebar item",
					el: (
						<div
							style={{
								padding: "7px 12px",
								background: "var(--ink)",
								color: "var(--cream)",
								borderRadius: 8,
								fontSize: 12.5,
								fontWeight: 600,
								boxShadow: "var(--focus-ring)",
							}}
						>
							Applications
						</div>
					),
				},
			].map((d, i) => (
				<div
					key={i}
					style={{
						padding: 18,
						background: "var(--cream-2)",
						borderRadius: 12,
						border: "1px solid var(--rule)",
					}}
				>
					<div
						style={{
							fontFamily: "var(--mono)",
							fontSize: 9.5,
							color: "var(--ink-3)",
							letterSpacing: ".08em",
							textTransform: "uppercase",
							fontWeight: 700,
							marginBottom: 14,
						}}
					>
						{d.label}
					</div>
					<div style={{ display: "flex", alignItems: "center", minHeight: 36 }}>{d.el}</div>
				</div>
			))}
		</div>
	);
}

function PostureCard({ title, body, status, num }) {
	const colors = {
		yes: { c: "var(--green)", bg: "rgba(34,197,94,.18)", label: "Met" },
		partial: { c: "var(--amber-d)", bg: "rgba(245,158,11,.18)", label: "Partial" },
		todo: { c: "var(--ink-3)", bg: "var(--cream-2)", label: "Roadmap" },
	};
	const s = colors[status];
	return (
		<div
			style={{
				padding: 18,
				background: "var(--cream-2)",
				border: "1px solid var(--rule)",
				borderRadius: 12,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					marginBottom: 10,
				}}
			>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 11,
						color: "var(--ink-3)",
						letterSpacing: ".1em",
						fontWeight: 700,
					}}
				>
					{num}
				</span>
				<span
					style={{
						fontFamily: "var(--mono)",
						fontSize: 9,
						padding: "3px 8px",
						borderRadius: 999,
						color: s.c,
						background: s.bg,
						letterSpacing: ".06em",
						textTransform: "uppercase",
						fontWeight: 800,
						border: "1px solid currentColor",
					}}
				>
					{s.label}
				</span>
			</div>
			<div
				style={{
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 15,
					marginBottom: 6,
					letterSpacing: "-.01em",
					color: "var(--ink)",
				}}
			>
				{title}
			</div>
			<div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>{body}</div>
		</div>
	);
}

function KeyboardShortcuts() {
	const groups = [
		{
			name: "Navigation",
			items: [
				["Tab", "Move forward through interactive elements"],
				["Shift + Tab", "Move backward"],
				["↑ / ↓", "Move within lists, menus, segmented controls"],
				["Enter / Space", "Activate the focused element"],
				["Esc", "Dismiss modals, popovers, command palette"],
			],
		},
		{
			name: "Application shortcuts",
			items: [
				["⌘K", "Open command palette"],
				["⌘/", "Open keyboard shortcuts overlay"],
				["⌘.", "Toggle theme (light / dark)"],
				["⌘⇧A", "Add new application"],
				["G then I", "Go to Inbox"],
				["G then C", "Go to Calendar"],
			],
		},
	];
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
			{groups.map((g) => (
				<div key={g.name}>
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
						{g.name}
					</div>
					<div
						style={{
							borderRadius: 10,
							border: "1px solid var(--rule)",
							background: "var(--cream-2)",
							overflow: "hidden",
						}}
					>
						{g.items.map(([k, d], i) => (
							<div
								key={i}
								style={{
									display: "flex",
									alignItems: "center",
									padding: "9px 14px",
									borderBottom: i < g.items.length - 1 ? "1px solid var(--rule)" : "none",
									gap: 12,
								}}
							>
								<span
									className="ds-kbd"
									style={{ minWidth: 92, textAlign: "center", fontSize: 11, padding: "3px 8px" }}
								>
									{k}
								</span>
								<span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{d}</span>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function AccessibilitySection() {
	return (
		<div>
			<DSSubsection title="Accessibility Posture">
				<p
					style={{
						fontSize: 13,
						color: "var(--ink-2)",
						marginBottom: 22,
						lineHeight: 1.6,
						maxWidth: 720,
					}}
				>
					JobDash targets <strong>WCAG 2.2 AAA</strong> for body text and AA-or-better for UI
					elements. Every colour pair below has been re-tuned from defaults to clear that bar in
					both light and dark modes. Where AAA is impossible without flattening hierarchy, we flag
					the pair so it doesn't carry meaning that text alone can't recover.
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: 14,
						marginBottom: 28,
					}}
				>
					<PostureCard
						num="01"
						title="Colour contrast"
						status="yes"
						body="All text pairs meet AAA (7:1) in both modes. Decorative-only colours are flagged and never carry meaning alone."
					/>
					<PostureCard
						num="02"
						title="Keyboard navigation"
						status="yes"
						body="Every interactive surface is reachable by tab. Focus order matches visual order. Skip-to-content link in app shell."
					/>
					<PostureCard
						num="03"
						title="Visible focus"
						status="yes"
						body="Every interactive element has a visible focus ring meeting 3:1 against adjacent colours. Custom amber ring in both modes."
					/>
					<PostureCard
						num="04"
						title="Reduced motion"
						status="yes"
						body="Honours prefers-reduced-motion. Animations fall back to instant state changes; transitions cap at 200ms otherwise."
					/>
					<PostureCard
						num="05"
						title="ARIA + semantics"
						status="yes"
						body="Native HTML where possible; ARIA roles on composite widgets (radiogroup, tabs, dialog, menu, listbox)."
					/>
					<PostureCard
						num="06"
						title="Screen reader labels"
						status="yes"
						body="Every icon-only control has aria-label. Decorative icons use aria-hidden. Live regions for toast and inbox."
					/>
					<PostureCard
						num="07"
						title="Touch targets"
						status="yes"
						body="44×44px minimum on mobile; 30×30 minimum on desktop with 8px hit-slop. Density modes preserve floor."
					/>
					<PostureCard
						num="08"
						title="Form errors"
						status="yes"
						body="Inline errors with role=alert, programmatically tied to inputs via aria-describedby. Never colour-only."
					/>
				</div>
			</DSSubsection>

			<DSSubsection title="Contrast — Light Mode">
				<ContrastTable mode="light" />
			</DSSubsection>

			<DSSubsection title="Contrast — Dark Mode">
				<ContrastTable mode="dark" />
			</DSSubsection>

			<DSSubsection title="Focus States">
				<p
					style={{
						fontSize: 12,
						color: "var(--ink-3)",
						marginBottom: 16,
						lineHeight: 1.5,
						maxWidth: 640,
					}}
				>
					A 3px amber ring with 0.45 opacity background, automatically inverted to a brighter amber
					in dark mode. Always combined with a border colour change so the ring isn't the sole
					indicator.
				</p>
				<FocusRingDemo />
			</DSSubsection>

			<DSSubsection title="Keyboard Reference">
				<KeyboardShortcuts />
			</DSSubsection>

			<DSSubsection title="Code Snippets">
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
					<div
						style={{
							borderRadius: 10,
							overflow: "hidden",
							background: "#1c1917",
							border: "1px solid rgba(255,255,255,.08)",
						}}
					>
						<div
							style={{
								padding: "10px 14px",
								borderBottom: "1px solid rgba(255,255,255,.08)",
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "rgba(245,243,240,.6)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
							}}
						>
							Icon-only button
						</div>
						<pre
							style={{
								margin: 0,
								padding: 14,
								fontFamily: "var(--mono)",
								fontSize: 11,
								lineHeight: 1.7,
								color: "rgba(245,243,240,.9)",
								overflow: "auto",
							}}
						>{`<button
  type="button"
  aria-label="Archive application"
  onClick={archive}>
  <ArchiveIcon aria-hidden="true" />
</button>`}</pre>
					</div>
					<div
						style={{
							borderRadius: 10,
							overflow: "hidden",
							background: "#1c1917",
							border: "1px solid rgba(255,255,255,.08)",
						}}
					>
						<div
							style={{
								padding: "10px 14px",
								borderBottom: "1px solid rgba(255,255,255,.08)",
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "rgba(245,243,240,.6)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
							}}
						>
							Form error tied to input
						</div>
						<pre
							style={{
								margin: 0,
								padding: 14,
								fontFamily: "var(--mono)",
								fontSize: 11,
								lineHeight: 1.7,
								color: "rgba(245,243,240,.9)",
								overflow: "auto",
							}}
						>{`<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-err" />
{hasError && (
  <p id="email-err" role="alert">
    Enter a valid email.
  </p>
)}`}</pre>
					</div>
					<div
						style={{
							borderRadius: 10,
							overflow: "hidden",
							background: "#1c1917",
							border: "1px solid rgba(255,255,255,.08)",
						}}
					>
						<div
							style={{
								padding: "10px 14px",
								borderBottom: "1px solid rgba(255,255,255,.08)",
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "rgba(245,243,240,.6)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
							}}
						>
							Reduced motion
						</div>
						<pre
							style={{
								margin: 0,
								padding: 14,
								fontFamily: "var(--mono)",
								fontSize: 11,
								lineHeight: 1.7,
								color: "rgba(245,243,240,.9)",
								overflow: "auto",
							}}
						>{`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`}</pre>
					</div>
					<div
						style={{
							borderRadius: 10,
							overflow: "hidden",
							background: "#1c1917",
							border: "1px solid rgba(255,255,255,.08)",
						}}
					>
						<div
							style={{
								padding: "10px 14px",
								borderBottom: "1px solid rgba(255,255,255,.08)",
								fontFamily: "var(--mono)",
								fontSize: 9.5,
								color: "rgba(245,243,240,.6)",
								letterSpacing: ".08em",
								textTransform: "uppercase",
								fontWeight: 700,
							}}
						>
							Skip link + sr-only
						</div>
						<pre
							style={{
								margin: 0,
								padding: 14,
								fontFamily: "var(--mono)",
								fontSize: 11,
								lineHeight: 1.7,
								color: "rgba(245,243,240,.9)",
								overflow: "auto",
							}}
						>{`<a href="#main" className="sr-only
            focus:not-sr-only">
  Skip to main content
</a>
<main id="main">{/* ... */}</main>

/* sr-only utility */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}`}</pre>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { AccessibilitySection });
