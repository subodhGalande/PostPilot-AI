Status: needs-triage

## Parent

Avatar improvements at `.scratch/profile-page/`.

## What to build

Extract a shared `<Avatar>` component using `@radix-ui/react-avatar` (already installed) and Next.js `<Image>` for optimization. Add `uploadthing.com` to Next.js remotePatterns. Replace raw `<img>` tags in `avatar-upload.tsx` and `app-sidebar.tsx` with the shared component.

End-to-end: avatar renders in sidebar and profile page using Next.js optimized images (auto WebP, lazy loading, responsive sizing) with proper fallback states (initials, icon).

## Acceptance criteria

- [ ] `components/ui/avatar.tsx` wraps `@radix-ui/react-avatar` with `<Image>` for src rendering
- [ ] Component accepts props: `src: string | null`, `alt: string`, `fallback: string` (initials), `size: number`
- [ ] Component renders fallback initials when `src` is null, fallback icon when neither src nor alt provided
- [ ] `uploadthing.com` added to `next.config.ts` remotePatterns
- [ ] `avatar-upload.tsx` uses shared `<Avatar>` component
- [ ] `app-sidebar.tsx` uses shared `<Avatar>` component
- [ ] Images load with `loading="lazy"` via Next.js `<Image>`
- [ ] Avatar renders correctly in all states: with image, initials only, loading, error

## Blocked by

None - can start immediately (parallel with other slices).
