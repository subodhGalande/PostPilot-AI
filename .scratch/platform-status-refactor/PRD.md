Status: completed

# PRD: Platform-Specific Status Refactor

## Problem Statement

The `Post` table had aggregate `status` and `scheduledAt` columns that caused synchronization issues when managing multiple platforms (LinkedIn, X) per post:

- When scheduling one platform, the aggregate `status` became SCHEDULED, but the other platform remained DRAFT - creating a mismatch
- Unscheduling one platform incorrectly cleared the other platform's schedule
- The UI couldn't properly display hybrid posts (one scheduled, one draft) in both Drafts and Calendar views
- Save-as-draft operations accidentally overwrote scheduled posts, unscheduling them

## Solution

Replaced aggregate columns with platform-specific statuses as the single source of truth:

- Dropped `status` and `scheduledAt` columns from Post table
- Kept and promoted: `linkedinStatus`, `linkedinScheduledAt`, `xStatus`, `xScheduledAt`
- Updated API routes, UI components, and database queries to use platform-specific fields
- Implemented hybrid queries: posts appear in Drafts if ANY platform is DRAFT; posts appear in Calendar if ANY platform is SCHEDULED

## User Stories

1. As a user, I want posts where one platform is scheduled and one is draft to appear in both Drafts and Calendar, so I can manage each platform independently
2. As a user, I want platform badges (LinkedIn, X) in the Drafts grid showing which platforms are in draft state, so I can quickly see what's ready to schedule
3. As a user, I want the editor to show tabs only for draft platforms (not scheduled ones), so I can only edit platforms that aren't yet published
4. As a user, I want to schedule LinkedIn first, then later schedule X, with both appearing in the calendar separately
5. As a user, I want unscheduling LinkedIn from the calendar to keep X scheduled (if X was scheduled), so I don't accidentally lose work
6. As a user, I want unscheduling the last scheduled platform to move the post back to the Drafts grid, so I can reschedule later
7. As a user, I want clicking "Save as Draft" to clear localStorage and reset the preview, preventing accidental overwrites of scheduled posts

## Implementation Decisions

- **Schema Change**: Dropped `status` (PostStatus) and `scheduledAt` (DateTime) columns from Post table
- **Platform Fields Retained**: `linkedinStatus`, `linkedinScheduledAt`, `xStatus`, `xScheduledAt`
- **Database Migration**: Applied migration to drop aggregate columns
- **Drafts API**: Updated to query `WHERE linkedinStatus = DRAFT OR xStatus = DRAFT`
- **Calendar API**: Updated to query `WHERE linkedinStatus = SCHEDULED OR xStatus = SCHEDULED`
- **Schedule API**: Modified to preserve other platform's data when scheduling one platform
- **Unschedule API**: Modified to only clear the specified platform, preserving others
- **Draft Editor**: Conditional rendering - show tabs only for platforms where status = DRAFT
- **Drafts Grid**: Platform-specific badges showing which platforms are in draft state
- **localStorage**: Cleared on Save-as-Draft to prevent stale data

### Modules Modified

- `prisma/schema.prisma` - dropped columns
- `app/api/drafts/route.ts` - hybrid queries
- `app/api/dashboard/schedulePost/route.ts` - platform preservation
- `app/api/dashboard/unschedulePost/route.ts` - selective clearing
- `app/api/dashboard/saveDraft/route.ts` - removed aggregate status
- `components/dashboard/drafts-grid.tsx` - platform badges
- `components/dashboard/post-preview.tsx` - conditional tabs
- `components/dashboard/calendar-view.tsx` - platform-specific display
- `app/dashboard/drafts/[id]/page.tsx` - platform status in select
- `app/dashboard/page.tsx` - clear localStorage on save

## Testing Decisions

- Manual testing required for full end-to-end verification
- Test cases documented in acceptance criteria below
- Prior art: existing manual testing of draft/schedule flows

### Recommended Test Cases

1. Generate post → Save as Draft → Verify both platforms show in Drafts grid with badges
2. Schedule LinkedIn → Verify LinkedIn appears in Calendar, X still in Drafts
3. Open draft from Drafts grid → Verify only X tab shows (LinkedIn is scheduled)
4. Schedule X from draft → Verify both in Calendar
5. Unschedule LinkedIn from Calendar → Verify X stays scheduled in Calendar, LinkedIn moves to Drafts
6. "Save as Draft" after scheduling → Verify localStorage cleared and preview reset

## Out of Scope

- Adding third platform support (Twitter/X v2, etc.) - Future consideration
- Automated test suite - Could be added later
- Real-time sync between calendar and drafts views - Already handled via query invalidation

## Further Notes

- The refactor aligns with the domain model: each Platform Variant has its own Independent Lifecycle
- The migration ran successfully, dropping the aggregate columns
- Prisma client regeneration required when schema changes
- Platform-specific status approach provides better query performance via indexed columns (`@@index([linkedinStatus, linkedinScheduledAt])`, `@@index([xStatus, xScheduledAt])`)

---

## Status: Complete

This PRD documents work that has been implemented and tested. No further implementation required.
