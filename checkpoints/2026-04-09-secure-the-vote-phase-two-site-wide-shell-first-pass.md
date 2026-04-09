# Secure the Vote – Phase Two Site-Wide Shell First Pass

Date: 2026-04-09
Branch: staging

## What this pass did

This pass standardized the approved front-end-owned shared header/footer shell so it is the default across the full public Eleventy site, including individual news post pages.

### Changes made
- Added a shared include: `src/_includes/head.njk`
  - Centralizes public-page head/meta/asset loading.
  - Ensures public pages load the same core shared shell CSS stack.
- Updated `src/_includes/base.njk`
  - Now uses the shared head include.
  - Adds shell body classes for consistent page-level targeting.
- Updated `src/_includes/post.njk`
  - Moved news/article pages onto the same shared shell asset path as the rest of the site.
  - Added `header.js` and Swiper asset loading so the approved header/footer behavior works consistently on post pages too.
  - Keeps `posts.css` layered on top for article-specific presentation.
- Updated `src/_includes/header.njk`
  - Added accessible mobile menu attributes.
  - Added `aria-current` on key top-level navigation items.

## Why this matters

Before this pass, most public pages already flowed through `base.njk`, but individual post pages still used a separate older layout path with a different asset/script load. That meant the approved shell was not truly universal yet.

This pass makes the shared shell the real default layout direction for:
- homepage
- standard public pages under `/pages/`
- news archive/category pages under `/news/`
- individual news/article pages under `/news/<slug>/`

## Intentionally not changed in this pass
- No admin/login/editor surfaces were touched.
- No content rewrites.
- No broad permalink restructuring.
- No risky page-specific layout surgery on Elementor-derived content blocks.

## Validation
- `npm run build` completed successfully via Eleventy.

## Remaining phase-two work
- Visual QA page-by-page on staging.
- Tighten active nav behavior for all dropdown branches if desired.
- Resolve any page-specific spacing/CSS conflicts revealed by staging review.
- Decide whether to further consolidate homepage-only assets/scripts after visual QA.

## Current file set touched
- `src/_includes/head.njk` (new)
- `src/_includes/base.njk`
- `src/_includes/post.njk`
- `src/_includes/header.njk`
