/* ═══ IMAGE / MEDIA CARDS ═══ */

function PlaceholderImg({ label, aspect = "16/9", bg = "var(--cream-2)" }) {
	return (
		<div
			style={{
				aspectRatio: aspect,
				background: bg,
				borderRadius: 10,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundImage:
					"repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,.02) 8px, rgba(0,0,0,.02) 9px)",
				overflow: "hidden",
				position: "relative",
			}}
		>
			<span
				style={{
					fontFamily: "var(--mono)",
					fontSize: 10,
					color: "var(--ink-4)",
					textTransform: "uppercase",
					letterSpacing: ".06em",
					fontWeight: 600,
					opacity: 0.7,
				}}
			>
				{label}
			</span>
		</div>
	);
}

function MediaCard({ title, subtitle, badge, aspect = "16/9", imgLabel, overlay }) {
	const [hovered, setHovered] = React.useState(false);
	return (
		<div
			className="glass"
			style={{
				borderRadius: 14,
				overflow: "hidden",
				cursor: "pointer",
				transition: "box-shadow .15s, border-color .15s",
			}}
			onMouseOver={(e) => {
				setHovered(true);
				e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)";
			}}
			onMouseOut={(e) => {
				setHovered(false);
				e.currentTarget.style.boxShadow = "";
			}}
		>
			<div style={{ position: "relative", overflow: "hidden" }}>
				<PlaceholderImg label={imgLabel || "cover image"} aspect={aspect} />
				{badge && (
					<span
						className="ds-badge upcoming"
						style={{ position: "absolute", top: 8, right: 8, fontSize: 8, padding: "2px 7px" }}
					>
						{badge}
					</span>
				)}
				{overlay && hovered && (
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: "rgba(0,0,0,.4)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "opacity .15s",
						}}
					>
						<button
							className="ds-btn"
							style={{ background: "#fff", color: "var(--ink)", fontWeight: 600, fontSize: 12 }}
						>
							{overlay}
						</button>
					</div>
				)}
			</div>
			<div style={{ padding: "12px 14px" }}>
				<div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13.5 }}>{title}</div>
				{subtitle && (
					<div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{subtitle}</div>
				)}
			</div>
		</div>
	);
}

function GalleryCard({ label, count }) {
	return (
		<div className="glass" style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gridTemplateRows: "1fr 1fr",
					gap: 2,
					aspectRatio: "1/1",
				}}
			>
				<PlaceholderImg label="" aspect="1/1" bg="var(--cream-2)" />
				<PlaceholderImg label="" aspect="1/1" bg="var(--cream-3)" />
				<PlaceholderImg label="" aspect="1/1" bg="var(--cream-3)" />
				<div
					style={{
						background: "var(--ink)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "var(--cream)",
						fontFamily: "var(--mono)",
						fontSize: 12,
						fontWeight: 700,
					}}
				>
					+{count}
				</div>
			</div>
			<div
				style={{
					padding: "10px 14px",
					fontFamily: "var(--display)",
					fontWeight: 700,
					fontSize: 13,
				}}
			>
				{label}
			</div>
		</div>
	);
}

function MediaCardsSection() {
	return (
		<div>
			<DSSubsection title="Media Cards">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Cards with image/cover areas. Supports hover overlays, badges, and various aspect ratios.
					Use striped placeholders where real imagery will go.
				</p>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
					<MediaCard
						title="Company Culture"
						subtitle="12 photos from the office"
						imgLabel="hero photo"
						badge="New"
						overlay="View Gallery"
					/>
					<MediaCard
						title="Interview Prep"
						subtitle="Video recording — 24 min"
						imgLabel="video thumbnail"
						aspect="16/10"
						overlay="Play"
					/>
					<MediaCard
						title="Offer Letter"
						subtitle="PDF document"
						imgLabel="document preview"
						aspect="4/3"
					/>
				</div>
			</DSSubsection>

			<DSSubsection title="Aspect Ratios">
				<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
					{[
						{ label: "16:9", aspect: "16/9" },
						{ label: "4:3", aspect: "4/3" },
						{ label: "1:1", aspect: "1/1" },
						{ label: "3:4", aspect: "3/4" },
					].map((r) => (
						<div key={r.label}>
							<PlaceholderImg label={r.label} aspect={r.aspect} />
							<div
								style={{
									fontFamily: "var(--mono)",
									fontSize: 9,
									color: "var(--ink-4)",
									fontWeight: 600,
									textAlign: "center",
									marginTop: 6,
								}}
							>
								{r.label}
							</div>
						</div>
					))}
				</div>
			</DSSubsection>

			<DSSubsection title="Gallery Grid + Mosaic">
				<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
					<GalleryCard label="Screenshots" count={8} />
					<GalleryCard label="Team Photos" count={14} />
					<div
						className="glass"
						style={{ borderRadius: 14, gridColumn: "span 2", overflow: "hidden" }}
					>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "2fr 1fr",
								gridTemplateRows: "1fr 1fr",
								gap: 2,
								height: "100%",
							}}
						>
							<div style={{ gridRow: "span 2" }}>
								<PlaceholderImg label="featured" aspect="" bg="var(--cream-2)" />
							</div>
							<PlaceholderImg label="" aspect="" bg="var(--cream-3)" />
							<PlaceholderImg label="" aspect="" bg="var(--cream-2)" />
						</div>
					</div>
				</div>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, { MediaCardsSection });
