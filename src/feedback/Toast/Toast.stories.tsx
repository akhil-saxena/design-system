import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { ToastProvider, useToast } from ".";
import { Button } from "../../inputs/Button";
const SRC = {
	Default: `// Mount once at app root
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// Inside any component
function SaveButton() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => toast.success("Changes saved")}>Success</Button>
      <Button variant="danger" onClick={() => toast.error("Save failed - please retry")}>Error</Button>
      <Button variant="secondary" onClick={() => toast.info("Update available")}>Info</Button>
      <Button variant="ghost" onClick={() => toast.warning("Approaching usage limit")}>Warning</Button>
    </div>
  );
}`,
	Tones: `const toast = useToast();
toast.success("Saved successfully", { duration: Infinity });
toast.error("Save failed - please retry", { duration: Infinity });
toast.info("Update available", { duration: Infinity });
toast.warning("Approaching usage limit", { duration: Infinity });`,
	Stacking: `const toast = useToast();
// Fire 3 toasts (4th drops the oldest)
toast.info("First", { duration: Infinity });
toast.success("Second", { duration: Infinity });
toast.warning("Third", { duration: Infinity });
toast.error("Fourth - drops oldest", { duration: Infinity });`,
	AutoDismiss: `const toast = useToast();
// Auto-dismisses after 3s (default duration)
toast.success("Auto-dismisses in 3s (default)");`,
	Persistent: `const toast = useToast();
toast.warning("Persistent - manual dismiss only", { duration: Infinity });`,
	DarkMode: `const toast = useToast();
toast.success("Saved (dark)", { duration: Infinity });
toast.error("Failed (dark)", { duration: Infinity });
toast.info("Info (dark)", { duration: Infinity });
toast.warning("Warning (dark)", { duration: Infinity });`,
};

const meta: Meta = {
	title: "Feedback/Toast",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Context-based toast notification system; wrap the app with `ToastProvider` and call `useToast()` to imperatively show info, success, warning, or error toasts.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ToastProvider>
				<div style={{ padding: 32, minHeight: 320 }}>
					<Story />
				</div>
			</ToastProvider>
		),
	],
};

export default meta;
type Story = StoryObj;

function ToneTriggers() {
	const toast = useToast();
	return (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button onClick={() => toast.success("Changes saved")}>Success</Button>
			<Button variant="danger" onClick={() => toast.error("Save failed - please retry")}>
				Error
			</Button>
			<Button variant="secondary" onClick={() => toast.info("Update available")}>
				Info
			</Button>
			<Button variant="ghost" onClick={() => toast.warning("Approaching usage limit")}>
				Warning
			</Button>
		</div>
	);
}

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <ToneTriggers />,
};

function FireOnMount({
	tone,
	message,
	duration,
}: {
	tone: "success" | "error" | "info" | "warning";
	message: string;
	duration?: number;
}) {
	const toast = useToast();
	const fired = useRef(false);
	useEffect(() => {
		if (fired.current) return;
		fired.current = true;
		toast[tone](message, duration !== undefined ? { duration } : undefined);
	}, [toast, tone, message, duration]);
	return null;
}

export const Tones: Story = {
	parameters: { docs: { source: { code: SRC.Tones } } },
	render: () => (
		<>
			<FireOnMount
				tone="success"
				message="Saved successfully"
				duration={Number.POSITIVE_INFINITY}
			/>
			<FireOnMount
				tone="error"
				message="Save failed - please retry"
				duration={Number.POSITIVE_INFINITY}
			/>
			<FireOnMount tone="info" message="Update available" duration={Number.POSITIVE_INFINITY} />
			<FireOnMount
				tone="warning"
				message="Approaching usage limit"
				duration={Number.POSITIVE_INFINITY}
			/>
			<div style={{ color: "var(--ink-2)", fontSize: 13 }}>
				Four tones rendered above (top-right of viewport). Click X on any to dismiss.
			</div>
		</>
	),
};

function StackingDemo() {
	const toast = useToast();
	return (
		<div
			style={{
				display: "flex",
				gap: 8,
				flexDirection: "column",
				alignItems: "flex-start",
			}}
		>
			<Button
				onClick={() => {
					toast.info("First - will be dropped when 4th arrives", {
						duration: Number.POSITIVE_INFINITY,
					});
					toast.success("Second", { duration: Number.POSITIVE_INFINITY });
					toast.warning("Third", { duration: Number.POSITIVE_INFINITY });
				}}
			>
				Fire 3 toasts
			</Button>
			<Button
				variant="danger"
				onClick={() =>
					toast.error("Fourth - drops oldest (info)", { duration: Number.POSITIVE_INFINITY })
				}
			>
				Fire 4th (drops oldest)
			</Button>
		</div>
	);
}

export const Stacking: Story = {
	parameters: { docs: { source: { code: SRC.Stacking } } },
	render: () => <StackingDemo />,
};

function AutoTrigger() {
	const toast = useToast();
	return (
		<Button onClick={() => toast.success("Auto-dismisses in 3s (default)")}>Show 3s toast</Button>
	);
}

export const AutoDismiss: Story = {
	parameters: { docs: { source: { code: SRC.AutoDismiss } } },
	render: () => <AutoTrigger />,
};

function PersistTrigger() {
	const toast = useToast();
	return (
		<Button
			onClick={() =>
				toast.warning("Persistent - manual dismiss only", {
					duration: Number.POSITIVE_INFINITY,
				})
			}
		>
			Show persistent toast
		</Button>
	);
}

export const Persistent: Story = {
	parameters: { docs: { source: { code: SRC.Persistent } } },
	render: () => <PersistTrigger />,
};

export const DarkMode: Story = {
	parameters: { docs: { source: { code: SRC.DarkMode } } },
	decorators: [
		(Story) => (
			<div className="dark" style={{ background: "#1c1917", padding: 16, borderRadius: 8 }}>
				<Story />
			</div>
		),
	],
	render: () => (
		<>
			<FireOnMount tone="success" message="Saved (dark)" duration={Number.POSITIVE_INFINITY} />
			<FireOnMount tone="error" message="Failed (dark)" duration={Number.POSITIVE_INFINITY} />
			<FireOnMount tone="info" message="Info (dark)" duration={Number.POSITIVE_INFINITY} />
			<FireOnMount tone="warning" message="Warning (dark)" duration={Number.POSITIVE_INFINITY} />
			<div style={{ color: "var(--ink-2)", fontSize: 13 }}>
				Tone backgrounds lift saturation in dark mode.
			</div>
		</>
	),
};
