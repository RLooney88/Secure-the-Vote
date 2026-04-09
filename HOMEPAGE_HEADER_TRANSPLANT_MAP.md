# Secure the Vote GÇö Homepage & Header Transplant Map

Date: 2026-04-08

This document maps the current Secure the Vote homepage/header elements to the newer `STV-New` structure so implementation can proceed cleanly.

---

## 1. Global Header

### Current Secure the Vote Source
Current behavior is fragmented across the existing site stack and is difficult to update consistently.

### `STV-New` Role
Use `STV-New` header structure as the new global header base.

### Keep from current site
- current menu/nav links
- current social icons
- current social URLs
- current important action buttons (if present)

### Replace with `STV-New`
- header markup/layout
- responsive/mobile nav behavior
- sticky behavior / scroll behavior if it behaves correctly

### Needs mapping
- every existing menu item to the new header link model
- every social link/icon to the new header presentation
- any donate/action CTA placement

### Open question
- whether header goes site-wide immediately in first cutover or after homepage approval

### Recommendation
Use the `STV-New` header site-wide if staging validation passes, because a major pain point is editing header behavior in multiple places.

---

## 2. Homepage Hero / Slider

### Current Secure the Vote Source
Current homepage contains slider images and CTA behavior in the preserved site stack.

### Current known issue
Homepage slider likely suffers from duplicate Swiper initialization:
- inline slider init in homepage artifact
- additional init path in site JS

### `STV-New` Role
Use `STV-New` hero/slider structure and behavior as the new base.

### Keep from current site
- current main homepage image (for immediate cutover)
- current slider images long-term if still desired
- future backend-managed slide content

### Replace with `STV-New`
- hero/slider formatting
- cleaner slider component structure
- responsive hero presentation

### Needs mapping
For eventual backend editability, slides should support:
- image
- headline
- CTA text
- CTA URL

### Open question
- whether first cutover should launch with one slide only or restore multiple slides immediately

### Recommendation
Phase 1 can launch with a single current main image if necessary, but the component must be built with backend-driven slide support in mind.

---

## 3. Announcement / Scrolling Bar

### Current Secure the Vote Source
Roddy indicated this is backend-admin related and should not be casually replaced if it is still meant to be editable.

### `STV-New` Role
Potentially use only the cleaner display/styling approach, if useful.

### Keep from current site
- backend editability
- actual scrolling-bar content source
- admin control path

### Replace with `STV-New`
- only visual treatment if desired

### Needs mapping
- identify current backend source for the scrolling bar
- identify whether `STV-New` has an equivalent placeholder or if this stays as a direct integration

### Recommendation
Preserve backend-driven behavior first; do not hardcode a replacement just because the visual shell is changing.

---

## 4. Homepage Sections

### Current Secure the Vote requirement
Roddy wants to keep **all current homepage sections**.

### `STV-New` Role
Use as a section layout and formatting donor.

### Keep from current site
- all current homepage sections
- current section content
- current section links/CTAs

### Replace with `STV-New`
- layout structure
- spacing system
- responsive section formatting
- cleaner component composition where available

### Needed work
Each homepage section must be reviewed and labeled as:
- **Preserve content, new layout**
- **Preserve content and layout mostly as-is**
- **Preserve content but adapt to STV-New structure**

### Recommendation
Do not remove or collapse sections during first cutover unless explicitly approved.

---

## 5. Blog / News Feed Section

### Current Secure the Vote Source
Should pull from the actual Secure the Vote blog/post system.

### `STV-New` Role
Use for formatting/cards/layout only if it has a cleaner presentation.

### Keep from current site
- actual blog/news source
- actual post links
- real published content

### Replace with `STV-New`
- section layout
- card styling
- responsive display

### Needs mapping
- identify current blog feed source used on homepage
- determine how the new homepage should query/render that same data

### Recommendation
Presentation can change; content source must remain real.

---

## 6. Footer

### Current Secure the Vote requirement
- footer is largely acceptable already
- background image must be preserved from current site

### `STV-New` Role
Potentially use only minor structural/styling improvements if clearly better.

### Keep from current site
- footer background image
- likely footer content/links/socials unless intentionally changed later

### Replace with `STV-New`
- only if there is an obvious improvement that does not create risk

### Recommendation
Footer is a lower-priority transplant area. Treat it as a light alignment task, not a major rewrite.

---

## 7. Social Icons / Social Links

### Current Secure the Vote requirement
Keep current social icons and current links.

### `STV-New` Role
Use new header structure but preserve actual Secure the Vote social destinations.

### Keep from current site
- icon set (or visually matching icon set)
- link targets

### Replace with `STV-New`
- header positioning/layout around the icons

### Recommendation
Must be explicitly mapped before cutover. Do not ship placeholder social links.

---

## 8. Navigation Links

### Current Secure the Vote requirement
Header structure from `STV-New` is acceptable, but links must map to real site destinations.

### Keep from current site
- actual navigation information architecture
- actual destinations

### Replace with `STV-New`
- visual nav layout
- dropdown/mobile menu behavior

### Needs mapping
- current main nav
- footer nav if relevant
- any secondary action buttons

### Recommendation
Preserve nav structure initially unless there is an explicit reason to clean it up in the same project.

---

## 9. Backend-Editable Elements

### Likely candidates to preserve
- announcement/scroller bar
- hero/slider data
- possibly homepage CTA text/links depending on current workflow
- any featured content widgets

### Recommendation
For each element, decide one of three modes:
- backend-editable and bridged into new frontend
- code-configured initially
- deferred for later enhancement

### Important principle
Do not accidentally destroy admin editability just because the layout is being modernized.

---

## 10. What `STV-New` Is Being Used For

Use `STV-New` as:
- presentation shell
- component/layout donor
- cleaner header/homepage baseline

Do **not** treat it as:
- an unquestioned drop-in replacement for Secure the Vote data/model behavior

---

## Implementation Priorities

### Priority 1
- new global header using `STV-New` structure + current real links/socials

### Priority 2
- homepage hero / slider structure using `STV-New` presentation + current image(s)

### Priority 3
- preserve all current homepage sections but restyle/restructure through the cleaner shell

### Priority 4
- bridge backend-editable homepage pieces where necessary

### Priority 5
- footer background/image alignment

---

## Suggested Build Order
1. Header transplant with real links/socials
2. Homepage hero transplant with current image(s)
3. Homepage section-by-section port while preserving current content
4. Backend data bridge for editable elements
5. Footer image/alignment
6. Staging validation
7. Production promotion

---

## Required Validation Before Cutover
- desktop header navigation works
- mobile header navigation works
- social links are correct
- homepage hero renders correctly
- slider logic does not double-initialize
- all homepage sections are still present
- CTA links are correct
- blog/news feed shows real content
- announcement/scroller bar still works if required
- footer background image is correct

---

## Summary
This is a **component transplant project**, not a full redesign and not a blind app migration.

`STV-New` should provide the cleaner structure.
Current Secure the Vote should remain the source of truth for:
- links
- content
- sections
- key assets
- selected backend editability
