Status: completed

# PRD: Profile Page


## Problem Statement

PostPilot AI has no dedicated identity space. Profile fields (name, account name, industry, account type, description) live inside `/dashboard/settings` alongside security and appearance — a grab-bag with no clear owner. Users cannot see personal stats, recent activity, or a summary of their content footprint in one place. There is no avatar support despite that being table-stakes for any account-driven app. The sidebar footer hardcodes "Subodh" as the user name and shows a generic icon instead of the real logged-in user.

## Solution

A dedicated Profile page at `/dashboard/profile` that shows who the user is, what they've done, and lets them edit identity info plus upload an avatar. Settings loses its profile section and becomes purely Security + Appearance. The sidebar footer becomes dynamic — real user name, avatar, and clickable link to profile.

## User Stories

1. As a user, I want a Profile page separate from Settings, so that I can view and manage my identity in one place.
2. As a user, I want to upload an avatar photo, so that my account feels personalized.
3. As a user, I want to edit my display name, account name, industry, account type, and description from my profile, so that I can keep my info current.
4. As a user, I want to see my lifetime stats (total posts, current streak, conversion rate, scheduled posts) on my profile, so that I can track my content footprint at a glance.
5. As a user, I want to see my recent activity (last 10 posts with titles, dates, and platform badges), so that I can quickly recall what I have published.
6. As a user, I want my avatar to appear in the sidebar footer, so that I feel logged in and can navigate to my profile from anywhere.
7. As a user, I want the sidebar footer to show my real name and email instead of a hardcoded placeholder, so that the UI reflects my actual account.
8. As a user, I want the sidebar footer to be clickable and link to my profile page, so that I can reach it without hunting through navigation.
9. As a user, I want Settings to be focused on system preferences only (security, appearance), so that I do not have to scan irrelevant sections.
10. As a user, I want instant feedback when I upload an avatar, so that I know the upload succeeded without waiting.
11. As a user, I want file type and size validation on avatar upload, so that I do not accidentally upload unsupported files.
12. As a user, I want the profile form to re-populate with saved data after a successful save, so that the form reflects the current server state.
13. As a user, I want form validation errors shown inline before submission, so that I can correct mistakes immediately.
14. As a user, I want a success toast after saving my profile, so that I have clear feedback that the change was applied.

## Implementation Decisions

### Layout

Single-column scroll: profile form at top, stats cards below, recent activity at bottom. No tabs or sub-navigation.

### Modules

#### New — Deep Modules

**lib/profile/queries.ts**
- Exports `getProfileData(userId: string) => Promise<ProfileData>`
- Encapsulates fetching user record, lifetime stats (totalPosts, scheduledPosts, conversionRate, streak via analytics lib), and last 10 posts
- Returns shaped object: `{ user, stats, recentPosts }`

**lib/profile/avatar.ts**
- Exports `uploadAndAttachAvatar(userId: string, file: File) => Promise<string>`
- Handles UploadThing upload, validates file type/size, writes avatarUrl to user record, returns URL
- Encapsulates UploadThing SDK complexity behind a simple function

#### New — Shallow Modules

| Module | Role |
|---|---|
| `app/dashboard/profile/page.tsx` | Server component: auth guard, calls `getProfileData`, renders client shell |
| `components/profile/profile-page.tsx` | Client shell: composes form + stats + activity, manages query invalidation |
| `components/profile/profile-form.tsx` | React Hook Form for name, accountName, industry, accountType, description. Adapted from current ProfileSection in Settings |
| `components/profile/avatar-upload.tsx` | Click avatar -> file picker -> UploadThing upload -> callback with new URL |
| `components/profile/profile-stats.tsx` | Four stat cards (total posts, streak, conversion rate, scheduled). Pure presentational |
| `components/profile/recent-activity.tsx` | Last 10 posts list with title, date, platform badges. Pure presentational |

#### Modified — Shallow Modules

| Module | Changes |
|---|---|
| `app/dashboard/settings/page.tsx` | Remove ProfileSection import and usage. Keep SecuritySection + AppearanceSection only |
| `components/app-sidebar.tsx` | Footer: use `useUser()` for name/email/avatar, wrap in Link to `/dashboard/profile` |
| `app/dashboard/dashboard-shell.tsx` | Add `/dashboard/profile` to `getRouteMeta` with title "Profile" / "Account" |

### Schema Changes

Add `avatarUrl String?` nullable field to `User` model in Prisma schema. Requires new migration.

### API Contracts

**PATCH /api/dashboard/profile**
```
Body: { name?, accountName?, industry?, accountType?, description?, avatarUrl? }
200 -> { message: "Profile updated" }
400 -> { message: "Validation error" }
401 -> { message: "Unauthorized" }
```

**POST /api/uploadthing** (standard UploadThing route)
- File router: image upload, max 2MB, jpg/png/webp only
- Returns uploaded file URL

### Data Flow

```
Profile page (server):
  requireAuthJose()
  getProfileData(userId) -> { user, stats, recentPosts[] }
  render profile-page client component with data as props

Profile page (client):
  ProfileForm edits -> PATCH /api/dashboard/profile -> invalidate `currentUser` query
  AvatarUpload -> POST /api/uploadthing -> returns url -> PATCH { avatarUrl } -> invalidate
  ProfileStats + RecentActivity render from server-passed props (no client fetching)
```

### Nav Behavior

Sidebar footer becomes `<Link href="/dashboard/profile">`. Shows real avatar from `useUser().user.avatarUrl` (fallback to initials or User icon), real name, email subtitle. No separate nav item in sidebar menu.

### Settings Page After

Two sections only: SecuritySection + AppearanceSection. Single scroll layout unchanged. The ProfileSection component is removed entirely.

### UploadThing Setup

- `npm install uploadthing @uploadthing/react`
- `lib/uploadthing/core.ts` — FileRouter with image route (maxFileSize: "2MB", allowed: ["image/jpeg", "image/png", "image/webp"])
- `app/api/uploadthing/core.ts` — route handler
- `app/api/uploadthing/route.ts` — Next.js GET/POST route export
- Use existing `UPLOADTHING_TOKEN` env var

## Testing Decisions

Skipped for this iteration.

## Out of Scope

- Email address change (requires re-verification flow).
- Public profile page visible to other users.
- Notification preferences.
- API key management or third-party integrations.
- Account deletion / deactivation.
- Avatar cropping or editing tools.
- Two-factor authentication.
- Google account unlinking.
- Removing the old `/api/dashboard/settings/profile` endpoint (keep for backward compat).

## Further Notes

- UploadThing free tier (500 files, 2GB total) covers avatar uploads easily.
- Sidebar footer link to profile replaces today's dead User icon and hardcoded "Subodh" text.
- The previous Settings PRD's `/api/dashboard/settings/profile` endpoint remains active for backward compatibility — can be removed in a later cleanup pass after confirming the Profile page works.
- Deep modules (`lib/profile/queries.ts`, `lib/profile/avatar.ts`) are candidates for unit tests in a future iteration.
