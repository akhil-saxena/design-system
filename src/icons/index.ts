// @akhil-saxena/design-system/icons — wrapped lucide-react icons (DS-60).
// Consumed via:
//   import { ChevronDown } from "@akhil-saxena/design-system/icons";
// Each icon is pre-wrapped with brand-lock defaults (size 20, stroke 1.5,
// currentColor, aria-hidden) from _internals/Icon.tsx via the wrap() helper.

import {
	AlertTriangle as L_AlertTriangle,
	Bold as L_Bold,
	Check as L_Check,
	CheckCircle2 as L_CheckCircle2,
	ChevronDown as L_ChevronDown,
	ChevronLeft as L_ChevronLeft,
	ChevronRight as L_ChevronRight,
	ChevronUp as L_ChevronUp,
	Clock as L_Clock,
	Code as L_Code,
	Copy as L_Copy,
	Heading2 as L_Heading2,
	Heading3 as L_Heading3,
	Info as L_Info,
	Italic as L_Italic,
	Link as L_Link,
	Link2 as L_Link2,
	List as L_List,
	ListOrdered as L_ListOrdered,
	Minus as L_Minus,
	Moon as L_Moon,
	MoreHorizontal as L_MoreHorizontal,
	Plus as L_Plus,
	Quote as L_Quote,
	Search as L_Search,
	Star as L_Star,
	Strikethrough as L_Strikethrough,
	Sun as L_Sun,
	Trash as L_Trash,
	Trash2 as L_Trash2,
	Underline as L_Underline,
	X as L_X,
	XCircle as L_XCircle,
} from "lucide-react";
import { wrap } from "../_internals/Icon";

// Currently-used across the 13 primitives (DS-60 sweep)
export const AlertTriangle = wrap(L_AlertTriangle);
export const Check = wrap(L_Check);
export const CheckCircle2 = wrap(L_CheckCircle2);
export const ChevronDown = wrap(L_ChevronDown);
export const ChevronLeft = wrap(L_ChevronLeft);
export const ChevronRight = wrap(L_ChevronRight);
export const Clock = wrap(L_Clock);
export const Copy = wrap(L_Copy);
export const Info = wrap(L_Info);
export const Link = wrap(L_Link);
export const Minus = wrap(L_Minus);
export const Plus = wrap(L_Plus);
export const Search = wrap(L_Search);
export const Star = wrap(L_Star);
export const Trash = wrap(L_Trash);
export const Trash2 = wrap(L_Trash2);
export const X = wrap(L_X);
export const XCircle = wrap(L_XCircle);

// Future-required by Phase 17 primitives (Plans 04, 08, 10, 11, 13)
export const Bold = wrap(L_Bold);
export const ChevronUp = wrap(L_ChevronUp);
export const Code = wrap(L_Code);
export const Heading2 = wrap(L_Heading2);
export const Heading3 = wrap(L_Heading3);
export const Italic = wrap(L_Italic);
export const Link2 = wrap(L_Link2);
export const List = wrap(L_List);
export const ListOrdered = wrap(L_ListOrdered);
export const Moon = wrap(L_Moon);
export const MoreHorizontal = wrap(L_MoreHorizontal);
export const Sun = wrap(L_Sun);
export const Quote = wrap(L_Quote);
export const Strikethrough = wrap(L_Strikethrough);
export const Underline = wrap(L_Underline);
