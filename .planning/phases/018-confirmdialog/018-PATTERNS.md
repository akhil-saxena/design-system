# Phase 18: ConfirmDialog — Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 5 new/modified files
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/overlays/ConfirmDialog/index.tsx` | component (overlay) | event-driven | `src/overlays/Modal/index.tsx` (ConfirmDialog section, lines 153–237) | exact |
| `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` | stories | — | `src/overlays/Modal/Modal.stories.tsx` | exact |
| `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` | test | — | `src/overlays/Modal/Modal.test.tsx` | exact |
| `src/overlays/Modal/index.tsx` | component (modify) | event-driven | self (lines 153–237 to be removed) | exact |
| `src/index.ts` | config (barrel) | — | self (lines 40–46 to be updated) | exact |

---

## Pattern Assignments

### `src/overlays/ConfirmDialog/index.tsx` (overlay component, event-driven)

**Primary analog:** `src/overlays/Modal/index.tsx`
**Secondary analogs:** `src/overlays/Sheet/index.tsx`, `src/feedback/InlineConfirm/index.tsx`

---

#### Imports pattern (from `src/overlays/Modal/index.tsx` lines 1–13)

```tsx
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import { DSPortal } from "../../_internals/DSPortal";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { Button } from "../../inputs/Button";
```

For the new ConfirmDialog, additionally import `TextInput` and `Kbd`:

```tsx
import { TextInput } from "../../inputs/TextInput";
import { Kbd } from "../../inputs/Kbd";
```

---

#### DSPortal + backdrop pattern (from `src/overlays/Modal/index.tsx` lines 116–150)

```tsx
return (
  <DSPortal>
    {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
    <div className="ds-atom-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={setPanel}
        className="ds-atom-confirm-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        {/* panel contents */}
      </div>
    </div>
  </DSPortal>
);
```

Key: reuse `ds-atom-modal-backdrop` class (already exists in primitives.css). Use `ds-atom-confirm-panel` as the new panel class (for test selectors; all visual styling is inline).

---

#### Callback-ref focus trap pattern (from `src/overlays/Modal/index.tsx` lines 83–96)

```tsx
// useState (not useRef) so the trap engages exactly when the portal commits the node
const [panel, setPanel] = useState<HTMLDivElement | null>(null);
useFocusTrap(panel, open);

useEffect(() => {
  if (!open) return;
  if (initialFocus?.current) {
    const id = window.setTimeout(() => initialFocus.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }
}, [open, initialFocus]);
```

For ConfirmDialog, there is no `initialFocus` prop — the focus trap default (first focusable element) is sufficient.

---

#### Escape + Enter keyboard handler pattern (from `src/overlays/Modal/index.tsx` lines 99–106, extended per RESEARCH.md Pattern 4)

```tsx
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && !confirmDisabled) onConfirm();
  }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open, onCancel, onConfirm, confirmDisabled]);
```

`confirmDisabled` is always `false` for ConfirmDialog; for TypeToConfirm it is `v !== guardWord`.

---

#### Early return when closed (from `src/overlays/Modal/index.tsx` line 108)

```tsx
if (!open) return null;
```

---

#### Backdrop click handler (from `src/overlays/Modal/index.tsx` lines 110–114)

```tsx
function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
  if (e.target === e.currentTarget && closeOnBackdropClick) {
    onClose();
  }
}
```

For ConfirmDialog, `closeOnBackdropClick` defaults to `false` (all tones require explicit Cancel/Confirm per RESEARCH.md open question resolution). The prop can still be accepted for caller flexibility.

---

#### aria-labelledby + aria-describedby pattern (from `src/overlays/Modal/index.tsx` lines 84–88)

```tsx
const generatedTitleId = useId();
const generatedDescId = useId();
const titleId = title ? generatedTitleId : undefined;
const descId = body ? generatedDescId : undefined;
```

---

#### Always-light panel inline style (from RESEARCH.md Pattern 5 / `design_handoff/design-system/ds-confirmdialog.jsx`)

```tsx
const panelStyle: CSSProperties = {
  width: 360,
  background: "rgba(255,255,255,.97)", // intentionally NOT var(--cream) — always-light
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  borderRadius: 14,
  border: "1px solid var(--rule)",
  padding: 22,
  boxShadow: "0 16px 48px rgba(0,0,0,.18)",
};
```

Do NOT use `var(--cream)` — it flips to near-black in dark mode.

---

#### Tone config object (from RESEARCH.md Pattern 1 / `design_handoff/design-system/ds-confirmdialog.jsx`)

```tsx
type ConfirmDialogTone = "danger" | "warn" | "success" | "neutral";

