## What to build

Fix ~15+ `lint/style/useImportType` violations across shadcn UI components (`card.tsx`, `button.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `breadcrumb.tsx`, `label.tsx`, `popover.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `switch.tsx`, `tabs.tsx`, `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`). Change `import { X } from "..."` to `import type { X } from "..."` for type-only imports.

## Acceptance criteria

- [x] 0 `useImportType` violations
- [ ] All UI components render correctly in Storybook/tests

## Completion notes

Applied biome safe fix (`--fix`). Fixed 16 files:

| File | Before | After |
|------|--------|-------|
| breadcrumb.tsx | `import * as React` | `import type * as React` |
| button.tsx | `import * as React` | `import type * as React` |
| card.tsx | `import * as React` | `import type * as React` |
| dialog.tsx | `import * as React` | `import type * as React` |
| drawer.tsx | `import * as React` | `import type * as React` |
| dropdown-menu.tsx | `import * as React` | `import type * as React` |
| label.tsx | `import * as React` | `import type * as React` |
| popover.tsx | `import * as React` | `import type * as React` |
| select.tsx | `import * as React` | `import type * as React` |
| separator.tsx | `import * as React` | `import type * as React` |
| sheet.tsx | `import * as React` | `import type * as React` |
| switch.tsx | `import * as React` | `import type * as React` |
| tabs.tsx | `import * as React` | `import type * as React` |
| toggle.tsx | `import * as React` | `import type * as React` |
| toggle-group.tsx | `import { type VariantProps }` | `import type { VariantProps }` |
| tooltip.tsx | `import * as React` | `import type * as React` |

`biome check` confirms **0 `useImportType` violations**.

## Blocked by

None - can start immediately
