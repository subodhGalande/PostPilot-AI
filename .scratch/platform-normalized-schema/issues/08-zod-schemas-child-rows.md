## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update Zod schemas to reflect that content maps directly to child row fields. Update `lib/schemas/post.schema.ts` and `lib/schemas/social.schema.ts` so that `platformLifecycleSchema` maps to child row `status`/`scheduledAt` fields.

## Acceptance criteria

- [x] `saveDraftSchema` — `post.linkedin.content` and `post.x.posts` map to child row fields, not `Post` columns
- [x] `schedulePostSchema` — `scheduledAt` maps to child row `scheduledAt`, not `Post` column
- [x] `unscheduleSchema` — `id` and `platform` still valid, no column references
- [x] `generatedPostItemSchema` — `linkedin.content` and `x.posts` are the source of truth for child row content
- [x] `platformLifecycleSchema` — `status` and `scheduledAt` map to child row fields
- [x] TypeScript types reflect new child row structure (`LinkedInPost`, `XPost`)
- [x] No references to removed `linkedinContent`/`xContent`/`linkedinStatus`/`xStatus` columns

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: completed

**Completed:** 2025-05-11 - Schemas already use child-row structure. `generatedPostItemSchema` has linkedin.content/x.posts. `platformLifecycleSchema` has status/scheduledAt. No Post column references.

## Agent Brief

**Category:** enhancement
**Summary:** Update Zod schemas to map to child row fields instead of removed Post columns

**Current behavior:**
`saveDraftSchema` and `schedulePostSchema` reference Post.linkedinContent/xContent and linkedinStatus/xStatus columns.

**Desired behavior:**
- saveDraftSchema: post.linkedin.content and post.x.posts map to child row fields
- schedulePostSchema: scheduledAt maps to child row scheduledAt
- generatedPostItemSchema: linkedin.content and x.posts are source of truth
- platformLifecycleSchema: status and scheduledAt map to child row fields

**Key interfaces:**
- `lib/schemas/post.schema.ts` — saveDraftSchema, schedulePostSchema
- `lib/schemas/social.schema.ts` — generatedPostItemSchema, platformLifecycleSchema

**Acceptance criteria:**
- [ ] saveDraftSchema maps to child row fields
- [ ] schedulePostSchema maps to child row scheduledAt
- [ ] generatedPostItemSchema uses child rows as source
- [ ] platformLifecycleSchema maps to child row fields
- [ ] TypeScript types reflect new child row structure
- [ ] No references to removed Post columns