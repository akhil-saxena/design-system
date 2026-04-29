import type { LucideIcon, LucideProps } from "lucide-react";
/**
 * Brand-lock icon wrapper (DS-60, D-17-02). Owns size/strokeWidth/color
 * defaults + aria toggle. Exported publicly via main barrel as Icon;
 * pre-wrapped icons live in src/icons/index.ts via wrap().
 */
import {
	type ForwardRefExoticComponent,
	type ReactNode,
	type RefAttributes,
	forwardRef,
} from "react";

export interface IconProps extends Omit<LucideProps, "ref"> {
	icon?: LucideIcon;
	children?: ReactNode;
}

const ICON_DEFAULTS = {
	size: 20,
	strokeWidth: 1.5,
	color: "currentColor",
} as const;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
	{ icon: IconComponent, children, "aria-label": ariaLabel, ...rest },
	ref,
) {
	const a11y = ariaLabel
		? { "aria-label": ariaLabel, role: "img" as const }
		: { "aria-hidden": true as const };
	if (IconComponent) {
		// Defaults BEFORE rest spread so consumer overrides win.
		return <IconComponent ref={ref} {...ICON_DEFAULTS} {...rest} {...a11y} />;
	}
	// Children escape hatch — custom SVG.
	return (
		<span className="ds-atom-icon" {...a11y}>
			{children}
		</span>
	);
});

/**
 * Pre-bind a lucide icon with brand-lock defaults. Used by src/icons/index.ts.
 * Returns a component callable as <ChevronDown size={14} /> with all the Icon
 * defaults already applied — so callers don't need to pass `icon={LucideChevronDown}`.
 */
export function wrap(
	LucideIconComponent: LucideIcon,
): ForwardRefExoticComponent<Omit<IconProps, "icon"> & RefAttributes<SVGSVGElement>> {
	const Wrapped = forwardRef<SVGSVGElement, Omit<IconProps, "icon">>(
		function WrappedIcon(props, ref) {
			return <Icon ref={ref} icon={LucideIconComponent} {...props} />;
		},
	);
	// Preserve the lucide icon's display name for devtools.
	Wrapped.displayName = `wrap(${LucideIconComponent.displayName ?? "LucideIcon"})`;
	return Wrapped;
}
