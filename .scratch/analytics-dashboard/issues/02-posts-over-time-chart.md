Status: completed

# Issue: Posts Over Time Chart


## Parent

PRD: `.scratch/analytics-dashboard/PRD.md`

## What to build

A full-width line chart showing post creation volume over time. Extends the existing queries, API, and page layout from issue 01.

## Acceptance criteria

- [ ] `lib/analytics/queries.ts` exports `getPostVolume(userId, range)` returning `{ date, total, linkedinCount, xCount }[]` — aggregated per day
- [ ] API response includes `volume: [...]` array alongside existing `kpis`
- [ ] `components/analytics/posts-over-time-chart.tsx` renders Recharts `LineChart` with X-axis (date) and Y-axis (count)
- [ ] Chart shows 3 lines: total (solid), linkedin (dashed blue), x (dashed dark) — or toggleable via legend
- [ ] Tooltip on hover shows date + counts
- [ ] Chart is full width, responsive, sits between KPI row and bottom grid
- [ ] Empty state: centered "No activity in this period" message
- [ ] Loading state: skeleton matching chart aspect ratio

## Blocked by

- `.scratch/analytics-dashboard/issues/01-kpi-cards.md`
