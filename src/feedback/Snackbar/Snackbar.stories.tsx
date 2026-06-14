import type { Meta, StoryObj } from "@storybook/react-vite";
import { SnackbarProvider, useSnackbar } from ".";
import { Button } from "../../inputs/Button";

const SRC = {
	Default: `// Mount once at app root
function App() {
  return (
    <SnackbarProvider>
      <YourApp />
    </SnackbarProvider>
  );
}

// Inside any component
function DeleteButton() {
  const snack = useSnackbar();
  return (
    <Button
      onClick={() =>
        snack.show("Application deleted.", {
          action: { label: "UNDO", onClick: () => restore() },
        })
      }
    >
      Delete
    </Button>
  );
}`,
	Tones: `const snack = useSnackbar();
snack.show("Application deleted.", { action: { label: "UNDO", onClick } });
snack.show("Saved.", { tone: "success" });
snack.show("Couldn't reach the server.", { tone: "error", action: { label: "RETRY", onClick } });`,
	Progress: `const snack = useSnackbar();
// Depleting countdown bar along the bottom edge — a visual undo timer.
snack.show("Application deleted.", {
  progress: true,
  duration: 5000,
  action: { label: "UNDO", onClick: () => restore() },
});`,
};

const meta: Meta = {
	title: "Feedback/Snackbar",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Bottom-center, solid-fill action surface. Wrap the app with `SnackbarProvider` and call `useSnackbar()` to imperatively confirm a reversible action with an inline UNDO / RETRY. Single-at-a-time (replaces any active snackbar). Optional `progress` renders a depleting countdown bar over a finite `duration`.",
			},
		},
	},
	decorators: [
		(Story) => (
			<SnackbarProvider>
				<div style={{ padding: 32, minHeight: 320 }}>
					<Story />
				</div>
			</SnackbarProvider>
		),
	],
};

export default meta;
type Story = StoryObj;

function DefaultTriggers() {
	const snack = useSnackbar();
	return (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button
				onClick={() =>
					snack.show("Application deleted.", {
						action: { label: "UNDO", onClick: () => {} },
					})
				}
			>
				Delete (with UNDO)
			</Button>
			<Button variant="secondary" onClick={() => snack.show("Saved.", { tone: "success" })}>
				Save (success)
			</Button>
			<Button
				variant="danger"
				onClick={() =>
					snack.show("Couldn't reach the server.", {
						tone: "error",
						action: { label: "RETRY", onClick: () => {} },
					})
				}
			>
				Fail (error + RETRY)
			</Button>
		</div>
	);
}

export const Default: Story = {
	parameters: { docs: { source: { code: SRC.Default } } },
	render: () => <DefaultTriggers />,
};

function ProgressTriggers() {
	const snack = useSnackbar();
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
			<Button
				onClick={() =>
					snack.show("Application deleted.", {
						progress: true,
						duration: 5000,
						action: { label: "UNDO", onClick: () => {} },
					})
				}
			>
				Delete (5s undo timer)
			</Button>
			<Button
				variant="secondary"
				onClick={() =>
					snack.show("Saved.", {
						progress: true,
						duration: 3000,
						tone: "success",
					})
				}
			>
				Save (3s success bar)
			</Button>
			<div style={{ color: "var(--ink-2)", fontSize: 13 }}>
				The thin bar along the bottom edge depletes left-to-right over the snackbar's duration — a
				visual countdown for the UNDO window. Honors <code>prefers-reduced-motion: reduce</code>{" "}
				(static bar, no animation).
			</div>
		</div>
	);
}

export const Progress: Story = {
	parameters: { docs: { source: { code: SRC.Progress } } },
	render: () => <ProgressTriggers />,
};
