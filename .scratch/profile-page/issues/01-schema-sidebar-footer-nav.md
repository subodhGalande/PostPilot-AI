Status: completed

## What to build

Add `avatarUrl` to the User model and wire the sidebar footer to show real user data (name, email, avatar) with a clickable link to `/dashboard/profile`. Update the dashboard shell route metadata to recognize the profile route.

This is the foundation slice — no profile page yet, but the sidebar becomes dynamic so users see their real identity and can reach the profile route (even if it returns 404 until slice 2 lands).

## Acceptance criteria

- [ ] User model in Prisma schema has `avatarUrl String?` column
- [ ] Migration creates the column in the database
- [ ] `GET /api/dashboard/user` includes `avatarUrl` in the response
- [ ] `GET /api/dashboard/user` select includes `avatarUrl` and `onboarded`
- [ ] Sidebar footer shows real user name from `useUser()` context instead of hardcoded "Subodh"
- [ ] Sidebar footer shows user email as secondary text
- [ ] Sidebar footer shows avatar if `avatarUrl` exists, initials fallback otherwise, User icon as last fallback
- [ ] Sidebar footer is wrapped in `<Link href="/dashboard/profile">`
- [ ] `getRouteMeta` in dashboard-shell includes `/dashboard/profile` with title "Profile" / "Account"

## Blocked by

None — can start immediately.
