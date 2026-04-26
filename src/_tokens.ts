import type { CSSProperties } from "react";

export const glass: CSSProperties = {
	background: "var(--g-bg)",
	backdropFilter: "blur(var(--g-blur))",
	WebkitBackdropFilter: "blur(var(--g-blur))",
	border: "1px solid var(--g-bd)",
	borderRadius: "var(--radius-xl)",
};

export const glassSubtle: CSSProperties = {
	background: "rgba(255,255,255,.85)",
	backdropFilter: "blur(6px)",
	WebkitBackdropFilter: "blur(6px)",
	border: "1px solid rgba(0,0,0,.05)",
	borderRadius: "var(--radius-xl)",
};

export const glassHeavy: CSSProperties = {
	background: "rgba(255,255,255,.4)",
	backdropFilter: "blur(22px)",
	WebkitBackdropFilter: "blur(22px)",
	border: "1px solid rgba(255,255,255,.5)",
	borderRadius: "var(--radius-xl)",
};

export const label: CSSProperties = {
	fontFamily: "var(--mono)",
	fontSize: 10,
	fontWeight: 600,
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	color: "var(--ink-3)",
};

export const focusRing: CSSProperties = {
	outline: "none",
	borderColor: "var(--amber)",
	boxShadow: "0 0 0 3px rgba(245,158,11,.12)",
};
