Status: completed

# PRD: Analytics Dashboard


## Problem Statement

PostPilot AI users generate social media content across LinkedIn and X but have no visibility into their own output patterns. Without analytics, users can't answer basic questions like: "How many posts did I create this month?", "What's my draft-to-schedule conversion rate?", "Am I using LinkedIn or X more?", or "Do I have a consistent content creation habit?". The sidebar already links to `/analytics` but the route 404s.

## Solution

A single-page analytics dashboard under `/dashboard/analytics` showing internal usage metrics derived from existing Post and platform variant data. Accessible from the existing sidebar "Analytics" nav item.

The page uses a KPI row + two-row layout:
- **Top**: Date range picker (7d / 30d / 90d) + 4 KPI cards (Posts Created, Scheduled, Conversion Rate, Streak)
- **Middle**: Full-width Posts Over Time line chart
- **Bottom**: 2-col grid — Platform Mix donut + Pipeline Funnel horizontal bar

Charts use Recharts. No external platform API integration (LinkedIn/X analytics) — all metrics are internal usage stats.

## User Stories

1. As a solo content creator, I want to see my total post creation volume over time, so that I can gauge my content output consistency.
2. As a user, I want to see how many of my drafted posts actually get scheduled, so that I can identify pipeline bottlenecks.
3. As a user, I want to see my LinkedIn vs X platform split, so that I can balance my cross-platform strategy.
4. As a user, I want to track my daily creation streak, so that I can maintain a consistent content habit.
5. As a user, I want to filter analytics by date range (7d / 30d / 90d), so that I can view short-term trends or long-term patterns.
6. As a user, I want to see a line chart of posts per day, so that I can spot which days are most productive.
7. As a user, I want to see a funnel showing how many posts move from Created to Scheduled, so that I can measure completion rate.
8. As a user, I want the analytics page accessible from the sidebar navigation, so that I can reach it without remembering the URL.
9. As a user, I want meaningful empty/loading/error states, so that I understand what's happening when data is unavailable.

## Implementation Decisions

### Modules

#### `lib/analytics/queries.ts` (deep module)
Prisma aggregation functions. Each function takes `(userId: string, range: DateRange)` and returns a typed result:
- `getPostVolume()` — groups posts by date truncated to day, returns `{ date, total, linkedinCount, xCount }[]`
- `getPlatformMix()` — counts posts with non-null LinkedInPost / XPost, returns `{ platform, count }[]`
- `getPipelineFunnel()` — counts total posts vs posts with >=1 platform SCHEDULED, returns `{ stage, count }[]`
- `getStreak()` — walks backward from today counting consecutive days with >=1 post created
- `getPostCounts()` — returns total and scheduled counts for KPI cards
- Shared `DateRange` type with `startDate`, `endDate`, `label`

#### `lib/analytics/types.ts`
Shared types: `AnalyticsData`, `DateRange`, `VolumePoint`, `PlatformSlice`, `FunnelStage`

#### `app/api/dashboard/analytics/route.ts` (shallow module)
`GET /api/dashboard/analytics?range=7d`. Authenticated. Calls `requireAuthJose()`, parses range param, calls query fns, returns JSON of `AnalyticsData`.

#### `app/dashboard/analytics/page.tsx` (server component)
Fetches initial data server-side via `analyticsQueries`. Passes as props to `AnalyticsContent`. Enables SSR and immediate paint without client fetch.

#### `app/dashboard/analytics/analytics-content.tsx` (client component)
Manages `selectedRange` state (default `30d`). On range change, fetches `GET /api/dashboard/analytics?range=...` via `useQuery`. Passes data to chart components. Handles loading/error states with skeletons and inline alerts.

#### `components/analytics/kpi-card.tsx`
Receives `{ label, value, icon, trend? }`. Renders shadcn Card with icon, formatted value, label. Shows `—` for no-data state.

#### `components/analytics/posts-over-time-chart.tsx`
Receives `VolumePoint[]`. Renders Recharts `ResponsiveContainer` > `LineChart` > `Line`. One line for total, optional colored lines for platform breakdown. X-axis = date, Y-axis = count. Tooltip on hover.

#### `components/analytics/platform-donut-chart.tsx`
Receives `PlatformSlice[]`. Renders Recharts `PieChart` > `Pie`. LinkedIn blue (#0A66C2), X dark (#1DA1F2). Custom label showing percentage.

#### `components/analytics/pipeline-funnel-chart.tsx`
Receives `FunnelStage[]`. Renders Recharts horizontal `BarChart` with custom bar labels showing count and percentage drop-off.

#### `components/analytics/date-range-picker.tsx`
Receives `{ value: DateRange, onChange }`. Renders 3 toggle buttons: 7d, 30d, 90d. Active state highlighted.

### Architecture

```
Server component:
  page.tsx → requireAuthJose() → analyticsQueries(userId, range) → props

Client component:
  analytics-content.tsx ← props (initialData, userId)
    date-range-picker ← value, onChange
    useQuery(range) → fetch /api/dashboard/analytics?range=...
    kpi-card (×4)
    posts-over-time-chart
    platform-donut-chart | pipeline-funnel-chart
```

### Data Flow
1. Initial render: server component fetches and passes data — instant paint
2. Range change: client component calls `GET /api/dashboard/analytics?range=7d`, replaces data with `useQuery` cache
3. No optimistic updates needed (read-only page)
4. No revalidation needed (data fetched fresh on range change)

### Schema Changes
None. All metrics derived from existing `Post.linkedinPost` / `Post.xPost` relations and `createdAt` timestamps.

### API Contract
```
GET /api/dashboard/analytics?range=7d
Authorization: Bearer <jwt>

Response 200:
{
  kpis: { totalPosts, scheduledPosts, conversionRate, streak },
  volume: [{ date: "2026-06-01", total: 5, linkedin: 3, x: 2 }, ...],
  platformMix: [{ platform: "linkedin", count: 160 }, { platform: "x", count: 87 }],
  funnel: [{ stage: "Created", count: 247 }, { stage: "Scheduled", count: 63 }]
}
```

## Testing Decisions

Tests explicitly skipped per user instruction.

## Out of Scope

- External platform engagement metrics (likes, impressions, reach) — requires LinkedIn/X API integration
- Team/org multi-user views — current schema is per-user
- Custom date range picker beyond 7d/30d/90d buttons
- Export to CSV/PDF
- Real-time updates or WebSocket push
- Scheduled post completion tracking (publishing) — no external API access yet

## Further Notes

- Charts library: Recharts (lightweight, composable, no new install needed with Tailwind v4)
- Empty states show per-chart: "No activity in this period" with link to `/dashboard`
- Loading states: shadcn Skeleton components matching chart aspect ratios
- Date range defaults to 30d on first visit
- Streak calculation counts consecutive days from today backward; only days with >=1 Post created count
