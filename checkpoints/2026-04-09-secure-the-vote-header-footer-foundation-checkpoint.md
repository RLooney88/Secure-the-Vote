# Secure the Vote Checkpoint

**Date:** 2026-04-09  
**Branch:** staging  
**Focus:** Homepage header/footer foundation

## Summary

This checkpoint captures the current foundation of the Secure the Vote homepage shell work, centered on the new header and new front-end footer direction.

The project direction is now clear:
- the **homepage header** is the active front-end implementation reference
- the **footer must be front-end owned** and should replace the legacy WordPress/footer-template path
- the cleaner structural donor is **STV-New**
- these shared pieces are intended to become the reusable templates for all **public-facing non-admin pages**

## What We Confirmed

### Header
- The homepage header is being treated as the correct front-end implementation target.
- The top utility bar has been updated to brand yellow.
- The homepage uses rendered chevrons in the nav instead of broken placeholder boxes.
- The scrolling text/marquee bar was moved above the hero image.
- Header/social/email behavior has been refined on staging.

### Footer
- The old footer path is not the long-term source of truth.
- The correct direction is to **replace** the legacy footer with a front-end footer.
- STV-New contains cleaner donor code for the footer structure.
- The new footer now exists as a front-end-owned block in the homepage implementation path.
- The footer uses the real flag background asset:
  - `/images/2024/04/usa-flag-background-.jpg`
- The footer overlay color is set to:
  - `#9D233B`
- The footer has been moving toward the desired layout:
  - quick links
  - center logo card
  - contact info
  - footer bottom strip with socials
  - admin login access

## Critical Architecture Decision

The big project correction is this:

> We should not keep patching the legacy footer/template/database system when the goal is to replace it with front-end-owned shared chrome.

That means future work should continue from the front-end implementation path, not from legacy WordPress-derived fragments unless explicitly needed for reference.

## Intended Sitewide Outcome

These shared elements should eventually be promoted into the reusable site template layer for:
- homepage
- public content pages
- issue/resource pages
- blog/news pages
- action/campaign pages

They should **not** be applied to:
- `/wp-admin/`
- login/admin/auth pages
- editor/admin-only surfaces

## Current Working Understanding

The header/footer work now has a strong enough foundation to preserve before continuing rollout.

What this checkpoint preserves conceptually:
- front-end-owned homepage header direction
- front-end-owned footer replacement direction
- STV-New as the structural donor for cleaner shared chrome
- Secure the Vote repo/content/branding as the source of truth for links, text, assets, and real business content

## Remaining Work

- Continue refining the homepage header/footer visuals from the current working foundation
- Finalize the footer behavior and visual polish
- Roll the shared header/footer system across all public-facing pages
- Exclude admin surfaces from that rollout
- Remove lingering dependence on the legacy footer/template path once the front-end version is fully adopted

## Notes for Resume

If resuming from this checkpoint:
1. Treat the current homepage header as the live front-end reference.
2. Treat the footer as a front-end rebuild task, not a legacy footer patch task.
3. Use STV-New footer code as the donor structure when continuing footer work.
4. Keep edits surgical.
5. Preserve the current Secure the Vote visual identity while modernizing the implementation.
