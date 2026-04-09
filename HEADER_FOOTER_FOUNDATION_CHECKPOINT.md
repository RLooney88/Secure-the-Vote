# Header / Footer Foundation Checkpoint

## Status

This document captures the current working **header + footer foundation** for Secure the Vote as of commit **`c47bca3`** on the staging branch.

This foundation should be treated as the basis for the new reusable site chrome.

## Intent

The new header and footer are meant to become the **default templates applied to every non-admin page** on the site.

**Scope rule:**
- Apply to all public-facing pages
- Do **not** apply to admin pages / login / WordPress admin surfaces

## Current Header Foundation

The homepage header is now being treated as a **front-end implementation target**, not something to keep patching through the older legacy template/cache system.

### Header characteristics currently established

- Top utility bar uses the **brand yellow** background
- Utility bar contains:
  - site email
  - social icon row
- Email hover is **red** (not yellow)
- Main nav shell is in place
- Broken dropdown icon boxes were replaced with visible **down chevrons** in the rendered homepage nav
- Header bar spacing was reduced to make the top yellow strip more compact

### Header implementation notes

- Direct homepage-rendered markup has been the dependable source for visible homepage header fixes
- Legacy/shared template sources are not yet fully unified with the homepage implementation
- Future sitewide rollout should use the current homepage header as the reference implementation

## Current Footer Foundation

The footer direction is now explicitly:
- **front-end owned**
- based on the cleaner structure borrowed from the **STV-New** repo
- not the older WordPress-derived footer system

### Footer characteristics currently established

- Footer rebuilt into a cleaner front-end block
- Footer background uses the real flag asset:
  - `/images/2024/04/usa-flag-background-.jpg`
- Footer overlay color is tuned to:
  - **`#9D233B`**
- Overlay becomes largely solid by mid-page while still showing the flag toward the left side
- Quick links are structured in the rebuilt footer
- Footer social icons are restored using inline SVG rendering
- Footer bottom strip includes:
  - copyright text
  - social icons
  - **Admin Login** link on the right side
- Footer quick-link submenus were collapsed into hover flyouts to reduce footer height
- Center footer logo card now has a rise-up entrance effect and slight overlap behavior

## Template Rule Going Forward

These header/footer pieces should be promoted into the **sitewide reusable template layer** for all normal public pages.

### Desired application target

Apply the new header/footer to:
- homepage
- content pages
- issue pages
- resource pages
- blog/news pages
- campaign / action pages

Do **not** apply to:
- `/wp-admin/`
- wp-login / admin-auth flows
- internal admin/editor surfaces

## Important Architecture Note

A major source of confusion during implementation was that the live site had multiple competing render paths:
- legacy injected/template-based paths
- homepage-specific rendered markup
- old WordPress-derived footer/header fragments

The correct long-term direction is:
- stop relying on the legacy footer system
- stop patching dead copies when a front-end replacement is intended
- make the new front-end header/footer the actual source of truth

## Known Remaining Work

This checkpoint does **not** mean the sitewide rollout is finished.
It means the visual/structural foundation is now strong enough to preserve and reuse.

Remaining work includes:
- applying the new header/footer foundation consistently across all non-admin pages
- unifying shared navigation behavior across page types
- removing residual dependence on older template/cache systems where no longer needed
- polishing any remaining page-to-page inconsistencies once the shared template layer is wired up

## Operational Rule

For future edits to this header/footer foundation:
- make changes **surgically**
- prefer the active rendered/front-end source of truth
- avoid editing legacy/dead copies unless there is a clear reason

## Checkpoint Summary

**Checkpoint commit:** `c47bca3`

This is the current foundation to preserve before broader sitewide template rollout.
