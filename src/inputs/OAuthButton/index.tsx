import { type ButtonHTMLAttributes, type CSSProperties, forwardRef } from "react";

export type OAuthProvider = "google" | "github" | "apple";

export interface OAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** OAuth provider — determines logo + default label. @default "google" */
	provider?: OAuthProvider;
	/** Override the button label (defaults to "Continue with {Provider}"). */
	label?: string;
	/** When true, renders inverted for dark surfaces. @default false */
	dark?: boolean;
}

// Geometry (height/radius/font/padding/gap/transition) lives in primitives.css
// under `.ds-atom-oauthbtn` so the theme layer can override. Inline style is
// reserved for prop-derived swaps (dark mode bg/color/border).
const labels: Record<OAuthProvider, string> = {
	google: "Continue with Google",
	github: "Continue with GitHub",
	apple: "Continue with Apple",
};

/**
 * OAuth provider button. Renders the provider's official logo + a label
 * styled to match DS Button conventions (44px height, 9px radius, transitions).
 *
 * Hooks into press feedback via `.ds-atom-oauthbtn:active { transform: scale(.97); }`
 * defined in primitives.css.
 *
 * @example
 * <OAuthButton provider="google" type="submit" />
 * <OAuthButton provider="github" dark />
 */
export const OAuthButton = forwardRef<HTMLButtonElement, OAuthButtonProps>(function OAuthButton(
	{ provider = "google", label, dark = false, type = "button", className, style, ...rest },
	ref,
) {
	const composedStyle: CSSProperties = {
		background: dark ? "rgba(255,255,255,.06)" : "#fff",
		color: dark ? "var(--cream)" : "var(--ink-2)",
		border: dark ? "1.5px solid rgba(255,255,255,.2)" : "1.5px solid var(--wire)",
		...style,
	};
	return (
		<button
			ref={ref}
			type={type}
			className={`ds-atom-oauthbtn${className ? ` ${className}` : ""}`}
			data-provider={provider}
			data-dark={dark ? "true" : undefined}
			style={composedStyle}
			{...rest}
		>
			<ProviderLogo provider={provider} />
			<span>{label ?? labels[provider]}</span>
		</button>
	);
});

function ProviderLogo({ provider }: { provider: OAuthProvider }) {
	if (provider === "google") return <GoogleLogo />;
	if (provider === "github") return <GitHubLogo />;
	if (provider === "apple") return <AppleLogo />;
	return null;
}

function GoogleLogo() {
	return (
		<svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
			<path
				fill="#FFC107"
				d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-11.3 8 12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"
			/>
			<path
				fill="#FF3D00"
				d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a12 12 0 0 1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
			/>
			<path
				fill="#4CAF50"
				d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 12.7 28.3l-6.5 5A20 20 0 0 0 24 44z"
			/>
			<path
				fill="#1976D2"
				d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.3a20 20 0 0 0 6.1-18.3z"
			/>
		</svg>
	);
}

function GitHubLogo() {
	return (
		<svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="currentColor"
				d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.3-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.3a11 11 0 0 1 6 0c2.3-1.6 3.3-1.3 3.3-1.3.7 1.7.3 3 .1 3.3a4.8 4.8 0 0 1 1.3 3.3c0 4.7-2.9 5.7-5.6 6 .5.4.9 1.2.9 2.3v3.5c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
			/>
		</svg>
	);
}

function AppleLogo() {
	return (
		<svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="currentColor"
				d="M17.6 12.5c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.8 3-.8 1.4 0 1.8.8 3 .7 1.3 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zm-2.3-7c.6-.8 1.1-1.9 1-3a4 4 0 0 0-2.7 1.4c-.6.7-1.1 1.7-1 2.8 1.1.1 2.1-.5 2.7-1.2z"
			/>
		</svg>
	);
}
