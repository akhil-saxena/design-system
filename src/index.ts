// @akhil-saxena/design-system v0.1.0 — barrel exports.

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { TextInput, type TextInputProps } from "./TextInput";
export { Textarea, type TextareaProps } from "./Textarea";
export { Badge, type BadgeProps, type BadgeTone } from "./Badge";
export { Chip, type ChipProps, type ChipTone } from "./Chip";
export {
	Avatar,
	AvatarStack,
	deriveGradient,
	deriveInitials,
	type AvatarPresence,
	type AvatarProps,
	type AvatarSize,
	type AvatarStackProps,
} from "./Avatar";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from "./Radio";
export { Toggle, type ToggleProps } from "./Toggle";
export { NumberStepper, type NumberStepperProps } from "./NumberStepper";
export { RollingNumber, type RollingNumberProps } from "./RollingNumber";
export { RangeSlider, type RangeSliderProps } from "./RangeSlider";
export { StarRating, type StarRatingProps, type StarRatingSize } from "./StarRating";
export { StickyNote, type StickyNoteProps, type StickyNoteRotation } from "./StickyNote";
export { Card, type CardProps, type CardVariant } from "./Card";
export { DSPortal, type DSPortalProps } from "./_internals/DSPortal";
export { Tooltip, type TooltipPlacement, type TooltipProps } from "./Tooltip";
export {
	ContextMenu,
	Popover,
	type ContextMenuItem,
	type ContextMenuProps,
	type PopoverPlacement,
	type PopoverProps,
	type PopoverVariant,
} from "./Popover";
export {
	ConfirmDialog,
	Modal,
	type ConfirmDialogProps,
	type ModalProps,
	type ModalRole,
} from "./Modal";
export { Sheet, type SheetProps, type SheetSide } from "./Sheet";
export { HoverCard, type HoverCardPlacement, type HoverCardProps } from "./HoverCard";
export {
	BottomSheet,
	type BottomSheetHeight,
	type BottomSheetProps,
} from "./BottomSheet";
export { Lightbox, type LightboxItem, type LightboxProps } from "./Lightbox";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar";
export { Skeleton, type SkeletonProps, type SkeletonShape } from "./Skeleton";
export {
	InlineConfirm,
	type InlineConfirmProps,
	type InlineConfirmTriggerProps,
} from "./InlineConfirm";
export { AlertBanner, type AlertBannerProps, type AlertBannerTone } from "./AlertBanner";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export {
	ToastProvider,
	useToast,
	type ToastOptions,
	type ToastProviderProps,
	type ToastTone,
} from "./Toast";
export { CopyToClipboard, type CopyToClipboardProps } from "./CopyToClipboard";
export { DatePicker, type DatePickerProps } from "./DatePicker";
export {
	SplitButton,
	type SplitButtonAction,
	type SplitButtonProps,
} from "./SplitButton";
export { MultiSelect, type MultiSelectOption, type MultiSelectProps } from "./MultiSelect";
export { Select, type SelectOption, type SelectProps } from "./Select";
export {
	DateRangePicker,
	type DateRange,
	type DateRangePickerProps,
} from "./DateRangePicker";
export { Autocomplete, type AutocompleteProps } from "./Autocomplete";

export {
	SegmentedControl,
	type SegmentedControlProps,
	type SegmentedOption,
} from "./SegmentedControl";

// Internal Icon wrapper, exposed publicly so consumers can wrap arbitrary lucide icons.
// Pre-wrapped common icons live in @akhil-saxena/design-system/icons subpath.
export { Icon, type IconProps } from "./_internals/Icon";

export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps } from "./Breadcrumbs";
export { Timeline, type TimelineProps, type TimelineEvent } from "./Timeline";
export { InfiniteList, type InfiniteListProps } from "./InfiniteList";
export { Accordion, type AccordionProps, type AccordionItemProps } from "./Accordion";
export { Carousel, type CarouselProps, type CarouselSlide } from "./Carousel";
export { Tabs, type TabsProps, type TabItem } from "./Tabs";
export { Table, type TableRootProps, type TableHeaderCellProps } from "./Table";
export { Calendar, type CalendarProps, type CalendarEvent } from "./Calendar";