const tones: Record<ConfirmDialogTone, { color: string; bg: string; icon: ReactNode }> = {
  danger: {
    color: "var(--red)",
    bg: "rgba(239,68,68,.1)",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  warn: {
    color: "var(--amber-d)",
    bg: "rgba(245,158,11,.12)",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  success: {
    color: "var(--green)",
    bg: "rgba(34,197,94,.1)",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  neutral: {
    color: "var(--ink)",
    bg: "rgba(0,0,0,.05)",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};
```

---

#### Confirm button tone mapping (from RESEARCH.md Pattern 2, REQ-18-01 authoritative)

```tsx
// Tone → Button variant + optional inline style override
const toneButtonStyle: Record<ConfirmDialogTone, { variant: ButtonVariant; style?: CSSProperties }> = {
  danger:  { variant: "danger",    style: { background: "var(--red)", borderColor: "var(--red)" } },
  warn:    { variant: "primary",   style: undefined },
  success: { variant: "primary",   style: { background: "var(--amber-d)", borderColor: "var(--amber-d)", color: "#fff" } },
  neutral: { variant: "secondary", style: { background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" } },
};
```

---

#### Icon area layout (from `design_handoff/design-system/ds-confirmdialog.jsx` lines 15–17)

```tsx
<div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
  <div
    style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: t.bg,
      color: t.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {t.icon}
  </div>
  <div style={{ flex: 1, paddingTop: 2 }}>
    <div id={titleId} style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 5 }}>
      {title}
    </div>
    <div id={descId} style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
      {body}
    </div>
  </div>
</div>
```

---

#### Footer pattern (from `design_handoff/design-system/ds-confirmdialog.jsx` lines 23–27 + existing `src/overlays/Modal/index.tsx` lines 224–231)

```tsx
<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
  <Button variant="ghost" onClick={onCancel}>
    {cancelLabel}
  </Button>
  <Button variant={btnConfig.variant} style={btnConfig.style} onClick={onConfirm}>
    {confirmLabel}
  </Button>
</div>
```

---

#### TypeToConfirm state + comparison (from RESEARCH.md Pattern 3 / `design_handoff/design-system/ds-confirmdialog.jsx` lines 33–35)

```tsx
const [v, setV] = useState("");
const ok = v === guardWord; // NO trim, case-sensitive — CONSTRAINT-013
```

---

#### TypeToConfirm confirm button disabled state (from RESEARCH.md Pattern 3 / `design_handoff/design-system/ds-confirmdialog.jsx` line 44)

```tsx
<Button
  variant="danger"
  disabled={!ok}
  style={
    !ok
      ? { background: "var(--ink-5)", opacity: 0.6, borderColor: "transparent" }
      : { background: "var(--red)", borderColor: "transparent" }
  }
  onClick={onConfirm}
>
  {confirmLabel}
</Button>
```

---

#### TypeToConfirm hint row (from RESEARCH.md Pattern 3 / `design_handoff/design-system/ds-confirmdialog.jsx` lines 40–41)

```tsx
<div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>
  Type <Kbd size="sm">{guardWord}</Kbd> to confirm
</div>
<TextInput
  value={v}
  onChange={(e) => setV(e.target.value)}
  placeholder={`Type ${guardWord}`}
  style={{ width: "100%", marginBottom: 14 }}
/>
```

---

### `src/overlays/ConfirmDialog/ConfirmDialog.stories.tsx` (stories)

**Analog:** `src/overlays/Modal/Modal.stories.tsx`

---

#### Meta block pattern (from `src/overlays/Modal/Modal.stories.tsx` lines 135–184)

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmDialog, TypeToConfirm } from ".";
import { Button } from "../../inputs/Button";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Overlays/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "...",
      },
    },
  },
  argTypes: {
    open: { control: "boolean" },
    onClose: { control: false },
    // ...
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;
```

---

#### Demo function + Story export pattern (from `src/overlays/Modal/Modal.stories.tsx` lines 187–201)

```tsx
function DangerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        tone="danger"
        title="Delete item?"
        body="This will permanently remove the item."
        confirmLabel="Yes, delete"
      />
    </>
  );
}
export const Danger: Story = {
  parameters: { docs: { source: { code: SRC.Danger } } },
  render: () => <DangerDemo />,
};
```

Each story uses a named `function XxxDemo()` (not an inline arrow render); the `SRC` object holds the copy-paste source strings at the top of the file. Follow the Modal stories SRC pattern exactly.

---

#### Dark mode story pattern (from `src/overlays/Modal/Modal.stories.tsx` lines 275–294)

```tsx
export const DarkMode: Story = {
  parameters: { docs: { source: { code: SRC.DarkMode } } },
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{
          background: "#1c1917",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => <DangerDemo />,
};
```

Note: the ConfirmDialog panel is always-light (`rgba(255,255,255,.97)`), so the DarkMode story verifies the panel does NOT flip dark — the backdrop should go dark, the panel should stay white.

---

### `src/overlays/ConfirmDialog/ConfirmDialog.test.tsx` (test)

**Analog:** `src/overlays/Modal/Modal.test.tsx`

---

#### Test file structure (from `src/overlays/Modal/Modal.test.tsx` lines 1–10)

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, TypeToConfirm } from ".";

describe("ConfirmDialog", () => {
  // ...
});

describe("TypeToConfirm", () => {
  // ...
});
```

---

#### Portal query pattern — query by CSS class on `document.body` (from `src/overlays/Modal/Modal.test.tsx` lines 11–18)

```tsx
const panel = document.body.querySelector(".ds-atom-confirm-panel");
expect(panel).not.toBeNull();
expect(panel?.getAttribute("role")).toBe("alertdialog");
expect(panel?.getAttribute("aria-modal")).toBe("true");
```

---

#### Keyboard event pattern (from `src/overlays/Modal/Modal.test.tsx` lines 31–38)

```tsx
// Escape closes
it("calls onCancel on Escape keydown", () => {
  const onCancel = vi.fn();
  render(<ConfirmDialog open={true} onClose={onCancel} onConfirm={() => {}} tone="danger" title="Sure?" />);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onCancel).toHaveBeenCalledTimes(1);
});

// Enter confirms
it("calls onConfirm on Enter keydown", () => {
  const onConfirm = vi.fn();
  render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={onConfirm} tone="danger" title="Sure?" />);
  fireEvent.keyDown(document, { key: "Enter" });
  expect(onConfirm).toHaveBeenCalledTimes(1);
});
```

---

#### Backdrop click pattern (from `src/overlays/Modal/Modal.test.tsx` lines 41–50)

```tsx
const backdrop = document.body.querySelector(".ds-atom-modal-backdrop") as HTMLElement;
fireEvent.click(backdrop);
expect(onCancel).not.toHaveBeenCalled(); // default closeOnBackdropClick=false for ConfirmDialog
```

---

#### Button variant assertion pattern (from `src/overlays/Modal/Modal.test.tsx` lines 150–153)

```tsx
const confirmBtn = screen.getByText("Yes, delete").closest("button");
expect(confirmBtn?.getAttribute("data-variant")).toBe("danger");
```

---

#### TypeToConfirm disabled → enabled transition test pattern

```tsx
it("confirm button is disabled until exact match", () => {
  render(<TypeToConfirm open={true} onClose={() => {}} onConfirm={() => {}} title="Delete?" guardWord="DELETE" />);
  const confirmBtn = screen.getByRole("button", { name: /delete forever/i });
  expect(confirmBtn).toBeDisabled();

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "DELETE" } });
  expect(confirmBtn).not.toBeDisabled();
});

