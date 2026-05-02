// @akhil-saxena/design-system v0.1.0 — barrel exports.

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./inputs/Button";
export { TextInput, type TextInputProps } from "./inputs/TextInput";
export { Textarea, type TextareaProps } from "./inputs/Textarea";
export { Badge, type BadgeProps, type BadgeTone } from "./inputs/Badge";
export { Chip, type ChipProps, type ChipTone } from "./inputs/Chip";
export {
	Avatar,
	AvatarStack,
	deriveGradient,
	deriveInitials,
	type AvatarPresence,
	type AvatarPresencePosition,
	type AvatarProps,
	type AvatarSize,
	type AvatarStackProps,
} from "./display/Avatar";
export { Checkbox, type CheckboxProps } from "./inputs/Checkbox";
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from "./inputs/Radio";
export { Toggle, type ToggleProps } from "./inputs/Toggle";
export { NumberStepper, type NumberStepperProps } from "./inputs/NumberStepper";
export { RollingNumber, type RollingNumberProps } from "./display/RollingNumber";
export { RangeSlider, type RangeSliderProps } from "./inputs/RangeSlider";
export { StarRating, type StarRatingProps, type StarRatingSize } from "./inputs/StarRating";
export { StickyNote, type StickyNoteProps, type StickyNoteRotation } from "./overlays/StickyNote";
export { Card, type CardProps, type CardVariant } from "./overlays/Card";
export { DSPortal, type DSPortalProps } from "./_internals/DSPortal";
export { Tooltip, type TooltipPlacement, type TooltipProps } from "./overlays/Tooltip";
export {
	ContextMenu,
	Popover,
	type ContextMenuItem,
	type ContextMenuProps,
	type PopoverPlacement,
	type PopoverProps,
	type PopoverVariant,
} from "./overlays/Popover";
export {
	ConfirmDialog,
	Modal,
	type ConfirmDialogProps,
	type ModalProps,
	type ModalRole,
} from "./overlays/Modal";
export { Sheet, type SheetProps, type SheetSide } from "./overlays/Sheet";
export { HoverCard, type HoverCardPlacement, type HoverCardProps } from "./overlays/HoverCard";
export {
	BottomSheet,
	type BottomSheetHeight,
	type BottomSheetProps,
} from "./overlays/BottomSheet";
export { Lightbox, type LightboxItem, type LightboxProps } from "./overlays/Lightbox";
export { ProgressBar, type ProgressBarProps } from "./feedback/ProgressBar";
export { Skeleton, type SkeletonProps, type SkeletonShape } from "./feedback/Skeleton";
export {
	InlineConfirm,
	type InlineConfirmProps,
	type InlineConfirmTriggerProps,
} from "./feedback/InlineConfirm";
export { AlertBanner, type AlertBannerProps, type AlertBannerTone } from "./feedback/AlertBanner";
export { EmptyState, type EmptyStateProps } from "./feedback/EmptyState";
export {
	ToastProvider,
	useToast,
	type ToastOptions,
	type ToastProviderProps,
	type ToastTone,
} from "./feedback/Toast";
export { CopyToClipboard, type CopyToClipboardProps } from "./interaction/CopyToClipboard";
export { DatePicker, type DatePickerProps } from "./inputs/DatePicker";
export {
	SplitButton,
	type SplitButtonAction,
	type SplitButtonProps,
} from "./interaction/SplitButton";
export { MultiSelect, type MultiSelectOption, type MultiSelectProps } from "./inputs/MultiSelect";
export { Select, type SelectOption, type SelectProps } from "./inputs/Select";
export {
	DateRangePicker,
	type DateRange,
	type DateRangePickerProps,
} from "./inputs/DateRangePicker";
export { Autocomplete, type AutocompleteProps } from "./inputs/Autocomplete";

export {
	SegmentedControl,
	type SegmentedControlProps,
	type SegmentedOption,
} from "./data-display/SegmentedControl";

// Internal Icon wrapper, exposed publicly so consumers can wrap arbitrary lucide icons.
// Pre-wrapped common icons live in @akhil-saxena/design-system/icons subpath.
export { Icon, type IconProps } from "./_internals/Icon";

export {
	Breadcrumbs,
	type BreadcrumbItem,
	type BreadcrumbsProps,
} from "./data-display/Breadcrumbs";
export { Timeline, type TimelineProps, type TimelineEvent } from "./data-display/Timeline";
export { InfiniteList, type InfiniteListProps } from "./data-display/InfiniteList";
export { Accordion, type AccordionProps, type AccordionItemProps } from "./data-display/Accordion";
export { Carousel, type CarouselProps, type CarouselSlide } from "./data-display/Carousel";
export { Tabs, type TabsProps, type TabItem } from "./data-display/Tabs";
export { Table, type TableRootProps, type TableHeaderCellProps } from "./data-display/Table";
export { Calendar, type CalendarProps, type CalendarEvent } from "./data-display/Calendar";
export { RichText, type RichTextProps } from "./interaction/RichText";
export { AppShell, type AppShellProps } from "./layout/AppShell";
export { AppBar, type AppBarProps, type AppBarVariant } from "./layout/AppBar";
export { Footer, type FooterProps, type FooterVariant, type FooterColumn } from "./layout/Footer";
export {
	PasswordStrength,
	FieldError,
	FormErrorSummary,
	type PasswordStrengthProps,
	type FieldErrorProps,
	type FormErrorSummaryProps,
} from "./patterns/FormValidation";
export { Coachmark, type CoachmarkProps } from "./patterns/Coachmark";
export { Wizard, type WizardProps, type WizardStep } from "./patterns/Wizard";
export { InlineEdit, type InlineEditProps } from "./interaction/InlineEdit";
export {
	SearchAndFilters,
	type SearchAndFiltersProps,
	type SearchFilter,
	type SearchSuggestion,
} from "./interaction/SearchAndFilters";
export {
	Sortable,
	SortableItem,
	SortableDndContext,
	type SortableProps,
	type SortableItemProps,
	type SortableItemData,
	type SortableDndContextProps,
} from "./interaction/Sortable";
