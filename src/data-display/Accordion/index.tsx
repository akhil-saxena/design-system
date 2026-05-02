/**
 * # Usage Audit - Accordion (DS-64)
 *
 * Consumers (post v0.6):
 * - FAQ pages, settings sections, doc accordions
 *
 * API:
 * - <Accordion mode="single" | "multi">
 *     <Accordion.Item id="..." title="...">{children}</Accordion.Item>
 *   </Accordion>
 * - Controlled: openIds + onOpenIdsChange
 * - Uncontrolled: defaultOpenIds
 * - headingLevel per Item (2-6, default 3) - important for document outline
 *
 * Implementation:
 * - WAI-ARIA disclosure pattern (NOT tablist accordion antipattern)
 * - <h{N}><button aria-expanded></button></h{N}> + <div role="region">
 * - useReducedMotion gates chevron + panel CSS transitions
 */
import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useId,
	useMemo,
	useState,
} from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ChevronDown } from "../../icons";
interface AccordionContextValue {
	mode: "single" | "multi";
	openIds: string[];
	toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
	mode?: "single" | "multi";
	defaultOpenIds?: string[];
	openIds?: string[];
	onOpenIdsChange?: (ids: string[]) => void;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
	{
		mode = "single",
		defaultOpenIds,
		openIds: controlledOpenIds,
		onOpenIdsChange,
		children,
		className,
		style,
	},
	ref,
) {
	const reducedMotion = useReducedMotion();
	const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpenIds ?? []);
	const isControlled = controlledOpenIds !== undefined;
	const openIds = isControlled ? controlledOpenIds : uncontrolled;

	const toggle = useCallback(
		(id: string) => {
			const isOpen = openIds.includes(id);
			let next: string[];
			if (mode === "single") {
				next = isOpen ? [] : [id];
			} else {
				next = isOpen ? openIds.filter((x) => x !== id) : [...openIds, id];
			}
			if (!isControlled) setUncontrolled(next);
			onOpenIdsChange?.(next);
		},
		[openIds, mode, isControlled, onOpenIdsChange],
	);

	const ctx = useMemo<AccordionContextValue>(
		() => ({ mode, openIds, toggle }),
		[mode, openIds, toggle],
	);

	return (
		<div
			ref={ref}
			className={`ds-atom-accordion${className ? ` ${className}` : ""}`}
			style={style}
			data-reduced-motion={reducedMotion ? "true" : undefined}
		>
			<AccordionContext.Provider value={ctx}>{children}</AccordionContext.Provider>
		</div>
	);
});

export interface AccordionItemProps {
	id: string;
	title: React.ReactNode;
	headingLevel?: 2 | 3 | 4 | 5 | 6;
	disabled?: boolean;
	children: React.ReactNode;
}

const HEADING_TAGS: Record<2 | 3 | 4 | 5 | 6, keyof React.JSX.IntrinsicElements> = {
	2: "h2",
	3: "h3",
	4: "h4",
	5: "h5",
	6: "h6",
};

function AccordionItem({
	id,
	title,
	headingLevel = 3,
	disabled,
	children,
}: Readonly<AccordionItemProps>) {
	const ctx = useContext(AccordionContext);
	if (!ctx) throw new Error("Accordion.Item must be rendered inside <Accordion>");
	const open = ctx.openIds.includes(id);
	const generatedId = useId();
	const headerId = `${generatedId}-h`;
	const panelId = `${generatedId}-p`;

	const Heading = HEADING_TAGS[headingLevel];

	return (
		<div className="ds-atom-accordion-item" data-open={open || undefined}>
			<Heading className="ds-atom-accordion-heading">
				<button
					type="button"
					id={headerId}
					aria-expanded={open}
					aria-controls={panelId}
					disabled={disabled}
					onClick={() => ctx.toggle(id)}
					className="ds-atom-accordion-trigger"
					data-open={open || undefined}
				>
					<span className="ds-atom-accordion-title">{title}</span>
					<ChevronDown
						size={16}
						className="ds-atom-accordion-chev"
						data-open={open ? "true" : undefined}
					/>
				</button>
			</Heading>
			<section
				id={panelId}
				aria-labelledby={headerId}
				hidden={!open}
				className="ds-atom-accordion-panel"
			>
				{children}
			</section>
		</div>
	);
}

// Compound API: Accordion.Item
export const Accordion = Object.assign(AccordionRoot, { Item: AccordionItem });
