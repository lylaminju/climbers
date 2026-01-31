# Route Comparison UI/UX Options Analysis

## Problem Statement

Two key discoverability issues with the route comparison feature:

1. **RoutesDiv visibility**: The route comparison buttons at the top of the page were not being noticed by users
2. **Add destination discoverability**: The MapPinPlus button on gym cards wasn't intuitive enough for users to understand its purpose

## Options Considered

### Option A: Current Layout + Improvements

Keep the RoutesDiv at the top of the page but make the buttons bigger and more prominent.

**Pros:**
- Minimal code changes
- No layout restructuring needed
- Quick to implement

**Cons:**
- Doesn't solve the core discoverability problem
- Users still may not notice the top bar
- No visual feedback when gyms are selected

**Verdict:** Quick fix but doesn't address the fundamental UX issue.

---

### Option B: Separate Compare Page

Create a dedicated `/compare` page where users can select gyms and compare routes.

**Pros:**
- Clean separation of concerns
- Dedicated space for comparison functionality
- Can show more detailed comparison information

**Cons:**
- Adds navigation friction (users must go to a separate page)
- Context switching between browsing gyms and comparing
- Users may not discover the feature exists
- Loses the "quick glance" benefit of comparing while browsing

**Verdict:** Too much friction for a feature that should feel lightweight.

---

### Option C: Mode Toggle (Explore/Compare)

Add a toggle on the home page to switch between "Explore" and "Compare" modes.

**Pros:**
- Clear separation of intent
- Can optimize each mode for its purpose
- Explicit user choice

**Cons:**
- Adds cognitive load (users must understand modes exist)
- Users might not realize they need to switch modes
- Could feel clunky for quick comparisons
- Not a common pattern users would expect

**Verdict:** Overcomplicates a simple interaction.

---

### Option D: Sticky Bottom/Side Panel (Selected)

Implement a responsive panel that's always visible:
- Mobile: Sticky bottom sheet (Google Maps mobile style)
- Desktop: Sticky right side panel (Google Maps desktop style)

**Pros:**
- Familiar pattern (Google Maps, Uber, etc.)
- Always visible, teaching users the feature exists
- Non-intrusive when collapsed
- Clear visual feedback when gyms are added
- Auto-expand on first selection creates "aha" moment
- Works well on both mobile and desktop
- No navigation required

**Cons:**
- Takes up screen real estate
- More complex implementation
- Need to handle responsive breakpoints

**Verdict:** Best balance of discoverability, usability, and familiarity.

---

## Implementation Decision

**Selected: Option D - Sticky Bottom/Side Panel**

### Rationale

1. **Familiar Pattern**: Users recognize this pattern from Google Maps, making it immediately understandable
2. **Always Accessible**: The panel is always visible, even when empty, which teaches users about the feature
3. **Progressive Disclosure**: Collapsed state is minimal; expanded state shows full functionality
4. **Contextual**: Users can compare routes while still browsing gyms
5. **Mobile-First**: The bottom sheet pattern is native to mobile experiences

### Key Behaviors

1. Panel is **always visible** (even when empty) to teach users the feature exists
2. **Auto-expand on first gym add** creates an "aha" moment and confirms the action worked
3. After first use, panel stays in user's preferred collapsed/expanded state
4. Travel mode buttons are **disabled when no gyms selected** to prevent confusion
5. Gym icons are **removable** directly from the panel for easy editing

### Responsive Breakpoints

- **Mobile (< 1024px)**: Bottom sheet with collapse/expand
- **Desktop (>= 1024px)**: Right side panel with collapse/expand

This breakpoint aligns with the `lg:` Tailwind prefix and provides optimal viewing on tablets and desktops.
