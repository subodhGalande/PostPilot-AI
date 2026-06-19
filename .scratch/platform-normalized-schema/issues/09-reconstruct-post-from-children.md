Status: completed

## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `lib/drafts.ts` `reconstructPostContent` to build `StoredDraftContent` from child rows (`LinkedInPost`, `XPost`) and `Post` metadata, instead of reading from the now-deleted `linkedinContent`/`xContent`/`linkedinStatus`/`xStatus` columns. Update `SaveDraftResponse` type to include `linkedinPost` and `xPost` objects.

## Acceptance criteria

- [x] `reconstructPostContent` reads `linkedin.content` from `LinkedInPost.content`
- [x] `reconstructPostContent` reads `linkedin.status` from `LinkedInPost.status`
- [x] `reconstructPostContent` reads `linkedin.scheduledAt` from `LinkedInPost.scheduledAt`
- [x] `reconstructPostContent` reads `x.mode` from `XPost.mode`
- [x] `reconstructPostContent` reads `x.posts` from `XPost.threadPosts`
- [x] `reconstructPostContent` reads `x.status` from `XPost.status`
- [x] `reconstructPostContent` reads `x.scheduledAt` from `XPost.scheduledAt`
- [x] `SaveDraftResponse` type includes `linkedinPost` and `xPost` fields
- [x] No references to `Post.linkedinContent`, `Post.xContent`, `Post.linkedinStatus`, `Post.xStatus`
- [x] Unit tests pass for `reconstructPostContent` with child row input

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: completed

**Completed:** 2025-05-11 - `reconstructPostContent` already reads from child rows. Has fallback for legacy data. `SaveDraftResponse` includes `linkedinPost`/`xPost` fields.

## Agent Brief

**Category:** enhancement
**Summary:** Update reconstructPostContent to read from child rows instead of Post columns

**Current behavior:**
`lib/drafts.ts` reconstructPostContent reads from Post.linkedinContent/xContent/linkedinStatus/xStatus columns.

**Desired behavior:**
- Read linkedin.content from LinkedInPost.content
- Read linkedin.status/scheduledAt from LinkedInPost
- Read x.mode/threadPosts/status/scheduledAt from XPost
- SaveDraftResponse includes linkedinPost and xPost fields

**Key interfaces:**
- `lib/drafts.ts` — reconstructPostContent function
- `SaveDraftResponse` type

**Acceptance criteria:**
- [ ] Reads linkedin.content from LinkedInPost.content
- [ ] Reads linkedin.status from LinkedInPost.status
- [ ] Reads linkedin.scheduledAt from LinkedInPost.scheduledAt
- [ ] Reads x.mode from XPost.mode
- [ ] Reads x.posts from XPost.threadPosts
- [ ] Reads x.status from XPost.status
- [ ] Reads x.scheduledAt from XPost.scheduledAt
- [ ] SaveDraftResponse includes linkedinPost and xPost
- [ ] No references to Post columns
- [ ] Unit tests pass
