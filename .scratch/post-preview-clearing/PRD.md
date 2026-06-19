Status: completed

# Post Preview Clearing on Platform Operation


## Problem Statement

When a user generates a post for both LinkedIn and X platforms, operates on one platform (schedules or saves as draft), and then clicks "Save as Draft" for the other platform, the dashboard view retains the generated post preview unnecessarily. This creates a stale UI state where no further action is needed but the preview remains visible.

## Solution

When a user operates on a Platform Variant (schedules it or saves it as draft), that Platform Variant is removed from the dashboard view. The other Platform Variant remains visible if it still has a DRAFT status. When both Platform Variants have been operated on, the post preview is cleared and the dashboard returns to the "Ready to Write" empty state. sessionStorage is updated to reflect these changes.

## User Stories

1. As a content creator, I want the operated platform to be removed from view immediately after saving, so that I can focus on the remaining platform.
2. As a content creator, I want the dashboard to show only the platforms that still need action, so that I can quickly identify what remains to be done.
3. As a content creator, I want the dashboard to show "Ready to Write" when all platforms have been operated on, so that I know the generation cycle is complete.
4. As a content creator, I want my form configuration (topic, tone, keywords, etc.) to persist after clearing the preview, so that I can quickly iterate and generate again.
5. As a content creator, I want sessionStorage to be cleared when both platforms are handled, so that refreshing the page doesn't show confusing stale state.
6. As a content creator, I want to be warned with an error toast if save/schedule fails, so that I can retry without losing my content.
7. As a content creator, I want the save button to be debounced, so that rapid clicks don't cause duplicate save requests.
8. As a content creator, I want to see a platform-specific "Save as Draft" action, so that I can save each Platform Variant independently while keeping the same Draft.
9. As a content creator, I want "Save as Draft" to persist content without changing the Platform Status from DRAFT, so that the platform variant remains editable.
10. As a content creator, I want the Drafts list to show only Drafts with at least one DRAFT platform variant, so that I can quickly find posts needing attention.
11. As a content creator, I want the Drafts list card to show platform indicators only for DRAFT platforms, so that I can see at a glance which platforms still need scheduling.
12. As a content creator, I want scheduled-only posts to appear only in the Calendar view, so that the Drafts list stays focused on actionable items.
13. As a content creator, I want to unschedule a post from Calendar and have it return to the Drafts list, so that I can move it back to draft status for further editing.
14. As a content creator, I want to be able to save a DRAFT platform variant without affecting the other platform variant's visibility, so that I can handle them in any order.
15. As a content creator, I want the generatedPostPack state to reflect only remaining DRAFT platforms, so that the dashboard state matches what the user sees.
16. As a content creator, I want the Draft to update in the database for the operated platform while keeping the same Draft record, so that both platform variants remain linked under the same baseIdea.
17. As a content creator, I want to be able to navigate away and back to the dashboard without losing my progress, so that sessionStorage correctly restores only the remaining DRAFT platform.
18. As a content creator, I want no confirmation dialog before clearing the preview, so that the workflow feels fast and responsive.

## Implementation Decisions

### Dashboard Page Handler

- Update `onSaveDraft` handler to accept `platform` parameter
- Clear the operated platform from `generatedPostPack.posts[0]`
- When both handled: clear `generatedPostPack`, call `clearDraftState()`, reset `isGenerated` to false
- When one remains: update `generatedPostPack` with only the remaining platform data

### sessionStorage Management

- On single platform clear: update sessionStorage with the reduced post pack
- On both cleared: call `clearDraftState()` to remove the draft key entirely

### PostPreview Component

- Update `onSaveDraft` callback to pass `platform` parameter
- Add 500ms debounce to prevent double-submit

### Drafts List Filtering

- Filter to show only posts where at least one platform has DRAFT status
- Platform indicators shown only for DRAFT platforms

### Error Handling

- On save failure: do not clear preview state, show error toast
- Allow user to retry

## Testing Decisions

### Modules to Test

1. Dashboard page save handler — clearing logic based on which platform was saved
2. sessionStorage sync — correct state after single clear and full clear
3. Drafts list filtering — only posts with DRAFT platforms appear

### Prior Art

Existing test file `components/dashboard/post-preview.test.tsx` demonstrates the testing pattern using GeneratedPostPack fixtures.

## Out of Scope

- Confirmation dialogs before clearing preview
- Database schema changes
- Notification/email features
- Bulk operations on multiple drafts

## Further Notes

The existing `handleReset` function in the dashboard page provides a template for how clearing should work. The key difference is that reset clears everything, while this feature clears incrementally based on which platform was operated.

The PostPreview component already hides non-DRAFT tabs via conditional rendering (lines 120-129), so no UI changes needed there — the clearing of state will automatically reflect in the UI.

The sessionStorage key (`DRAFT_STATE_KEY`) already exists and is used by the draft persistence system — we just need to update it on platform clear rather than only on full reset.

## Comments
