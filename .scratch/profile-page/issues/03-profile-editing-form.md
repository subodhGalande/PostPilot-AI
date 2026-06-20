Status: completed

## What to build

Add profile editing capability to the profile page and clean up Settings. Create a `PATCH /api/dashboard/profile` endpoint and a form component (adapted from the existing Settings ProfileSection) that lets users edit display name, account name, industry, account type, and description.

Create the client-side `profile-page.tsx` shell that composes the form together with the stats and recent activity components from slice 2. After this slice, the Settings page loses its ProfileSection and only shows Security + Appearance.

## Acceptance criteria

- [ ] `PATCH /api/dashboard/profile` endpoint accepts `{ name, accountName, industry, accountType, description }` with zod validation
- [ ] `PATCH /api/dashboard/profile` returns 200 on success, 400 on validation error, 401 on unauthorized
- [ ] `PATCH /api/dashboard/profile` invalidates the current session's user data (via tokenVersion or query invalidation)
- [ ] `components/profile/profile-form.tsx` includes fields: display name, brand/influencer name, account type (select: Brand/Influencer), industry, description (textarea)
- [ ] Profile form uses react-hook-form with zod validation matching Settings schema
- [ ] Profile form shows inline validation errors before submission
- [ ] Profile form shows loading state (submit button disabled + "Saving...") during mutation
- [ ] Profile form shows success toast after save
- [ ] Profile form re-populates with saved data after successful mutation
- [ ] `components/profile/profile-page.tsx` client shell composes form (top), stats (middle), recent activity (bottom) in single-column scroll
- [ ] `app/dashboard/settings/page.tsx` no longer imports or renders ProfileSection
- [ ] Old `PATCH /api/dashboard/settings/profile` endpoint is preserved for backward compatibility

## Blocked by

- 02-profile-page-read-only (needs the profile page and components to attach form to)
