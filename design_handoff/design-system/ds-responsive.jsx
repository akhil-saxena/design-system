/* ═══ RESPONSIVE TOKENS & GRID ═══ */

function BreakpointBar({ name, width, color, active }) {
	const maxW = 500;
	const pct = Math.min(width / 1440, 1) * 100;
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
			<div
				style={{
					width: 40,
					fontFamily: "var(--mono)",
					fontSize: 10,
					fontWeight: 700,
					color: active ? "var(--ink)" : "var(--ink-4)",
					textAlign: "right",
				}}
			>
				{name}
			</div>
			<div style={{ flex: 1, position: "relative", height: 20 }}>
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 4,
						width: "100%",
						height: 12,
						background: "var(--cream-2)",
						borderRadius: 6,
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 0,
						top: 4,
						width: `${pct}%`,
						height: 12,
						background: color,
						borderRadius: 6,
						opacity: active ? 1 : 0.35,
						transition: "opacity .15s",
					}}
				/>
			</div>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontSize: 10,
					color: "var(--ink-4)",
					width: 48,
					textAlign: "right",
				}}
			>
				{width}px
			</div>
		</div>
	);
}

function SpacingToken({ name, px }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontSize: 10,
					fontWeight: 600,
					color: "var(--ink-3)",
					width: 28,
					textAlign: "right",
				}}
			>
				{name}
			</div>
			<div
				style={{
					width: px,
					height: 14,
					background: "var(--amber)",
					borderRadius: 2,
					opacity: 0.5,
					transition: "width .2s",
				}}
			/>
			<div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>{px}px</div>
		</div>
	);
}

function GridDemo({ cols, gap = 12, label }) {
	return (
		<div>
			<div
				style={{
					fontFamily: "var(--mono)",
					fontSize: 9,
					color: "var(--ink-4)",
					fontWeight: 600,
					marginBottom: 6,
				}}
			>
				{label}
			</div>
			<div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gap }}>
				{Array.from({ length: cols }, (_, i) => (
					<div
						key={i}
						style={{
							height: 32,
							borderRadius: 6,
							background: "var(--amber)",
							opacity: 0.12 + (i % 2) * 0.08,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontFamily: "var(--mono)",
							fontSize: 9,
							color: "var(--amber-d)",
							fontWeight: 700,
						}}
					>
						{i + 1}
					</div>
				))}
			</div>
		</div>
	);
}

function ResponsiveSection() {
	const [activeBreakpoint, setActiveBreakpoint] = React.useState("md");

	const breakpoints = [
		{ name: "xs", width: 375, label: "Mobile S", color: "var(--red-vivid)" },
		{ name: "sm", width: 640, label: "Mobile L", color: "var(--amber-vivid)" },
		{ name: "md", width: 768, label: "Tablet", color: "var(--amber)" },
		{ name: "lg", width: 1024, label: "Desktop", color: "var(--blue-vivid)" },
		{ name: "xl", width: 1280, label: "Wide", color: "var(--purple-vivid)" },
		{ name: "2xl", width: 1440, label: "Ultra", color: "var(--green-vivid)" },
	];

	return (
		<div>
			<DSSubsection title="Breakpoints">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Responsive breakpoint tokens. Hover to highlight. These define when layout shifts happen.
				</p>
				<div className="glass" style={{ borderRadius: 14, padding: 20 }}>
					{breakpoints.map((bp) => (
						<div
							key={bp.name}
							onMouseOver={() => setActiveBreakpoint(bp.name)}
							onMouseOut={() => setActiveBreakpoint(null)}
							style={{ cursor: "default" }}
						>
							<BreakpointBar
								name={bp.name}
								width={bp.width}
								color={bp.color}
								active={activeBreakpoint === bp.name}
							/>
						</div>
					))}
					<div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
						{breakpoints.map((bp) => (
							<div key={bp.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
								<span style={{ width: 8, height: 8, borderRadius: 2, background: bp.color }} />
								<span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-3)" }}>
									{bp.name}: {bp.label} ({bp.width}px)
								</span>
							</div>
						))}
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Spacing Scale">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Consistent spacing tokens used across all components. Based on a 4px base unit.
				</p>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
					<div className="glass" style={{ borderRadius: 14, padding: 20 }}>
						{[
							{ name: "0.5", px: 2 },
							{ name: "1", px: 4 },
							{ name: "2", px: 8 },
							{ name: "3", px: 12 },
							{ name: "4", px: 16 },
							{ name: "5", px: 20 },
							{ name: "6", px: 24 },
							{ name: "8", px: 32 },
							{ name: "10", px: 40 },
							{ name: "12", px: 48 },
							{ name: "16", px: 64 },
							{ name: "20", px: 80 },
						].map((s) => (
							<SpacingToken key={s.name} name={s.name} px={s.px} />
						))}
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						<div className="glass" style={{ borderRadius: 14, padding: 20 }}>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-4)",
									fontWeight: 600,
									marginBottom: 10,
								}}
							>
								BORDER RADIUS SCALE
							</div>
							<div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
								{[
									{ label: "4", r: 4 },
									{ label: "6", r: 6 },
									{ label: "8", r: 8 },
									{ label: "10", r: 10 },
									{ label: "14", r: 14 },
									{ label: "full", r: 999 },
								].map((b) => (
									<div key={b.label} style={{ textAlign: "center" }}>
										<div
											style={{
												width: 40,
												height: 40,
												borderRadius: b.r,
												background: "var(--amber)",
												opacity: 0.2,
												border: "2px solid var(--amber)",
											}}
										/>
										<div
											style={{
												fontFamily: "var(--mono)",
												fontSize: 9,
												color: "var(--ink-4)",
												marginTop: 4,
											}}
										>
											{b.label}
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="glass" style={{ borderRadius: 14, padding: 20 }}>
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-4)",
									fontWeight: 600,
									marginBottom: 10,
								}}
							>
								SHADOW SCALE
							</div>
							<div style={{ display: "flex", gap: 14 }}>
								{[
									{ label: "sm", shadow: "0 1px 2px rgba(0,0,0,.05)" },
									{ label: "md", shadow: "0 2px 8px rgba(0,0,0,.08)" },
									{ label: "lg", shadow: "0 8px 28px rgba(0,0,0,.12)" },
									{ label: "xl", shadow: "0 12px 40px rgba(0,0,0,.18)" },
								].map((s) => (
									<div key={s.label} style={{ textAlign: "center" }}>
										<div
											style={{
												width: 48,
												height: 48,
												borderRadius: 10,
												background: "var(--cream)",
												boxShadow: s.shadow,
												border: "1px solid var(--rule)",
											}}
										/>
										<div
											style={{
												fontFamily: "var(--mono)",
												fontSize: 9,
												color: "var(--ink-4)",
												marginTop: 6,
											}}
										>
											{s.label}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</DSSubsection>

			<DSSubsection title="Grid System">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					CSS Grid column layouts at different breakpoints. All grids use consistent gap tokens.
				</p>
				<div
					className="glass"
					style={{
						borderRadius: 14,
						padding: 20,
						display: "flex",
						flexDirection: "column",
						gap: 16,
					}}
				>
					<GridDemo cols={12} gap={6} label="12 COLUMNS (DESKTOP)" />
					<GridDemo cols={6} gap={8} label="6 COLUMNS (TABLET)" />
					<GridDemo cols={4} gap={10} label="4 COLUMNS (MOBILE L)" />
					<GridDemo cols={2} gap={12} label="2 COLUMNS (MOBILE S)" />
					<GridDemo cols={1} gap={12} label="1 COLUMN (STACKED)" />
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { ResponsiveSection });
