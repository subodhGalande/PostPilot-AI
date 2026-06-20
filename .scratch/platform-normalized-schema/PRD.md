Status: completed

# PRD: Platform-Normalized Data Model

## Problem Statement

The current schema stores Platform Variant content and lifecycle as denormalized columns on the `Post` table (`linkedinContent`, `xContent`, `linkedinStatus`, `xStatus`, `linkedinScheduledAt`, `xScheduledAt`). This creates co-location issues:

- Content and lifecycle state are mixed with draft metadata (title, topic, baseIdea) on the same table, making it impossible to manage each Platform Variant independently
- Queries that filter by platform status require OR conditions on multiple columns
- Scheduling logic must carefully preserve other platform's columns to avoid accidental overwrites
- Unscheduling requires conditional column updates rather than clean state transitions
- Future platform-specific fields (e.g., X thread metadata vs LinkedIn article metadata) cannot be added without polluting the shared `Post` table

## Solution

Normalize the `Post` table into three tables: a pure metadata shell (`Post`) and two platform-specific tables (`LinkedInPost`, `XPost`). Each Platform Variant becomes a first-class entity with its own content and lifecycle:

- **Post** becomes a metadata-only shell containing shared fields: `id`, `title`, `topic`, `baseIdea`, `model`, `clientDraftKey`, `userId`, timestamps
- **LinkedInPost** holds all LinkedIn-specific content and lifecycle: `content`, `status` (`DRAFT | SCHEDULED`), `scheduledAt`, FK to `Post`
- **XPost** holds all X-specific content and lifecycle: `content`, `mode` (`"single" | "thread"`), `threadPosts` (JSON), `status` (`DRAFT | SCHEDULED`), `scheduledAt`, FK to `Post`

Each child table has a 1:1 relationship with `Post` (enforced via unique `postId`). `Post` cascade-deletes children. The child rows persist across the draft/schedule/unschedule cycle — only the `status` field transitions.

## User Stories

### Draft Management

1. As a user, I want my Drafts list to show all posts that have at least one Platform Variant in DRAFT status, so I can quickly find work-in-progress content
2. As a user, I want my Calendar to show all posts that have at least one Platform Variant in SCHEDULED status, so I can see my publishing schedule at a glance
3. As a user, I want a draft to exist for both platforms simultaneously, so that I can manage LinkedIn and X content under the same base idea
4. As a user, I want to edit LinkedIn content while X remains scheduled and untouched, so that scheduling one platform doesn't affect the other
5. As a user, I want to edit X content while LinkedIn remains scheduled and untouched, so that scheduling one platform doesn't affect the other
6. As a user, I want both Platform Variants to appear in the editor tabs when both are in DRAFT, so I can switch between them freely
7. As a user, I want to see only the DRAFT platform in the editor tabs when the other platform is already SCHEDULED, so I don't accidentally edit content that is locked for publishing
8. As a user, I want platform badges in the Drafts grid indicating which platforms are in draft state, so I can see at a glance which variants need attention

### Content Generation

9. As a user, I want AI-generated content to create both LinkedIn and X Platform Variants simultaneously, so both are ready to edit in one pass
10. As a user, I want my edits to a Platform Variant to persist independently from the other platform's state, so I have full control over each platform's content
11. As a user, I want to regenerate content for one platform without affecting the other, so I can iterate on a single variant

### Scheduling

12. As a user, I want to schedule only LinkedIn while keeping X in draft, so I can stagger my publishing across platforms
13. As a user, I want to schedule only X while keeping LinkedIn in draft, so I can stagger my publishing across platforms
14. As a user, I want to schedule both platforms, so both go live on their chosen dates
15. As a user, I want scheduled Platform Variants to be read-only in the editor, so I cannot accidentally modify locked content
16. As a user, I want to reschedule a Platform Variant, so I can change the publish date of a locked post
17. As a user, I want unscheduling a Platform Variant to unlock it for editing again, so I can make changes before rescheduling
18. As a user, I want unscheduling to preserve content and only change the status, so I don't lose my work
19. As a user, I want scheduled posts to appear in the Calendar view with the correct platform label, so I can manage my publishing calendar visually

### Deletion

