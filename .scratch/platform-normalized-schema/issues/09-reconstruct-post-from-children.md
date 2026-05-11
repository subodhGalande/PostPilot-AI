## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `lib/drafts.ts` `reconstructPostContent` to build `StoredDraftContent` from child rows (`LinkedInPost`, `XPost`) and `Post` metadata, instead of reading from the now-deleted `linkedinContent`/`xContent`/`linkedinStatus`/`xStatus` columns. Update `SaveDraftResponse` type to include `linkedinPost` and `xPost` objects.

## Acceptance criteria

- [ ] `reconstructPostContent` reads `linkedin.content` from `LinkedInPost.content`
- [ ] `reconstructPostContent` reads `linkedin.status` from `LinkedInPost.status`
- [ ] `reconstructPostContent` reads `linkedin.scheduledAt` from `LinkedInPost.scheduledAt`
- [ ] `reconstructPostContent` reads `x.mode` from `XPost.mode`
- [ ] `reconstructPostContent` reads `x.posts` from `XPost.threadPosts`
- [ ] `reconstructPostContent` reads `x.status` from `XPost.status`
- [ ] `reconstructPostContent` reads `x.scheduledAt` from `XPost.scheduledAt`
- [ ] `SaveDraftResponse` type includes `linkedinPost` and `xPost` fields
- [ ] No references to `Post.linkedinContent`, `Post.xContent`, `Post.linkedinStatus`, `Post.xStatus`
- [ ] Unit tests pass for `reconstructPostContent` with child row input

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: ready-for-agent

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