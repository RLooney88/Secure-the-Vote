# Secure the Vote G현 Homepage & Global Header Transplant Plan

Date: 2026-04-08

## Objective
Replace the current Secure the Vote homepage and global header implementation with a cleaner, more maintainable structure based on the `STV-New` repo, while preserving the existing Secure the Vote content, links, sections, and selected backend edit paths.

This is **not** a visual redesign from scratch.

This is a **structural/frontend modernization** of the existing homepage and global header using the new code as the base presentation layer.

---

## Project Intent
The current Secure the Vote homepage/header stack is difficult to maintain because it combines:
- WordPress-preserved artifact patterns
- duplicated header logic
- brittle slider behavior
- mixed static + backend-managed content
- multiple places to update global navigation/header elements

The `STV-New` repo provides a cleaner frontend structure that is much closer to how the site should be maintained going forward:
- reusable header component
- cleaner homepage composition
- cleaner hero/slider implementation
- better long-term maintainability

The goal is to transplant the **structure and formatting** of `STV-New` into Secure the Vote while preserving the actual Secure the Vote site data, links, and content behaviors.

---

## Non-Goals
This project is **not** intended to:
- rewrite the whole Secure the Vote site architecture all at once
- force every backend-editable feature into hardcoded frontend content
- preserve every broken WordPress-era implementation detail exactly as-is
- resume the previously shelved shell/Eleventy/header recovery line as if it were production-ready

---

## Agreed Direction from Roddy
### Header
- Use the **new header structure** from `STV-New`
- Preserve the **current Secure the Vote links**
- Preserve the **current social icons + social links**
- Goal: one site-wide header source of truth instead of editing header behavior in multiple places

### Homepage hero / slider
- For the first cutover, use the **main image currently used now**
- The hero/slider should eventually be **editable in the backend admin**, including:
  - image
  - headline
  - call-to-action button text
  - call-to-action destination URL

### Homepage sections
- Keep **all current homepage sections**
- `STV-New` is mainly being used as a presentation/layout donor, not as an excuse to remove homepage content

### Footer
- Footer structure is largely similar already
- Preserve footer layout unless a small cleanup is needed
- Replace the footer **background image** with the one currently used on Secure the Vote

### General approach
- Reuse `STV-New` structure and formatting where it renders correctly
- Map Secure the VoteG핫s real links, content, and backend-fed elements into that structure
- Avoid a blind full-architecture swap

---

## High-Level Strategy
### Core principle
**Transplant the frame, preserve the organs.**

Meaning:
- transplant the cleaner homepage/header **structure** from `STV-New`
- preserve the real Secure the Vote **content, links, and operational behaviors**
- preserve backend editability where it provides real value
- eliminate duplicated/unmaintainable global header logic

---

## Work Phases

### Phase 1 G현 Mapping & Inventory
Before implementation, document the current Secure the Vote homepage and header elements and map them to the `STV-New` equivalents.

Outputs:
- current homepage section list
- current header/nav/social requirements
- list of backend-fed elements
- section-by-section transplant mapping

Deliverable file:
- `HOMEPAGE_HEADER_TRANSPLANT_MAP.md`

---

### Phase 2 G현 Global Header Transplant
Use the `STV-New` header structure as the new base.

Tasks:
- transplant visual/header layout structure
- map existing Secure the Vote nav/menu links
- map current social icons + URLs
- preserve any current action buttons needed in the header
- ensure mobile navigation works correctly
- ensure header can become the eventual site-wide header source of truth

Success criteria:
- one maintainable header implementation
- correct links
- correct social icons/links
- responsive behavior works
- no duplicated header logic in multiple places

---

### Phase 3 G현 Homepage Structural Transplant
Use the `STV-New` homepage layout/formatting as the base shell.

Tasks:
- preserve all existing homepage sections
- move current section content into the cleaner structure
- preserve section order unless explicitly changed later
- preserve critical calls to action and links

Success criteria:
- homepage looks like Secure the Vote, not like a generic template
- sections still exist
- content is preserved
- editing the page is no longer needlessly painful

---

### Phase 4 G현 Hero / Slider Integration
Short-term:
- use the current main image only if needed for the initial cutover

Long-term target:
- homepage hero should be editable through backend/admin
- support:
  - image
  - headline
  - CTA text
  - CTA URL

Technical requirement:
- slider implementation must have **one** initialization path
- avoid current duplicate initialization issue

Known finding from investigation:
- current homepage slider likely breaks because Swiper is initialized twice
  - once inline in the current homepage artifact
  - once again in site JS

Success criteria:
- hero displays correctly
- current image(s) preserved as desired
- slider behavior is stable
- future admin editability is supported

---

### Phase 5 G현 Footer Alignment
Tasks:
- preserve current footer content/structure if still acceptable
- replace footer background image with the current Secure the Vote footer background asset
- ensure visual integration with new homepage/header structure

Success criteria:
- footer looks intentional with the new homepage/header
- current recognizable brand feel preserved
- no unnecessary footer rewrite unless needed

---

### Phase 6 G현 Backend/Data Bridging
Identify which homepage/header elements need to remain backend-driven.

Likely candidates:
- slider content
- announcement / scrolling bar if still used
- possibly homepage CTA content blocks
- current blog/news feed previews

For each element decide whether it should be:
- backend-editable
- code-configured
- hybrid (backend data rendered by cleaner frontend components)

Success criteria:
- no critical admin-managed behavior lost accidentally
- no placeholder data left wired into production pages

---

## Key Architectural Principle
Do **not** use `STV-New` as a blind replacement app.

Use it as:
- a **presentation shell**
- a **header/homepage component donor**
- a **formatting/layout donor**

Secure the Vote still needs to retain its real:
- links
- content
- dynamic data
- backend edit hooks
- site-specific branding assets

---

## Risks
### 1. Hardcoded placeholders surviving cutover
Risk:
- `STV-New` currently includes placeholder/demo-like values in some places

Mitigation:
- every transplanted section must be checked for real Secure the Vote links/content before shipping

### 2. Losing backend editability
Risk:
- homepage may look cleaner but become harder to update where admin editability is still needed

Mitigation:
- explicitly identify backend-fed elements before cutover
- bridge them rather than silently hardcoding everything

### 3. Header rollout affecting whole site
Risk:
- site-wide header replacement can break navigation globally if mapped incorrectly

Mitigation:
- verify exact menu/link mapping before rollout
- test on staging first

### 4. Slider/hero regression
Risk:
- current slider is already fragile
- transplant could improve or worsen it if done sloppily

Mitigation:
- one slider implementation only
- one data source only
- no double init

---

## Suggested Implementation Sequence
1. Produce section-by-section transplant map
2. Build new header on staging
3. Build homepage shell on staging
4. Wire current links and current homepage content/sections into new shell
5. Preserve current social links/icons and footer background image
6. Validate homepage visually and functionally on staging
7. Decide whether to make the new header site-wide immediately or in a second promotion step

---

## Recommended First Deliverables
1. `HOMEPAGE_HEADER_TRANSPLANT_MAP.md`
2. clean staging branch prototype for:
   - new header with real links
   - homepage with preserved sections
3. explicit list of backend-fed homepage elements requiring bridge work

---

## Decision Summary
This project should proceed as a **targeted homepage/header transplant**, not a full-site rewrite and not a blind new-app swap.

The new code is the better structural base.
The current Secure the Vote site remains the source of truth for:
- links
- content
- section presence
- specific assets
- selected backend editability
