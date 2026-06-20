Status: needs-triage

## Parent

Avatar improvements at `.scratch/profile-page/`.

## What to build

Add `avatarFileKey` column to User model and extract a `lib/profile/avatar.ts` helper module that encapsulates UploadThing upload logic. On upload/replace, store the UploadThing file key in DB and delete the old file from CDN.

End-to-end: user uploads avatar -> fileKey saved alongside URL in DB. User uploads new avatar overwriting old -> old file deleted from UploadThing CDN before new URL+key saved.

## Acceptance criteria

- [ ] User model has `avatarFileKey String?` column (new migration)
- [ ] `lib/profile/avatar.ts` exports `validateAvatarFile(file): { valid, error? }` — checks type (jpg/png/webp) and size (<=2MB), extracted from inline validation in component
- [ ] `lib/profile/avatar.ts` exports `uploadAndAttachAvatar(userId, file): Promise<string>` — uploads to UploadThing, saves URL + fileKey via PATCH, returns URL
- [ ] `lib/profile/avatar.ts` exports `replaceAvatar(userId, file): Promise<string>` — deletes old fileKey from CDN, uploads new, saves new URL + key, returns URL
- [ ] `lib/profile/avatar.ts` exports `removeAvatar(userId): Promise<void>` — sets avatarUrl and avatarFileKey to null, deletes old file from CDN
- [ ] PATCH `/api/dashboard/profile` accepts `avatarFileKey` in body and saves it alongside `avatarUrl`
- [ ] PATCH endpoint deletes old file from UploadThing CDN via `utapi.deleteFiles()` when avatarUrl changes
- [ ] `useUserProfile` type includes `avatarFileKey: string | null`

## Blocked by

None - can start immediately.
