Status: needs-triage

## Parent

Avatar improvements at `.scratch/profile-page/`.

## What to build

Add server-side authentication to the UploadThing middleware. Currently the middleware returns an empty object — any client with the UploadThing token can upload files. Add a `requireAuthJose()` check in `.middleware()` and return the authenticated `userId` for use in `onUploadComplete`.

End-to-end: unauthenticated upload requests to UploadThing endpoint are rejected at middleware level before any file is stored.

## Acceptance criteria

- [ ] `lib/uploadthing/core.ts` `.middleware()` calls `requireAuthJose()`
- [ ] Middleware returns `{ userId: string }` when authenticated
- [ ] Unauthenticated requests receive a 401 error from UploadThing
- [ ] `onUploadComplete` receives `{ userId }` in metadata
- [ ] Existing upload flow continues working for authenticated users

## Blocked by

None - can start immediately.
