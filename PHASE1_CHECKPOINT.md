# SECURE THE VOTE PROJECT CHECKPOINT

## Current Status

This is the active project checkpoint for the Secure the Vote homepage/header/footer migration work.

Current working staging foundation is on commit **`ba16aa1`** and later footer/header polish has continued beyond that. The project now has a stable enough homepage/header/footer foundation to preserve, but it is **not yet in final sitewide rollout state**.

## Project Goal

The goal is to move Secure the Vote away from brittle WordPress-derived template fragments and toward a cleaner **front-end-owned** implementation for shared site chrome.

That means:
- new homepage/header/footer structure
- cleaner code borrowed from the donor repo where appropriate
- preserving Secure the Vote’s existing real content, branding, links, and assets
- eventually applying the new shared chrome to all normal public-facing pages
- excluding admin/login surfaces from that shared template rollout

## Key Repos / Roles

### 1. Secure-the-Vote
Primary implementation repo for the site being migrated.

### 2. STV-New
Donor repo for cleaner homepage/footer/header structure and front-end patterns.

This repo was created specifically to provide cleaner building blocks for homepage content and shared site sections.

## Major Direction / Decisions

### Header direction
- The homepage header is being treated as a **front-end implementation target**.
- Visible homepage header fixes were most reliable when applied to the actual rendered homepage source.
- The new header should become part of the reusable site chrome for all non-admin pages.

### Footer direction
- The footer should **not** continue to rely on the old legacy WordPress-derived/footer-template system.
- The correct direction is to **replace** the old footer system with a **front-end-owned footer**.
- The footer should be rebuilt using the cleaner structure from **STV-New**, while preserving Secure the Vote’s actual links, logo, social links, contact information, and overall visual identity.

### Template rollout rule
The new header/footer are intended to become the default shared templates for:
- homepage
- issue/content pages
- resources
- news/blog pages
- campaign/action pages

Do **not** apply them to:
- `/wp-admin/`
- login/admin-auth pages
- internal editor/admin screens

## What Is Working Now

### Homepage / header foundation
- Top utility bar uses brand yellow
- Email + social row is present
- Email hover changed to red
- Homepage nav shell is in place
- Broken chevron boxes were replaced with visible rendered chevrons in the homepage nav
- Scrolling marquee/text bar was moved above the hero image
- The homepage/header shell can now be treated as a stable working base for continued refinement

### Footer foundation
- Footer has been rebuilt as a front-end-owned block in the homepage implementation path
- Footer uses the real flag background asset:
  - `/images/2024/04/usa-flag-background-.jpg`
- Footer overlay color is tuned to:
  - `#9D233B`
- Overlay becomes largely solid by mid-page while still showing the flag toward the left side
- Footer quick-link sections were collapsed into hover flyouts to reduce height
- Footer bottom strip includes copyright + social icons + admin link
- Footer center card has a rise/overlap animation foundation in place

## Important Lessons / Constraints

### 1. Surgical changes only
Roddy explicitly wants changes to be **surgical**.

Rule:
- never change more than the requested scope
- never let a small fix spill into unrelated layout/content

### 2. There are multiple render paths
A major source of implementation confusion has been that different parts of the site have been rendered from different layers at different times.

This caused repeated mismatches between:
- repo template files
- rendered homepage markup
- legacy injected/template paths
- older WordPress-derived fragments

### 3. Front-end source of truth is the goal
For the parts being actively modernized, the right direction is:
- use the front-end implementation as source of truth
- stop patching dead copies or legacy cache/template systems when the goal is replacement

### 4. Footer work was initially approached the wrong way
A key correction in project understanding:
- the footer task is **not** “patch the old footer”
- the footer task is **rebuild the footer using the new repo’s code as the base**

## Current Foundation To Preserve

These pieces are the current foundation worth preserving:
- front-end homepage header shell
- top utility bar + social/email treatment
- rendered homepage nav chevrons
- marquee above hero
- front-end footer rebuilt from a cleaner structure
- flag-based footer background + tuned overlay
- reduced footer quick-link sprawl via hover flyouts

## Remaining Work

The project is not finished.

### Remaining implementation work includes:
- continue refining homepage/header/footer visuals from the current stable foundation
- make footer/header match current Secure the Vote look exactly where still off
- unify the shared header/footer rollout across public-facing pages
- remove or bypass residual dependence on older WordPress-derived shared chrome systems where replacement is intended
- finish converting the working homepage/header/footer into the reusable public-site template layer

## Operator Notes

For future work on this project:
- use the current homepage/header/footer foundation as the basis
- prefer the real active front-end render path when making visible UI changes
- do not create competing checkpoint documents
- update this checkpoint instead of fragmenting project state into multiple docs

## Checkpoint Summary

This project now has a working modernized **homepage/header/footer foundation** and a clarified architectural direction:

> Replace legacy shared chrome with front-end-owned implementations, using STV-New as the clean donor structure and Secure the Vote as the content/branding source of truth.
