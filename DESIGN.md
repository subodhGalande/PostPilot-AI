# Design System & Context: PostPilot AI

## 0. Product Context & Copywriting
**Product Name:** PostPilot AI
**Target Audience:** Creators, founders, and marketers managing multi-platform social media.
**Value Proposition:** Generate one core idea and instantly transform it into distinct, native posts for LinkedIn and X (Threads). PostPilot AI maintains a unified draft with independent lifecycles and scheduling for each platform variant.
**Tone of Voice:** Confident, concise, and professional. Avoid AI clichés ("Unleash", "Elevate", "Next-Gen"). Speak directly to the user's need for speed, audience growth, and organizational clarity.

## 1. Visual Theme & Atmosphere
A fluid, high-agency cockpit interface with confident asymmetric layouts and hardware-accelerated spring-physics motion. The atmosphere is sleek and strictly utilitarian — feeling like a premium developer tool or a declassified modern operating system. Density is balanced (6) with high variance (8) to avoid template clichés.

## 2. Color Palette & Roles
- **Canvas Black** (#09090B) — Primary background surface
- **Pure Surface** (#18181B) — Card and container fill
- **Parchment White** (#FAFAFA) — Primary text and striking headlines
- **Muted Steel** (#71717A) — Secondary text, descriptions, metadata
- **Whisper Border** (rgba(255,255,255,0.1)) — Card borders, 1px structural lines
- **Electric Cobalt** (#0047FF) — Single accent for CTAs, active states, focus rings
(Max 1 accent. Saturation < 80%. No purple/neon glow.)

## 3. Typography Rules
- **Display:** Geist — Track-tight, controlled scale, weight-driven hierarchy.
- **Body:** Geist — Relaxed leading, 65ch max-width, neutral secondary color.
- **Mono:** Geist Mono — For code, metadata, timestamps, high-density numbers.
- **Banned:** Inter, generic system fonts for premium contexts. Serif fonts are strictly banned in this app.

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active state. Electric Cobalt fill for primary, ghost/outline with whisper borders for secondary.
* **Cards:** Generously rounded corners (1rem). Diffused whisper shadow matching the background hue. Used strictly when elevation serves hierarchy. 
* **Inputs:** Label above, error below. Focus ring in Electric Cobalt. No floating labels.
* **Loaders:** Skeletal shimmer matching exact layout dimensions. No circular spinners.
* **Empty States:** Composed, illustrated structural compositions — not just "No data" text.

## 5. Layout Principles
Grid-first responsive architecture using CSS Grid.
Asymmetric splits for Hero sections — centered Heros are strictly banned.
No 3-column equal card layouts (use 2-column Zig-Zag or asymmetric grids).
Strict single-column collapse below 768px. 
Max-width containment at 1400px.
No flexbox percentage math. Generous internal padding and negative space.
No overlapping elements — every element occupies its own clear spatial zone.

## 6. Motion & Interaction
Spring physics for all interactive elements (stiffness: 100, damping: 20).
Staggered cascade reveals for lists.
Perpetual micro-loops on active dashboard components. 
Hardware-accelerated transforms (translate/opacity) only. 

## 7. Anti-Patterns (Banned)
- NEVER DO: Emojis
- NEVER DO: The Inter font
- NEVER DO: Pure black (#000000)
- NEVER DO: Neon glows or oversaturated gradients
- NEVER DO: 3-column equal grids
- NEVER DO: AI copywriting clichés ("Elevate", "Seamless", "Unleash")
- NEVER DO: Generic placeholder names ("John Doe")
- NEVER DO: Broken image links (use picsum.photos)
- NEVER DO: Centered Hero sections
- NEVER DO: Filler UI text ("Scroll to explore", bouncing chevrons)
