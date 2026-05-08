# PRD: Content Calendar Dashboard

Status: ready-for-human (implemented)

## Problem Statement

Users of PostPilot AI need a centralized way to visualize, manage, and reschedule their generated social media posts across different platforms. Without a visual calendar, it is difficult to maintain a consistent posting schedule and understand the overall content strategy for both LinkedIn and X.

## Solution

A full-screen interactive Content Calendar that displays scheduled posts as vibrant, platform-specific cards. The calendar supports monthly and weekly views, drag-and-drop rescheduling, and a high-contrast dark mode to ensure professional readability in all environments.

## User Stories

1. As a content creator, I want to see all my scheduled posts on a calendar, so that I can visualize my weekly and monthly posting volume.
2. As a social media manager, I want to distinguish between LinkedIn and X posts at a glance using color coding, so that I can quickly assess platform coverage.
3. As a user, I want a high-contrast dark mode version of the calendar, so that I can manage my schedule comfortably in low-light environments.
4. As a content creator, I want to drag and drop posts to different days, so that I can easily adjust my schedule without opening individual edit forms.
5. As a user, I want to see the exact time a post is scheduled within the calendar card, so that I don't have to click into details to know the timing.
6. As a user, I want the "today" date to be clearly highlighted, so that I can easily orient myself within the current week.
7. As a content creator, I want to see a preview of the post content on the calendar card, so that I can identify the topic of each post immediately.

## Implementation Decisions

### Modules & Components
- **FullCalendar Integration**: Uses `@fullcalendar/react` with `dayGrid`, `timeGrid`, and `interaction` plugins to handle the core visualization and drag-and-drop logic.
- **Platform-Specific Styling**: Implemented via custom CSS classes in `app/globals.css`. 
    - **LinkedIn**: Vibrant blue theme (`bg-blue-600/20`, `border-blue-400/40` in dark mode).
    - **X (Twitter)**: Crisp slate theme (`bg-slate-400/15`, `border-slate-300/40` in dark mode).
- **Dark Mode Support**: Utilizes Tailwind CSS variants and CSS variables (`oklch`) to adjust contrast and colors dynamically. Today's highlight uses a subtle ring and background adjustment for clarity without clutter.

### Technical Clarifications
- **Drag-and-Drop**: Triggers a `rescheduleMutation` that calls the `/api/dashboard/schedulePost` endpoint with the new date, maintaining the `clientDraftKey` and existing content.
- **Date Picking**: The `DayPicker` component (`components/ui/calendar.tsx`) has been enhanced to match the high-contrast dashboard aesthetic, including refined states for "today", "selected", and "outside" days.

## Testing Decisions

- **Visual Regression**: Ensure that platform-specific cards maintain high contrast across both light and dark modes.
- **Interaction Testing**: Verify that dragging a post successfully updates its scheduled time in the database and triggers a success toast.
- **Responsive Layout**: Confirm the calendar remains usable on smaller screens (though optimized for desktop dashboard use).

## Out of Scope
- Direct editing of post content within the calendar (currently handled by navigating to the post editor).
- Support for platforms other than LinkedIn and X in the initial version.

## Further Notes
The "Subtle/Clean" but "Vibrant" aesthetic was achieved by using semi-transparent background tints with higher-saturation borders, ensuring that the UI feels modern and energetic without being garish.
