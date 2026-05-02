# Restoring the Illustrations Subpath

Illustrations were removed from `main` in commit `44c91ae` and preserved here on the `illustrations-archive` branch. This file explains how to bring them back.

## What was removed

| File | What it contains |
|---|---|
| `src/illustrations/index.tsx` | 24 named SVG React components |
| `src/illustrations/index.test.tsx` | 49 component tests |
| `src/illustrations/index.stories.tsx` | Storybook stories (`Foundation/Illustrations`) |
| `package.json` `./illustrations` stanza | Subpath export mapping |
| `tsup.config.ts` entry | Build entry for the subpath |

The `/illustrations` subpath published as `@akhil-saxena/design-system/illustrations`. All 24 components accept `width`, `height`, `className`, `style` props and default to `120×120`.

---

## Restore steps

### 1. Bring the source files back

```bash
# From the main branch
git checkout illustrations-archive -- src/illustrations/
```

This restores all three files (`index.tsx`, `index.test.tsx`, `index.stories.tsx`) into `src/illustrations/`.

### 2. Re-add the tsup build entry

In `tsup.config.ts`, add `"src/illustrations/index.tsx"` to the `entry` array:

```ts
entry: [
  "src/index.ts",
  "src/hooks/index.ts",
  "src/icons/index.ts",
  "src/illustrations/index.tsx",   // ← add this
],
```

### 3. Re-add the package.json exports stanza

In `package.json`, add the `./illustrations` entry inside `"exports"` (after `./icons`):

```json
"./illustrations": {
  "types": "./dist/illustrations/index.d.ts",
  "import": "./dist/illustrations/index.js"
},
```

### 4. Update README

- Bump primitive count from 57 → 58
- Add to the Subpath imports section:
  ```ts
  import { EmptyBox, MailSent, Rocket } from '@akhil-saxena/design-system/illustrations';
  ```
- Re-add the `## Illustrations` section (see this branch's `README.md` for the full text)

### 5. Verify

```bash
npm run build     # should produce dist/illustrations/index.js + index.d.ts
npm test          # should be 803 tests (754 + 49 illustration tests)
```

### 6. Bump version and publish

```bash
# Bump to next minor
npm version minor   # e.g. 1.1.0 → 1.2.0

git push origin main --tags
npm publish
```

---

## The 24 illustration components

`MailSent`, `Documents`, `Rocket`, `Celebrate`, `Lightbulb`, `Idea`, `IllustrationSearch`, `Plant`, `Cloud`, `EmptyBox`, `ConnectionLost`, `IllustrationError`, `Inbox`, `GraphUp`, `Chart`, `CalendarEvent`, `Team`, `Thinking`, `Lock`, `Puzzle`, `Workflow`, `Travel`, `IllustrationSuccess`, `PhoneScreen`

All fills use `var(--cream)` / `var(--ink)` / `var(--amber)` tokens so they flip automatically in dark mode.