it("comparison is case-sensitive (no trim)", () => {
  render(<TypeToConfirm open={true} onClose={() => {}} onConfirm={() => {}} title="Delete?" guardWord="DELETE" />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "delete" } });
  expect(screen.getByRole("button", { name: /delete forever/i })).toBeDisabled();

  fireEvent.change(input, { target: { value: " DELETE" } }); // leading space
  expect(screen.getByRole("button", { name: /delete forever/i })).toBeDisabled();
});
```

---

### `src/overlays/Modal/index.tsx` (modify — remove lines 153–237)

**What to remove:** The entire `ConfirmDialog` section from line 153 (`// ─── ConfirmDialog`) through line 237 (closing brace of `ConfirmDialog` function), including `ConfirmDialogProps` interface and `ConfirmDialog` function export.

**What to keep:** Everything up to and including line 151 (`}` closing the `Modal` function). No other changes to the Modal implementation.

**Pattern reference:** After removal, the file ends at line 151. The only exports from this file will be `ModalRole`, `ModalProps`, and `Modal`.

---

### `src/index.ts` (modify — update lines 40–46)

**Current block** (lines 40–46):

```ts
export {
  ConfirmDialog,
  Modal,
  type ConfirmDialogProps,
  type ModalProps,
  type ModalRole,
} from "./overlays/Modal";
```

