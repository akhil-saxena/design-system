# Tree-shake verification harness

Two fixtures live here. **Both now run in CI** — `subpath.test.ts` is collected by
`npm test`; the icon-size check below is still driven by hand. That is a change: this
file previously said the harness "does NOT run automatically in CI", and that is how
G-15 stayed unmeasured across three planning documents.

## 1. `subpath.test.ts` — the DS-09 / G-15 gate (automated)

Runs in `npm test`. It bundles built per-component subpath entries with esbuild and
asserts that the editor and drag-and-drop stacks are absent.

### What it defends

`src/index.ts` is one barrel that **statically** imports `@tiptap/*`, `lowlight`,
`@dnd-kit/*` and `lucide-react` at top level, so `dist/index.js` does too. Importing a
single atom from the barrel on a hydrated island therefore ships the whole editor stack:

| Import style | raw | gzip | modules | prosemirror | tiptap | lowlight | highlight.js | dnd-kit | lucide |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| barrel, `@1.11.4` (the G-15 baseline) | 570,555 B | 176,922 B | 99 | 10 | 23 | 4 | 4 | 3 | 43 |

Three configuration fixes were tried during research — `sideEffects: false`, removing the
`"use client"` directive from `dist/index.js`, and marking the module-scope
`createLowlight()` call `/* @__PURE__ */` — and **each produced byte-identical output**.
Astro 7 ships Vite 8, which is Rolldown-based; Rollup-era tree-shaking advice does not
transfer. Per-component entries (`tsup.config.ts`, `exports["./components/*"]`) are the
fix, and this gate is what keeps them working.

### Why the collection rule in `vitest.config.ts` is written the way it is

`include` names `tests/treeshake/**/*.{test,spec}.ts` **exactly**. It must not be widened
to cover all of `tests/`: `tests/visual/` holds Playwright specs, and pulling
`@playwright/test` into vitest crashes the run. Before that line existed the spec here was
invisible to `npm test` — it would have passed without ever being collected, which is the
failure mode this whole fixture exists to prevent.

The gate needs a build, so it is `skipIf`-guarded on `dist/components/`, the same contract
`src/packaging.test.ts` documents. `prepublishOnly` runs `build && test`, and
`.github/workflows/publish.yaml` runs `npm run build` before `npm test`, so it is live on
both paths that matter.

### Reading the report

Assertions are on **module families**, never on a byte ceiling. `check-bundle.mjs`'s 50 KB
gzip figure is research assumption A8, is explicitly UNCONFIRMED, and must not be hardened
into a gate until a human settles it. Bytes are recorded as data; families are unambiguous.

`lucide-react` is **permitted** and its presence is asserted. The reason is copied from
`check-bundle.mjs` so the two cannot silently diverge: it is a tree-shakeable icon package
of individually small modules and the design system legitimately renders icons. Asserting
it is present also keeps the gate honest — a bundle that resolved nothing at all would
otherwise report an empty failure set and pass.

Two inverse cases assert the heavy stacks **are** still reachable where they belong
(`RichText` must contain TipTap and ProseMirror, `Sortable` must contain dnd-kit).
Without them a bundler configuration that dropped every import would pass the suite while
shipping broken components.

## 2. `main.ts` — the single-icon size check (manual)

A different regression, still worth having: that importing one icon from the icons barrel
does not pull in the whole of `lucide-react`.

```bash
npx esbuild tests/treeshake/main.ts \
  --bundle \
  --minify \
  --format=esm \
  --external:react \
  --external:react-dom \
  | wc -c
```

The minified output must be **under 5000 bytes**. Output above that means the icon is not
re-exported as a named ESM export from `src/icons/index.ts`, or `lucide-react` is not being
tree-shaken (check that the barrel uses named re-exports rather than
`export * from "lucide-react"`), or tsup is inlining `lucide-react` instead of treating it
as external.
