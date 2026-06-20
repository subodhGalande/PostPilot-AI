Status: completed

## What to build

Create the settings page shell at `/dashboard/settings` with the Appearance section (Light/Dark/Auto theme radio group). Update the sidebar to point to the new route and remove the redundant theme dropdown from the sidebar footer. Fix the dashboard shell header metadata to recognise the `/dashboard/settings` route.

This slice delivers the page foundation and the Appearance section as a single vertical slice through layout, navigation, and UI.

## Acceptance criteria

- [ ] Navigating to `/dashboard/settings` renders a page within the existing dashboard layout (sidebar, header, auth guard)
- [ ] The sidebar Settings nav item links to `/dashboard/settings` and highlights when on that page
- [ ] The sidebar footer no longer has the theme dropdown (Light/Dark/Auto button)
- [ ] The dashboard shell header shows "Preferences" section and "Settings" title when on `/dashboard/settings`
- [ ] The Appearance section shows a radio group with Light, Dark, and Auto options
- [ ] Selecting a theme takes effect immediately and persists across page reloads (via existing `next-themes`)
- [ ] The page has no profile or security content yet — just a heading and the appearance section

## Blocked by

None — can start immediately
