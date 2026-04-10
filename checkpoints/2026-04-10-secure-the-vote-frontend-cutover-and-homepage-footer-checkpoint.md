# Secure the Vote Checkpoint

**Date:** 2026-04-10  
**Branch:** `staging`  
**Focus:** frontend cutover test, recovered shell, homepage/footer debugging

## Executive Summary

Today’s work was about proving a safe path out of the old hybrid/template-injection system and into a **frontend-owned site shell**.

That part succeeded enough to clarify the architecture, but the homepage/footer work also exposed a major implementation problem:

> We are still dealing with **multiple render paths at once**, and that is exactly what kept causing confusing results and wasted time.

The project direction remains the same and should be treated as non-negotiable:

- shared site chrome should live in the **frontend**
- page templates should be **frontend-owned**
- the database should be used only for the things that actually belong there, mainly:
  - images / media references
  - posts / blog data
  - other dynamic content if truly necessary
- the database should **not** remain the source of truth for shared header/footer/page-shell presentation

## Intended Architecture

The target architecture is:

### Frontend owns:
- header
- footer
- homepage shell
- interior-page shell
- shared layout and navigation
- route structure for public pages
- template code and styling

### Backend / database owns:
- blog/news post data
- image/media records or media metadata as needed
- API-driven content where appropriate
- admin/editor workflows where needed

### Backend / database should NOT own long-term:
- sitewide header markup
- sitewide footer markup
- sitewide shared CSS shell
- public-page chrome injected at runtime

In plain English:

> The site should render from frontend code. The database should provide content, not the page shell.

## What We Confirmed Today

### 1. A separate Vercel project was necessary

Testing this cutover inside the existing shared Vercel project was too risky, so an isolated project was created:

- **Project:** `Secure-the-Vote-Test`
- **Project ID:** `prj_fkyxw6BFFo6GAjb1Xom3Ss2xJXQ3`

That was the correct call.

## 2. The legacy deploy path was the real blocker

The repo had still been deploying from the old path:

- `buildCommand`: no-op
- `outputDirectory`: `dist`

But the real frontend-owned Eleventy output is:

- `public`

This was changed on `staging` so the test project would build the actual frontend.

**Relevant commit:**
- `78728b1` — `build: switch staging test deploy to eleventy public output`

## 3. The previously approved shell was not where we first expected

The frontend-owned includes/CSS in the repo were not the same as the shell Roddy had been visually working from before.

The closest recovered shared shell was found in generated/shared artifacts:

- `dist/templates/header.html`
- `dist/templates/footer.html`
- `dist/templates/template.css`

That shell was transplanted into the frontend-owned path.

**Relevant commit:**
- `896f16f` — `feat: restore saved shared shell templates for frontend deploy`

## 4. The test project was wired to backend data correctly

The new Vercel project was configured with the env vars needed for backend/API flows.

Configured env vars included:
- `DATABASE_URL`
- `JWT_SECRET`
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `SITE_BUILDER_DATABASE_URL`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `FROM_EMAIL`

**Relevant commit to trigger redeploy after env setup:**
- `9090b8c` — `chore: trigger redeploy after Vercel env configuration`

## 5. Header improvements largely succeeded

The following header improvements were made and are materially closer to the intended design:
- recovered shell structure in the frontend path
- corrected Truth Social / Bluesky / flag assets
- icon sizing adjustments
- top bar compressed
- email and icon treatment tightened

Relevant commits included:
- `8716e09` — `fix: use stored social icon assets and footer flag image`
- `08237af` — `fix: balance header social icon sizing`
- `77e0bb6` — `fix: reduce header height and tighten topbar`

## What Went Wrong Today

This section matters. These failures should be carried forward honestly.

### 1. Homepage and interior-page render paths were repeatedly conflated

At different points, work drifted between:
- `citizen-action`
- homepage
- frontend-owned shell files
- old runtime-injected shell behavior

That caused real confusion and slowed progress.

### 2. Footer work was repeatedly attempted without validating the active render source first

This was the biggest failure of the day.

Multiple footer spacing/style changes were made under the assumption that the visible homepage footer was being fully controlled by the same frontend CSS path being edited.

That assumption was wrong for the homepage.

### 3. Homepage is still partially on the old template-injection path

This is the most important technical finding from the second half of the day.

The generated/published homepage still includes runtime template injection behavior, including:
- `#site-header`
- `#site-footer`
- `attachShadow(...)`
- fetch to:
  - `https://site-builder-ai-production.up.railway.app/sites/securethevotemd/templates`

So for the homepage specifically, the visible footer/header were still being affected by the old injected template system.

That is why repeated footer CSS edits seemed inconsistent or ineffective.

### 4. Too much time was lost fixing around symptoms instead of removing the old path

The correct move is not:
- keep tuning footer spacing while old template injection is still in charge

The correct move is:
- remove the old homepage template-injection dependency
- make homepage render directly from frontend-owned header/footer/layout code

## Current State of the Site

### Interior pages
`citizen-action` and other Eleventy-based pages do have a frontend-owned path available, but the site is still in a mixed transitional state.

### Homepage
The homepage remains the biggest architectural problem.

Even in the frontend cutover test, homepage output still shows legacy template-injection behavior, which means:
- the homepage is **not yet fully frontend-owned**
- homepage footer debugging was partially happening against the wrong source of truth

## Important Files / Locations

### Frontend implementation path
- `src/_includes/header.njk`
- `src/_includes/footer.njk`
- `src/css/header.css`
- `src/pages/citizen-action.njk`
- `src/_includes/interior-page.njk`
- `public/index.html`
- `public/citizen-action/index.html`

### Recovered shell donor artifacts
- `dist/templates/header.html`
- `dist/templates/footer.html`
- `dist/templates/template.css`

### Old homepage/template-injection evidence
- `src/index.html`
- published/generated homepage output containing runtime fetch to Railway templates

## Next Steps

These should be the next steps in order.

### 1. Stop debugging homepage footer spacing inside the old injected shell
Do **not** keep spending time making cosmetic footer tweaks while homepage still renders through runtime template injection.

### 2. Remove homepage dependence on runtime header/footer template injection
This is the real next milestone.

That means:
- homepage should stop using fetched/injected shell templates
- homepage should render directly from frontend-owned header/footer/layout code in the repo
- homepage should use the same intended frontend shell direction as the rest of the migration

### 3. Make the homepage footer/header source of truth the frontend files
Once the homepage is truly frontend-owned, then footer/header spacing fixes become normal and reliable again.

### 4. Keep backend usage limited to actual content concerns
Continue toward the intended state where backend/database usage is limited to:
- posts/blog/news data
- images/media references
- content APIs where needed

and **not** sitewide visual shell ownership.

### 5. After homepage is truly frontend-owned, finish visual cleanup there
Once the old template injection is removed from homepage, then:
- footer spacing can be fixed surgically and reliably
- homepage shell parity can be completed
- the shared frontend template can become the proper base for wider rollout

## Explicit Resume Warning

If resuming this work later, do **not** start by tweaking homepage footer spacing again.

Start by answering this question first:

> Is the homepage currently rendering from frontend-owned template files, or is it still using runtime template injection from the old system?

If runtime template injection is still present, that is the blocker.

## Bottom-Line Checkpoint

Today successfully established:
- isolated test project
- frontend build deploy path
- recovered shell assets
- backend/env hookup for the test project
- much better header progress

But today also proved:

> The homepage is still entangled with the old template-injection system, and until that is removed, homepage footer debugging will continue to waste time.

That is the real checkpoint state.
