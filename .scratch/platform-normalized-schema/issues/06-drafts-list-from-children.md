## Parent

`.scratch/platform-normalized-schema/PRD.md`

## What to build

Update `GET /api/dashboard/drafts` to derive platform status from child rows instead of the now-deleted `linkedinStatus`/`xStatus` columns. Include `linkedinPost` and `xPost` objects in the response. Drafts view returns posts where at least one child has `status = DRAFT`. Calendar view returns posts where at least one child has `status = SCHEDULED`.

## Acceptance criteria

- [ ] Drafts view: `WHERE EXISTS(LinkedInPost WHERE status = DRAFT) OR EXISTS(XPost WHERE status = DRAFT)` — same as current OR logic
- [ ] Calendar view: `WHERE EXISTS(LinkedInPost WHERE status = SCHEDULED) OR EXISTS(XPost WHERE status = SCHEDULED)` — same as current OR logic
- [ ] Response includes `linkedinPost` and `xPost` objects (id, content, status, scheduledAt, mode, threadPosts)
- [ ] `reconstructPostContent` compatible — UI receives same shape as before
- [ ] Works with both old data (from migration) and new data

## Blocked by

`.scratch/platform-normalized-schema/issues/01-schema-migration.md`

Label: ready-for-agent

## Agent Brief

**Category:** enhancement
**Summary:** Update drafts list API to derive status from child rows, include child data in response

**Current behavior:**
`GET /api/dashboard/drafts` reads `Post.linkedinStatus`/`Post.xStatus` for filtering.

**Desired behavior:**
- Drafts view: posts where at least one child has status=DRAFT
- Calendar view: posts where at least one child has status=SCHEDULED
- Response includes linkedinPost and xPost objects

**Key interfaces:**
- `GET /api/dashboard/drafts` — derive status from child rows
- Response shape includes child row data

**Acceptance criteria:**
- [ ] Drafts view: EXISTS(LinkedInPost WHERE status=DRAFT) OR EXISTS(XPost WHERE status=DRAFT)
- [ ] Calendar view: EXISTS(LinkedInPost WHERE status=SCHEDULED) OR EXISTS(XPost WHERE status=SCHEDULED)
- [ ] Response includes linkedinPost and xPost objects
- [ ] Works with migrated and new data