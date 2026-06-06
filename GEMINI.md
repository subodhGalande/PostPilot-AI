# PostPilot-AI Architectural Mandates

## Single Source of Truth (SSOT)

We strictly follow a **Relational SSOT** pattern for post lifecycle and content.

1.  **Status & Scheduling**: Metadata like `status` and `scheduledAt` must reside ONLY in top-level Prisma columns (e.g., `linkedinStatus`, `xScheduledAt`). 
2.  **Platform Content**: Content for different platforms must be stored in dedicated JSON columns (e.g., `linkedinContent`, `xContent`) to allow for atomic updates and easier maintenance.
3.  **No Redundancy**: Metadata MUST NOT be duplicated inside the platform JSON blobs. The API is responsible for stripping this data before storage and reconstructing a unified object for the frontend when fetching.
4.  **Shared Fields**: Fields shared across all variants (like `topic`, `baseIdea`, and `model`) must be promoted to top-level columns.

## Workflow Conventions

- **Atomic Refactoring**: When adding a new platform, create dedicated columns for its status, schedule, and content.
- **Data Integrity**: Always use the `reconstructPostContent` utility in `lib/drafts.ts` when fetching data to ensure the frontend receives a consistent object structure.