**New pattern — split into two export blocks:**

```ts
export {
  Modal,
  type ModalProps,
  type ModalRole,
} from "./overlays/Modal";

export {
  ConfirmDialog,
  TypeToConfirm,
  type ConfirmDialogProps,
  type ConfirmDialogTone,
  type TypeToConfirmProps,
} from "./overlays/ConfirmDialog";
```

**Reference for barrel export style** (from `src/index.ts` lines 49–53):

```ts
export {
  BottomSheet,
  type BottomSheetHeight,
  type BottomSheetProps,
} from "./overlays/BottomSheet";
```

All type exports use the `type` keyword inline. Named types are listed explicitly — no wildcard re-exports.

---

## Shared Patterns

### Focus Trap
**Source:** `src/overlays/Modal/index.tsx` lines 83–84
**Apply to:** `src/overlays/ConfirmDialog/index.tsx` (both ConfirmDialog and TypeToConfirm)

```tsx
const [panel, setPanel] = useState<HTMLDivElement | null>(null);
useFocusTrap(panel, open);
// ref={setPanel} on the panel div — NOT a useRef
```

### Escape Key Handler
**Source:** `src/overlays/Modal/index.tsx` lines 99–106
**Apply to:** Both ConfirmDialog and TypeToConfirm in `src/overlays/ConfirmDialog/index.tsx`

```tsx
useEffect(() => {
  if (!open) return;
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, [open, onCancel]);
```

### Biome Suppress Comment for Backdrop
**Source:** `src/overlays/Modal/index.tsx` line 118
**Apply to:** Backdrop `<div onClick={...}>` in `src/overlays/ConfirmDialog/index.tsx`

```tsx
{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is mouse-only UX; keyboard close is via the document Escape handler installed above on `document` */}
```

### Button Variant Usage
**Source:** `src/inputs/Button/index.tsx` lines 3, 51–88
**Apply to:** All Cancel/Confirm buttons in ConfirmDialog and TypeToConfirm

```tsx
// Cancel: always ghost
<Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>

// Confirm: variant + optional inline style from tone mapping
// Available variants: "primary" | "secondary" | "ghost" | "danger"
// Inline style override used for danger (var(--red)) and neutral/success custom colors
```

### forwardRef Not Needed
**Observation from all overlay analogs:** Modal, Sheet, InlineConfirm — none use `forwardRef`. These are stateful overlay components (not input primitives). ConfirmDialog and TypeToConfirm follow the same pattern: no `forwardRef`, no ref prop.

---

## No Analog Found

All files have close analogs. No entries in this section.

---

## Metadata

**Analog search scope:** `src/overlays/`, `src/feedback/`, `src/inputs/`, `src/index.ts`
**Files scanned:** 8 (Modal/index.tsx, Modal/Modal.stories.tsx, Modal/Modal.test.tsx, Sheet/index.tsx, Sheet/Sheet.test.tsx, InlineConfirm/index.tsx, Button/index.tsx, TextInput/index.tsx, Kbd/index.tsx, src/index.ts)
**Pattern extraction date:** 2026-05-05
