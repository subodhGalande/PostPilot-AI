Status: completed

## What to build

Set up UploadThing for image uploads and add an avatar upload component to the profile page. Users click their avatar, pick a file (jpg/png/webp, max 2MB), see instant feedback, and the new avatar appears immediately on the profile page and sidebar footer.

Create the UploadThing infrastructure (file router, API route, react client) and the avatar-upload UI component that integrates into the profile form area.

## Acceptance criteria

- [ ] `uploadthing` and `@uploadthing/react` packages are installed
- [ ] `lib/uploadthing/core.ts` defines a FileRouter with an image route (maxFileSize: "2MB", contentDisposition: "inline", allowed: jpg/png/webp)
- [ ] `app/api/uploadthing/core.ts` exports the route handler using the FileRouter
- [ ] `app/api/uploadthing/route.ts` exports GET and POST handlers for the UploadThing Next.js route
- [ ] `UPLOADTHING_TOKEN` env var is read by the UploadThing configuration (value already exists in .env)
- [ ] `components/profile/avatar-upload.tsx` shows the current avatar (or initials fallback) with a click-to-upload trigger
- [ ] Clicking the avatar opens the native file picker filtered to image types
- [ ] After upload completes, the new avatar URL is sent via `PATCH /api/dashboard/profile { avatarUrl }`
- [ ] Profile page shows the new avatar immediately after upload (via query invalidation)
- [ ] Sidebar footer shows the new avatar immediately (via shared `currentUser` query key)
- [ ] Upload errors show a toast error message
- [ ] File type rejection (non-image) shows a user-friendly error
- [ ] File size rejection (>2MB) shows a user-friendly error

## Blocked by

- 03-profile-editing-form (avatar upload component lives on the profile page and updates via the profile API endpoint)
