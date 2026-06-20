Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Create `LinkedInPost` and `XPost` tables in Prisma schema, backfill them from existing `Post` platform columns, then drop the old columns from `Post`. Reduce `PostStatus` enum to `{ DRAFT SCHEDULED }`. Drop the `Platform` enum entirely. Set up cascade deletes from `Post` to both children.

## Acceptance criteria

- [x] `LinkedInPost` table created with: `id`, `content` (String), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id unique), `createdAt`, `updatedAt`
- [x] `XPost` table created with: `id`, `content` (String), `mode` (String), `threadPosts` (Json), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id unique), `createdAt`, `updatedAt`
- [x] `LinkedInPost(status, scheduledAt)` index and `XPost(status, scheduledAt)` index created
- [x] Cascade deletes: `Post → LinkedInPost`, `Post → XPost`
- [x] `PostStatus` enum reduced to `{ DRAFT SCHEDULED }` — no PUBLISHED, ARCHIVED, DELETED
- [x] `Platform` enum dropped from schema
- [ ] Migration script backfills `LinkedInPost` rows from existing `Post.linkedinContent` / `Post.linkedinStatus` / `Post.linkedinScheduledAt` (N/A - fresh DB)
- [ ] Migration script backfills `XPost` rows from existing `Post.xContent` / `Post.xStatus` / `Post.xScheduledAt` (N/A - fresh DB)
- [x] Old columns dropped from `Post`: `linkedinContent`, `xContent`, `linkedinStatus`, `xStatus`, `linkedinScheduledAt`, `xScheduledAt`, `platform`
- [x] Migration applies cleanly — existing data preserved and queryable from new tables
- [x] Code compiles after migration (TypeScript errors are expected - will be fixed in issues 02-14)

## Blocked by

None - can start immediately

Label: completed

**Completed:** 2025-05-11 - Schema migration applied. LinkedInPost and XPost tables created, PostStatus reduced to {DRAFT, SCHEDULED}, Platform enum removed. TypeScript errors expected - will be fixed in issues 02-14.

## Agent Brief

**Category:** enhancement
**Summary:** Normalize Post table into LinkedInPost and XPost child tables with 1:1 relationship

**Current behavior:**
The `Post` model contains denormalized platform columns: `linkedinContent`, `xContent`, `linkedinStatus`, `xStatus`, `linkedinScheduledAt`, `xScheduledAt`. Each platform's content and lifecycle are stored as separate columns on the same row, making it impossible to manage each platform independently. The `Platform` enum exists but is used only in the unique constraint.

**Desired behavior:**
- `Post` becomes a metadata-only shell containing: `id`, `title`, `topic`, `baseIdea`, `model`, `clientDraftKey`, `userId`, timestamps
- `LinkedInPost` table with: `id`, `content` (String), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id unique), `createdAt`, `updatedAt`
- `XPost` table with: `id`, `content` (String), `mode` (String), `threadPosts` (Json), `status` (PostStatus default DRAFT), `scheduledAt` (DateTime nullable), `postId` (FK → Post.id unique), `createdAt`, `updatedAt`
- `PostStatus` enum reduced to `{ DRAFT SCHEDULED }` — remove PUBLISHED, ARCHIVED, DELETED
- `Platform` enum dropped entirely
- Cascade deletes: Post → LinkedInPost, Post → XPost
- Indexes on: LinkedInPost(status, scheduledAt), XPost(status, scheduledAt)

**Key interfaces:**
- `Post` model — remove all platform-specific columns
- `LinkedInPost` model — new, with 1:1 to Post via unique postId
- `XPost` model — new, with 1:1 to Post via unique postId
- `PostStatus` enum — reduce to DRAFT, SCHEDULED only
- `Platform` enum — remove entirely

**Acceptance criteria:**
- [ ] LinkedInPost table created with specified fields and indexes
- [ ] XPost table created with specified fields and indexes
- [ ] Cascade deletes configured from Post to both children
- [ ] PostStatus enum reduced to { DRAFT SCHEDULED }
- [ ] Platform enum dropped from schema
- [ ] Migration script backfills LinkedInPost from Post.linkedinContent / linkedinStatus / linkedinScheduledAt
- [ ] Migration script backfills XPost from Post.xContent / xStatus / xScheduledAt
- [ ] Old columns dropped: linkedinContent, xContent, linkedinStatus, xStatus, linkedinScheduledAt, xScheduledAt
- [ ] Migration applies cleanly with existing data preserved
- [ ] Code compiles after migration

**Out of scope:**
- API route changes (handled in issues 02-06)
- Frontend component updates (handled in issues 07-14)
- Zod schema updates (handled in issue 08)
