Status: completed

# Issue: Platform Mix + Pipeline Funnel


## Parent

PRD: `.scratch/analytics-dashboard/PRD.md`

## What to build

Bottom row of the analytics page: a platform mix donut chart (LinkedIn vs X) and a pipeline funnel bar chart (Created → Scheduled drop-off). Completes the full analytics page.

## Acceptance criteria

- [ ] `lib/analytics/queries.ts` exports `getPlatformMix(userId, range)` returning `{ platform, count }[]` and `getPipelineFunnel(userId, range)` returning `{ stage, count }[]`
- [ ] API response includes `platformMix` and `funnel` arrays
- [ ] `components/analytics/platform-donut-chart.tsx` renders Recharts `PieChart` with LinkedIn blue (#0A66C2) and X dark (#1DA1F2), percentage labels
- [ ] `components/analytics/pipeline-funnel-chart.tsx` renders Recharts horizontal `BarChart` with bar labels showing count and percentage drop
- [ ] Bottom row is 2-col grid on `lg+`, single column stacked on mobile
- [ ] If only one platform has data, donut renders as single slice (full circle)
- [ ] If funnel has equal counts (all posts scheduled), bar shows 100% retention
- [ ] Empty states per chart as in issue 01 pattern

## Blocked by

- `.scratch/analytics-dashboard/issues/01-kpi-cards.md`