20. As a user, I want to delete only LinkedIn from a post, so X continues independently if it has content
21. As a user, I want to delete only X from a post, so LinkedIn continues independently if it has content
22. As a user, I want deleting the last Platform Variant to also delete the parent Post, so I don't have orphaned drafts
23. As a user, I want to see a confirmation before deleting a Platform Variant, so I don't accidentally remove content

### Migration & Data Integrity

24. As a user, I want existing posts created with the old schema to work correctly after the migration, so my history is preserved
25. As a user, I want the migration to populate both new platform tables from the old `Post` columns, so no content is lost
26. As a user, I want the old `linkedinContent`/`xContent` columns removed after migration, so the schema stays clean
27. As a user, I want a rollback plan in case the migration fails, so I don't lose data

## Implementation Decisions

### Schema Changes

- **`Post`** — drop all platform-specific columns. Retain: `id`, `title`, `topic`, `baseIdea`, `model`, `clientDraftKey`, `userId`, `createdAt`, `updatedAt`. Unique constraint: `[userId, clientDraftKey]`
- **`LinkedInPost`** — new table. Fields: `id`, `content` (String), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id), `createdAt`, `updatedAt`. Unique constraint: `[postId]`
- **`XPost`** — new table. Fields: `id`, `content` (String), `mode` (String — "single" or "thread"), `threadPosts` (Json — array of `{id, content}`), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id), `createdAt`, `updatedAt`. Unique constraint: `[postId]`
- **`PostStatus` enum** — reduce to `{ DRAFT SCHEDULED }`. Remove `PUBLISHED`, `ARCHIVED`, `DELETED`
- **`Platform` enum** — drop entirely. Platform is discriminated by table name, not a column
- **Cascade** — `Post → LinkedInPost` (cascade delete), `Post → XPost` (cascade delete)
- **Indexes** — `LinkedInPost(status, scheduledAt)`, `XPost(status, scheduledAt)`

### Migration Script

1. Create `LinkedInPost` and `XPost` tables with new schema
2. For each existing `Post`, create a `LinkedInPost` row from `linkedinContent`, copying `linkedinStatus` to `status` and `linkedinScheduledAt` to `scheduledAt`
3. For each existing `Post`, create an `XPost` row from `xContent`, copying `xStatus` to `status` and `xScheduledAt` to `scheduledAt`
4. Drop columns from `Post`: `linkedinContent`, `xContent`, `linkedinStatus`, `xStatus`, `linkedinScheduledAt`, `xScheduledAt`
5. Drop `Platform` enum
6. Drop `PUBLISHED`, `ARCHIVED`, `DELETED` from `PostStatus` enum

### API Route Changes

- **`POST /api/dashboard/saveDraft`** — upserts child rows (`LinkedInPost`, `XPost`) on every save. Creates `Post` if new. Children rows always exist when the Post exists (DRAFT status). Removes all writes to `linkedinContent`/`xContent` columns
- **`POST /api/dashboard/schedulePost`** — flips child row `status` to `SCHEDULED`, sets `scheduledAt`. Creates children if they don't exist (edge case for legacy posts). Removes all writes to `linkedinStatus`/`xStatus`/`linkedinScheduledAt`/`xScheduledAt` columns
- **`POST /api/dashboard/unschedulePost`** — flips child row `status` to `DRAFT`, nulls `scheduledAt`. Row is NOT deleted. Removes all writes to `linkedinStatus`/`xStatus`/`linkedinScheduledAt`/`xScheduledAt` columns
- **`DELETE /api/dashboard/drafts/[id]`** — physical delete of child row (LinkedIn or X via query param). If the other child row has no content, cascade delete `Post` (via existing orphan logic)
- **`GET /api/dashboard/drafts`** — derive status from child rows. Draft view: `EXISTS(LinkedInPost WHERE status = DRAFT) OR EXISTS(XPost WHERE status = DRAFT)`. Calendar view: `EXISTS(LinkedInPost WHERE status = SCHEDULED) OR EXISTS(XPost WHERE status = SCHEDULED)`
- **`GET /api/dashboard/drafts/[id]`** — include platform status from child rows in response. Conditional tab rendering in UI based on which children have DRAFT status

### Frontend Changes

