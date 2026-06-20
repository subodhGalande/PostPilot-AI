Status: completed

# PRD: Settings Page


## Problem Statement

Users of PostPilot AI currently have no way to manage their profile information, change their password, or customize their theme within the application. The profile fields collected during onboarding (account name, industry, account type, description) cannot be edited after initial setup. The only theme control lives in the sidebar footer — it works but is an unusual location for settings. Users need a single, consolidated place to manage their account preferences.

## Solution

A dedicated Settings page at /dashboard/settings that provides three sections in a single-page scroll layout:

1. Profile — edit display name, account name, industry, account type, and description in a single form
2. Security — change password (shown only for credential-based accounts)
3. Appearance — choose Light, Dark, or Auto theme

The sidebar footer theme switcher is removed in favor of the Appearance section in Settings.

## User Stories

1. As a content creator, I want to edit my profile information after onboarding, so that I can keep my account details up to date.
2. As a user, I want to change my password, so that I can maintain account security.
3. As a user, I want to switch between light and dark themes from within settings, so that I can customize my experience in a single place.
4. As a Google-authenticated user, I want to see that password change is not available for my account type, so that I understand the limitation without confusion.
5. As a user, I want form validation errors shown inline before submission, so that I can correct mistakes immediately.
6. As a user, I want a success toast after saving my profile, so that I have clear feedback that the change was applied.
7. As a user, I want the profile form to re-populate with saved data after a successful save, so that the form reflects the current server state.
8. As a user, I want to be prompted for my current password when setting a new one, so that my account is protected if I leave my session unattended.
9. As a user, I want a clear error message if my current password is incorrect, so that I know why the change was rejected.
10. As a user, I want the theme radio selection to take effect immediately, so that I can preview the appearance before leaving settings.
11. As a user, I want to be rate-limited if I attempt too many password changes, so that my account is protected against brute-force attempts.
12. As a user navigating from the sidebar, I want the Settings link to highlight when I am on the settings page, so that I know where I am.

## Implementation Decisions

### Modules & Components

- Route: /dashboard/settings — inherits the existing dashboard layout (auth guard, sidebar, header).
- Layout: Single-page scroll with a separator between each of the three sections. No tabs or sub-navigation.
- Components (all under components/settings/):
  - profile-section.tsx — single form with fields: name, accountName, industry, accountType (Select: Brand/Influencer), description (Textarea). Uses react-hook-form + zodResolver consistent with existing form patterns.
  - security-section.tsx — shown only when user.provider equals CREDENTIALS. Form with fields: currentPassword, newPassword, confirmNewPassword. Hidden entirely for GOOGLE users.
  - appearance-section.tsx — Radio group with options: Light, Dark, Auto. Uses existing useTheme() from next-themes. No API call required.

### Data Fetching

- Initial data: A GET /api/dashboard/user route returns the authenticated user profile fields (id, name, email, accountName, industry, accountType, description, provider). A useQuery hook with queryKey currentUser provides data to the profile form as default values.
- Profile mutation: PATCH /api/dashboard/settings/profile accepts name, accountName, industry, accountType, description. On success: queryClient.invalidateQueries with queryKey currentUser plus toast success.
- Password mutation: PATCH /api/dashboard/settings/password accepts currentPassword, newPassword. Validates current password with argon2, hashes new password, updates in DB. On success: toast plus clear form fields. On 401: show current password is incorrect.

### Sidebar Changes
- Update navItems entry for Settings from /settings to /dashboard/settings.
- Remove the DropdownMenu theme switcher from the footer.
- Keep the user info card in the footer.

### Dashboard Shell
- Update getRouteMeta from checking /settings to checking /dashboard/settings.

### API Contracts

GET /api/dashboard/user
  200 -> { id, name, email, accountName, industry, accountType, description, provider }

PATCH /api/dashboard/settings/profile
  Body: { name, accountName, industry, accountType ("BRAND" or "INFLUENCER"), description }
  200 -> { message: "Profile updated" }
  400 -> { message: "Validation error" }
  401 -> { message: "Unauthorized" }

PATCH /api/dashboard/settings/password
  Body: { currentPassword, newPassword }
  200 -> { message: "Password updated" }
  400 -> { message: "Validation error" }
  401 -> { message: "Current password is incorrect" }
  429 -> { message: "Too many attempts" }

### Schema Changes

None — all fields exist in the current User model. The passwordHash column already exists.

### New Library Files

- lib/schemas/settings.schema.ts — Zod schemas for profile fields and password change.
- lib/hooks/use-user-profile.ts — TanStack Query wrappers for user profile data, profile mutation, and password mutation.

## Testing Decisions

Skipped for this iteration.

## Out of Scope

- Email address change (requires re-verification flow).
- Google account unlinking (requires OAuth account management).
- Account deletion/deactivation.
- Notification preferences.
- API key management or third-party integrations.
- Profile avatar/photo upload.
- Two-factor authentication.

## Further Notes

The sidebar already references /settings in its navItems array. This must be updated to /dashboard/settings to match the new route. The dashboard shell getRouteMeta function also checks for /settings — this must be updated to /dashboard/settings as well, otherwise the header will show the generic Dashboard fallback.
