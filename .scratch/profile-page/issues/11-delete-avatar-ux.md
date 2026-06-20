Status: needs-triage

## Parent

Avatar improvements at `.scratch/profile-page/`.

## What to build

Add a trash icon button alongside the existing pencil icon on the avatar display. Clicking trash removes the avatar: reverts to initials fallback, deletes old file from UploadThing CDN, and clears `avatarUrl` + `avatarFileKey` in DB. Shows success toast.

End-to-end: user clicks trash icon -> avatar reverts to initials -> old CDN file deleted -> toast confirms.

## Acceptance criteria

- [ ] Trash icon rendered at bottom-right of avatar (same position style as pencil, same size `size-7 md:size-8`)
- [ ] Trash icon only visible when `avatarUrl` is truthy (no trash for already-initials state)
- [ ] Clicking trash calls `removeAvatar()` which sends PATCH `{ avatarUrl: null, avatarFileKey: null }`
- [ ] Server handler deletes old file from UploadThing CDN via `utapi.deleteFiles()`
- [ ] `["currentUser"]` query invalidated on success
- [ ] Toast shows "Avatar removed" on success, error toast on failure

## Blocked by

- `09-avatar-filekey-upload-helper` (needs `avatarFileKey` schema + `removeAvatar` helper + utapi auth)
