# Issue: KPI Cards + Date Range Picker

Status: ready-for-agent

## Parent

PRD: `.scratch/analytics-dashboard/PRD.md`

## What to build

Analytics page skeleton with 4 KPI cards (Posts Created, Scheduled, Conversion Rate, Streak) and a date range picker (7d/30d/90d). Covers the full stack: data queries, API endpoint, page shell, and UI components.

The page is accessible at `/dashboard/analytics` from the existing sidebar nav item.

## Acceptance criteria

- [ ] `lib/analytics/queries.ts` exports `getPostCounts(userId, range)` returning `{ totalPosts, scheduledPosts, conversionRate }` and `getStreak(userId)` returning consecutive-day count
- [ ] `lib/analytics/types.ts` defines `DateRange`, `AnalyticsKpis` types
- [ ] `GET /api/dashboard/analytics?range=7d` returns `{ kpis: { totalPosts, scheduledPosts, conversionRate, streak } }` — authenticated, returns 401 if no JWT
- [ ] `app/dashboard/analytics/page.tsx` — server component, calls `requireAuthJose()`, fetches initial data via queries, passes to `AnalyticsContent`
- [ ] `app/dashboard/analytics/analytics-content.tsx` — client component, manages `selectedRange` state, fetches on range change via `useQuery`, handles loading/error/empty states
- [ ] `components/analytics/kpi-card.tsx` — renders shadcn Card with label, formatted value, icon. Shows `—` for no-data
- [ ] `components/analytics/date-range-picker.tsx` — 3 toggle buttons (7d / 30d / 90d), active state highlighted
- [ ] Sidebar `/analytics` nav item already exists and routes correctly to new page
- [ ] Loading state shows Skeleton cards; error state shows inline alert with retry; empty state shows `—` on cards with no data
- [ ] Date range defaults to 30d on first visit

## Blocked by

None — can start immediately
