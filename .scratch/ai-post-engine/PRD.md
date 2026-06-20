Status: completed

# PRD: AI Post Engine


## Problem Statement

Content creators often struggle to adapt a single core message to the unique cultural and technical requirements of different social platforms (LinkedIn and X). Manually rewriting content for professional networking vs. short-form microblogging is time-consuming and often leads to inconsistent messaging or poor platform fit.

## Solution

A profile-aware AI generation engine that takes a central topic and produces high-quality "Platform Variants" (LinkedIn Posts and X Threads) in a single pass. The engine uses the creator's professional profile (industry, tone, description) to ensure the content sounds authentic and follows strict platform-native formatting rules.

## User Stories

1. As a content creator, I want to provide a topic and keywords so that the AI can generate a structured post for me.
2. As a user, I want the AI to know my industry and background, so that the generated content sounds like it came from me.
3. As a LinkedIn user, I want my posts to have a strong hook and clear spacing, so that they perform well on the platform.
4. As an X user, I want my content to be automatically converted into a thread if it's too long for a single post, so that I don't lose detail.
5. As a creator, I want the core message (base idea) to be consistent across both platforms, even if the formatting changes.
6. As a user, I want the AI to handle technical formatting like hashtags and bullets correctly, so that I don't have to fix them manually.

## Implementation Decisions

### Modules & Components
- **StreamObject Integration**: Uses Vercel AI SDK's `streamObject` with Gemini 2.0 to provide a real-time "typing" experience in the dashboard.
- **Dynamic Prompt Builder**: A sophisticated builder that incorporates:
    - User professional profile (Account Name, Industry, Description).
    - Input parameters (Topic, Tone, Style, Target Audience).
    - Platform-specific rulesets (LinkedIn vs. X).
- **JSON Structure**: Generates a unified object containing `topic`, `baseIdea`, `linkedin` content, and an array of `x` posts (threads).

### Platform Specific Rules
- **LinkedIn**: Focuses on "hook-based" copy, 120-200 words, no markdown, plain text only, specific bullet/numbering styles.
- **X**: Prefers threads for "long-form" or "educational" styles, 240-character limit per post, emoji-rich but intentional.

### Mirrored Lifecycle
- The engine supports the "Draft" model where state is both in the JSON content and mirrored in database columns for high-performance querying and calendar visualization.

## Testing Decisions

- **Prompt Regression**: Test the `buildPrompt` function with various user profiles to ensure formatting rules (no markdown, hashtags at end) are consistently followed.
- **Schema Validation**: Ensure the `aiGeneratedPostSchema` correctly catches malformed AI responses before they reach the UI.
- **Streaming Reliability**: Verify that partial objects are correctly mapped to the UI state to prevent "jumpery" previews.

## Out of Scope
- Direct image generation for posts.
- Support for Facebook, Instagram, or Threads in the current version.
- Multi-language generation beyond English.

## Further Notes
The engine is designed to be "opinionated" about formatting (e.g., banning em dashes and specific markdown) to ensure the final output can be pasted directly into social platforms with zero modification.
