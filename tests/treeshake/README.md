# Tree-Shake Verification Harness

This fixture verifies that a single-icon import from the design system icons barrel
does not pull in the entire lucide-react library (i.e., tree-shaking works correctly).

## How to run

After Plan 17-01 lands the icons barrel (`src/icons/index.ts` populated with re-exports
from lucide-react), run the following from the repo root:

```bash
npx esbuild tests/treeshake/main.ts \
  --bundle \
  --minify \
  --format=esm \
  --external:react \
  --external:react-dom \
  | wc -c
```

## Acceptance threshold

The minified output must be **under 5000 bytes (5 KB)**.

If the output exceeds 5 KB, it indicates that either:
1. The icon is not re-exported as a named ESM export from `src/icons/index.ts`
2. lucide-react is not being tree-shaken (check that `sideEffects` is NOT set on
   the lucide-react package, and that the icons barrel uses named re-exports rather
   than `export * from "lucide-react"` which prevents per-symbol tree-shaking)
3. tsup is inlining lucide-react instead of treating it as external

## Note

This fixture does NOT run automatically in CI during Plan 17-00.
It is a manual verification step during Plan 17-01 QA.
The CI gate for bundle size will be wired in Plan 17-01 once the icons barrel is populated.
