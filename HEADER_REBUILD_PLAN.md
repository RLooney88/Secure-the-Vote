# Secure the Vote Header/Footer Rebuild Plan

## Goal
Move the site shell (header, footer, shared menu/social structure) toward code-owned assets in the repo instead of relying on opaque DB/cache state.

## Current Stable Rollback
Current recoverable live shell snapshot is stored in:
- `C:\Users\Roddy\.openclaw\workspace-nova\backups\secure-the-vote\rollback-current-restored-state\`

Current recovery source commit chain:
- `c45600b` — explicit cache layout reference page
- `313c428` — restore reference pages from known-good commit 8330857
- `8330857` — known-good pre-Rumble-edit repo state

## Best Code-Owned Sources Identified
These are the strongest repo-owned shell assets currently available:
- `dist/templates/header.html`
- `dist/templates/footer.html`
- `dist/templates/template.css`

Also relevant but currently inconsistent / older:
- `src/_includes/header.njk`
- `src/_includes/footer.njk`
- `cache-layout-reference.html`

## Recommended Source of Truth
Promote these as canonical shell assets:
- `src/templates/header.html`
- `src/templates/footer.html`
- `src/templates/template.css`
- `src/templates/menu-config.json`
- `src/templates/social-config.json`

Then generate/derive any runtime or cache reference page from those, not the other way around.

## Menu Map Source
See:
- `C:\Users\Roddy\.openclaw\workspace-nova\secure-the-vote-header-menu-map.md`

## Rebuild Strategy

### Phase 1 — Stabilize shell in code
1. Copy/normalize `dist/templates/header.html` into a canonical source template under `src/templates/`.
2. Copy/normalize `dist/templates/footer.html` into `src/templates/`.
3. Copy/normalize `dist/templates/template.css` into `src/templates/`.
4. Remove accidental drift between `src/_includes/*` and `dist/templates/*`.
5. Define menu and social data in config files rather than hardcoding scattered links.

### Phase 2 — Generate a controlled cache reference
1. Build a deterministic `cache-layout-reference.html` from the code-owned header/footer + CSS contract.
2. Keep this file checked into the repo for rollback and cache rebuilds.
3. Ensure the cache builder uses this file explicitly rather than inferring from homepage chaos.

### Phase 3 — Remove Rumble surgically
1. Remove the single Rumble item from the social config / header/footer templates.
2. Rebuild the cache from the explicit reference page.
3. Verify:
   - header visible
   - footer visible
   - menu links correct
   - social order correct
   - no layout regressions

### Phase 4 — Retire DB-owned shell logic
Longer-term:
- keep DB for page/content operations
- stop using DB/cache state as the primary source of truth for site shell markup
- use repo-owned templates as the canonical shell source

## Config Shape Proposal

### `menu-config.json`
```json
{
  "items": [
    {"label":"Home","href":"/"},
    {
      "label":"Accountability",
      "children": [
        {"label":"Trump EO","href":"/trump-executive-order/"},
        {"label":"List Maintenance","href":"/list-maintenance/"},
        {"label":"Board Compliance","href":"/board-compliance/"}
      ]
    }
  ],
  "donate": {
    "label": "DONATE NOW",
    "href": "https://donorbox.org/united-sovereign-americans-maryland-donation"
  }
}
```

### `social-config.json`
```json
{
  "email": "info@securethevotemd.com",
  "links": [
    {"label":"Twitter/X","href":"https://twitter.com/securethevotemd","icon":"x-twitter"},
    {"label":"Instagram","href":"https://www.instagram.com/securethevotemd/","icon":"instagram"},
    {"label":"Facebook","href":"https://www.facebook.com/profile.php?id=61558958704794","icon":"facebook-f"},
    {"label":"TikTok","href":"https://www.tiktok.com/@securethevotemd?lang=en","icon":"tiktok"},
    {"label":"Rumble","href":"https://rumble.com/account/","icon":"r-project"},
    {"label":"Truth Social","href":"https://truthsocial.com/@securethevotemd","icon":"tumblr"},
    {"label":"GETTR","href":"https://gettr.com/user/securethevotemd","icon":"gripfire"},
    {"label":"Telegram","href":"https://web.telegram.org/a/#6827045334","icon":"telegram"},
    {"label":"YouTube","href":"https://www.youtube.com/@SecuretheVoteMD","icon":"youtube"}
  ]
}
```

## Rollback Procedure
If a rebuild fails:
1. Restore:
   - `backups/secure-the-vote/rollback-current-restored-state/templates-header.html`
   - `.../templates-footer.html`
   - `.../templates-css.css`
2. Restore `cache-layout-reference.html` from commit `c45600b` if needed.
3. Re-run the live cache rebuild against the explicit reference page.

## Immediate Recommendation
Do **not** attempt more ad hoc DB cache edits. Use the repo-owned template assets and explicit reference page as the controlled path forward.
