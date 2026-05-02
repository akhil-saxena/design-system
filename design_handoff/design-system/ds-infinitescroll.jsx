/* ═══ INFINITE / VIRTUALIZED LIST ═══ */

function InfiniteScrollList() {
	const [items, setItems] = React.useState(Array.from({ length: 12 }, (_, i) => i));
	const [loading, setLoading] = React.useState(false);
	const ref = React.useRef(null);

	const load = () => {
		if (loading) return;
		setLoading(true);
		setTimeout(() => {
			setItems((prev) => [...prev, ...Array.from({ length: 8 }, (_, i) => prev.length + i)]);
			setLoading(false);
		}, 800);
	};

	const onScroll = (e) => {
		const el = e.currentTarget;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 80 && !loading) load();
	};

	return (
		<div
			ref={ref}
			onScroll={onScroll}
			style={{
				width: "100%",
				height: 280,
				overflowY: "auto",
				borderRadius: 10,
				border: "1px solid var(--rule)",
				background: "var(--surf-1)",
			}}
		>
			{items.map((i) => (
				<div
					key={i}
					style={{
						padding: "12px 14px",
						borderBottom: "1px solid var(--rule)",
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					<div
						style={{
							width: 28,
							height: 28,
							borderRadius: "50%",
							background: `hsl(${(i * 47) % 360}, 50%, 60%)`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#fff",
							fontSize: 11,
							fontWeight: 700,
						}}
					>
						{String.fromCharCode(65 + (i % 26))}
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontWeight: 600, fontSize: 13 }}>Application #{i + 1}</div>
						<div style={{ fontSize: 11, color: "var(--ink-3)" }}>Status update {i + 1}</div>
					</div>
					<div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>
						{(i + 1) * 3}h ago
					</div>
				</div>
			))}
			{loading && (
				<div
					style={{
						padding: 20,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: 8,
						color: "var(--ink-3)",
						fontSize: 12,
					}}
				>
					<div className="ds-spinner-lg" style={{ width: 16, height: 16, borderWidth: 2 }} />
					Loading more…
				</div>
			)}
		</div>
	);
}

function LoadMoreList() {
	const [count, setCount] = React.useState(5);
	const [loading, setLoading] = React.useState(false);

	const more = () => {
		setLoading(true);
		setTimeout(() => {
			setCount((c) => c + 5);
			setLoading(false);
		}, 600);
	};

	return (
		<div
			style={{
				width: "100%",
				borderRadius: 10,
				border: "1px solid var(--rule)",
				overflow: "hidden",
				background: "var(--surf-1)",
			}}
		>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					style={{
						padding: "10px 14px",
						borderBottom: "1px solid var(--rule)",
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					<div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
					<div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Notification #{i + 1}</div>
					<div style={{ fontSize: 11, color: "var(--ink-4)" }}>{i + 1}m</div>
				</div>
			))}
			<div
				style={{
					padding: 12,
					display: "flex",
					justifyContent: "center",
					background: "var(--surf-2)",
				}}
			>
				<button className="ds-btn" onClick={more} disabled={loading}>
					{loading ? "Loading…" : `Load more (${count} of 50)`}
				</button>
			</div>
		</div>
	);
}

function VirtualScrollDemo() {
	const ROW_H = 32;
	const TOTAL = 10000;
	const VIEWPORT = 240;
	const [scrollTop, setScrollTop] = React.useState(0);

	const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - 5);
	const endIdx = Math.min(TOTAL, Math.ceil((scrollTop + VIEWPORT) / ROW_H) + 5);
	const visibleRange = [];
	for (let i = startIdx; i < endIdx; i++) visibleRange.push(i);

	return (
		<div>
			<div
				style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11, color: "var(--ink-3)" }}
			>
				<span>10,000 rows total · only {visibleRange.length} rendered</span>
			</div>
			<div
				onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
				style={{
					width: "100%",
					height: VIEWPORT,
					overflowY: "auto",
					borderRadius: 10,
					border: "1px solid var(--rule)",
					background: "var(--surf-1)",
					position: "relative",
				}}
			>
				<div style={{ height: TOTAL * ROW_H, position: "relative" }}>
					{visibleRange.map((i) => (
						<div
							key={i}
							style={{
								position: "absolute",
								top: i * ROW_H,
								left: 0,
								right: 0,
								height: ROW_H,
								padding: "0 14px",
								display: "flex",
								alignItems: "center",
								borderBottom: "1px solid var(--rule)",
								fontSize: 12,
								color: "var(--ink-2)",
							}}
						>
							<span
								style={{
									fontFamily: "var(--mono)",
									fontSize: 10,
									color: "var(--ink-4)",
									width: 50,
								}}
							>
								#{String(i + 1).padStart(5, "0")}
							</span>
							<span>Row {i + 1} · synthesized data</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function InfiniteScrollSection() {
	return (
		<div>
			<DSSubsection title="Infinite Scroll & Load More">
				<p style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.5 }}>
					Patterns for revealing long lists. Use load-more for predictable navigation, infinite
					scroll for browse-style discovery, virtualization for huge datasets.
				</p>

				<StateRow label="Infinite scroll — scroll to bottom to load more">
					<InfiniteScrollList />
				</StateRow>

				<StateRow label="Load more — explicit user action">
					<LoadMoreList />
				</StateRow>

				<StateRow label="Virtualized — only visible rows render (10,000 items)">
					<VirtualScrollDemo />
				</StateRow>
			</DSSubsection>
		</div>
	);
}

Object.assign(window, {
	InfiniteScrollList,
	LoadMoreList,
	VirtualScrollDemo,
	InfiniteScrollSection,
});
