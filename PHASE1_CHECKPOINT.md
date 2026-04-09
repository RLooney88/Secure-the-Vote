# PHASE 1 CHECKPOINT - Homepage/Header Shell Transplant

## Status

Phase 1 implementation is complete on `homepage-header-stage1` and has been pushed to `staging`.

Phase 1 is currently **awaiting manual oversight/review by Roddy** before any decision to proceed into phase 2.

## What Phase 1 Now Covers

- STV-New-style shell header remains the active transplant direction.
- Real Secure the Vote navigation has been mapped into that shell.
- Current Secure the Vote social links are preserved in the shell header and footer.
- Existing homepage content, slider/scroller content, homepage sections, and footer background image remain preserved.
- Header dropdown behavior now matches the transplanted shell markup (`.dropdown` wiring is aligned with the existing injection script).
- Source and artifact templates are aligned across:
  - `src/templates/header.html`
  - `src/templates/footer.html`
  - `public/templates/header.html`
  - `public/templates/footer.html`
  - `dist/templates/header.html`
  - `dist/templates/footer.html`
- Dist shell CSS was updated to support the preserved social set and the corrected dropdown structure.
- The completed phase-1 work was pushed to the remote `staging` branch.
- Manual visual review is still pending because Roddy was away from the computer at the time of completion.

## Review Gate

Before phase 2 begins, Roddy should manually review the staging result for visual/layout issues, spacing, responsive behavior, and general fit against the intended homepage/header transplant.

## Intentionally Deferred to Later Phases

- Making the homepage hero/admin slider backend-editable.
- Broader cleanup of WordPress-export residue in the homepage HTML.
- Any full source-of-truth rebuild beyond the current shell transplant.
- Any sitewide redesign outside the homepage/header/footer shell scope.

## Validation Standard for Phase 1

Phase 1 should be considered complete if the homepage can keep its existing body content while loading:

1. the transplanted shell header,
2. the preserved footer image/footer shell,
3. the mapped real navigation links,
4. the preserved social links,
5. working mobile menu + dropdown behavior for the transplanted shell.
