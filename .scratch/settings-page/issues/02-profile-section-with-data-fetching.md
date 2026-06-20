Status: completed

## What to build

Build the full profile section stack end-to-end: a GET endpoint to serve the current user profile, a TanStack Query hook to fetch and cache it, a PATCH endpoint to update it, Zod schemas for validation, and the Profile section form component with react-hook-form.

The profile form is a single form with fields: name, accountName, industry, accountType (Brand/Influencer select), and description (textarea). On save, the form calls the PATCH endpoint, invalidates the query cache so the form re-populates with fresh data, and shows a success toast.

## Acceptance criteria

- [ ] `GET /api/dashboard/user` returns the authenticated user's id, name, email, accountName, industry, accountType, description, and provider
- [ ] A `useQuery` hook with queryKey `["currentUser"]` fetches and caches the profile data
- [ ] The Profile section renders on the settings page with all 5 fields pre-populated from the query
- [ ] `PATCH /api/dashboard/settings/profile` accepts `{ name, accountName, industry, accountType, description }` and updates the database
- [ ] Submitting the form shows a success toast and invalidates the `["currentUser"]` query
- [ ] Validation errors appear inline on the form fields
- [ ] The form submit button shows a loading state while the request is in flight

## Blocked by

- [01-settings-shell-appearance](./01-settings-shell-appearance.md) — needs the settings page shell to exist
