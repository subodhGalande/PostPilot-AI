Status: completed

## What to build

Create the `/dashboard/profile` page as a server component that shows the user's profile info, lifetime stats, and recent activity — all read-only. No editing or avatar upload yet.

Build a `getProfileData(userId)` deep module in `lib/profile/queries.ts` that encapsulates fetching the user record, computing lifetime stats (total posts, streak, conversion rate, scheduled posts via the existing analytics lib), and fetching the last 10 posts.

Create presentational components for stats cards and recent activity list.

## Acceptance criteria

- [ ] `lib/profile/queries.ts` exports `getProfileData(userId)` returning `{ user, stats: { totalPosts, streak, conversionRate, scheduledPosts }, recentPosts[] }`
- [ ] `app/dashboard/profile/page.tsx` exists as a server component, calls `requireAuthJose()`, calls `getProfileData()`, renders client shell
- [ ] `components/profile/profile-stats.tsx` renders 4 stat cards: total posts, current streak, conversion rate, scheduled posts
- [ ] `components/profile/recent-activity.tsx` renders last 10 posts with title, date, platform badges (LinkedIn / X)
- [ ] Profile page is accessible at `/dashboard/profile` via sidebar footer link
- [ ] Page shows "Profile" header with description "Account overview"
- [ ] Data is server-fetched and passed as props (no client-side data fetching)

## Blocked by

- 01-schema-sidebar-footer-nav (needs sidebar link and route meta to reach the page)