- **`components/dashboard/post-preview.tsx`** — derive `activePost.status` from child row response, not from Post columns. Platform tabs rendered based on which child rows have `status = DRAFT`
- **`components/dashboard/drafts-grid.tsx`** — platform badges derived from child row existence/status
- **`components/dashboard/draft-editor-workspace.tsx`** — save logic targets child rows. Schedule/unschedule mutations target child row status. Delete targets child row
- **`lib/drafts.ts`** — update `reconstructPostContent` to read from child rows instead of `linkedinContent`/`xContent`. Update `SaveDraftResponse` type to include `linkedinPost` and `xPost` objects

### Zod Schema Changes

- **`lib/schemas/post.schema.ts`** — `saveDraftSchema` and `schedulePostSchema` should write to child row structure. Remove `linkedinContent`/`xContent` field mappings
- **`lib/schemas/social.schema.ts`** — update `generatedPostItemSchema` to reflect that `linkedin.content` and `x.posts` map directly to child row fields. `platformLifecycleSchema` fields map to child row `status`/`scheduledAt`

### Data Flow

```
AI Generation
    ↓
saveDraft (POST) → upsert Post (shell) + upsert LinkedInPost (DRAFT) + upsert XPost (DRAFT)
    ↓
User edits Platform Variant
    ↓
saveDraft (POST) → update LinkedInPost.content / XPost.content (DRAFT)
    ↓
schedulePost (POST) → update LinkedInPost.status = SCHEDULED, scheduledAt = X
    ↓
Scheduled child row → read-only
    ↓
unschedulePost (POST) → update LinkedInPost.status = DRAFT, scheduledAt = null
    ↓
Editable again
    ↓
delete (DELETE) → physical delete of LinkedInPost / XPost
    ↓
If no children remain → cascade delete Post
```

## Testing Decisions

### What makes a good test

Test external behavior only — the API contract and the data in the database. Do not test implementation details (internal function calls, Prisma query structure). Tests should survive refactors that preserve the contract.

### Modules to test

- **saveDraft API** — creates Post + both child rows on first save; updates child rows on subsequent saves; creates Post only once even if called multiple times
- **schedulePost API** — sets status to SCHEDULED on target child; preserves other child's status; creates child if missing
- **unschedulePost API** — sets status to DRAFT on target child; nulls scheduledAt; row persists
- **delete draft API** — deletes target child row; cascade deletes Post if other child doesn't exist
- **drafts list API** — returns posts with at least one DRAFT child for drafts view; returns posts with at least one SCHEDULED child for calendar view
- **draft detail API** — returns post with child rows; correct status derived from children
- **Reconstruct post content** — `reconstructPostContent` correctly builds `StoredDraftContent` from child rows and Post metadata

### Prior art

- `components/dashboard/post-preview.test.tsx` — existing test file with React Testing Library patterns for UI components
- `lib/drafts.ts` — existing `reconstructPostContent` function that can be unit tested with input/output pairs
- Manual end-to-end flow tests documented in `platform-status-refactor/PRD.md` Testing Decisions section

## Out of Scope

- Third platform support (Threads, Mastodon, etc.) — schema is designed to accommodate but not implemented
- Auto-publishing via platform APIs (PUBLISHED status) — scheduled posts are the final state; user publishes manually
- Per-post analytics on child rows — no click tracking, engagement data stored outside this model
- Thread post-level granular editing or deletion — X thread posts are stored as JSON and edited as a whole
- Real-time collaboration or comments on Platform Variants
- Migration script rollback automation — manual rollback procedure documented, no automated rollback script

## Further Notes

- The `clientDraftKey` remains the human-meaningful identifier for a "pack" of posts. It links `Post` to user sessions (localStorage) without depending on the database `id`
- The cascade delete from `Post` to children means deleting a Post from the drafts list will remove all associated child rows automatically
- The 1:1 unique constraint on `postId` in each child table enforces exactly one LinkedInPost and one XPost per Post — no duplicates or orphans
- With all content in children and status in children, the `Post` table becomes purely a grouping mechanism with no user-facing content of its own
- The `generatePost` API does not need changes — it generates content that flows into `saveDraft`, which then populates children
- `linkedinStatus` in the frontend refers to `LinkedInPost.status` from the API response — no rename in the API contract is required, but the data source shifts from `Post` columns to child row fields

---

Label: needs-triage
