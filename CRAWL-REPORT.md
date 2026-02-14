# SecureTheVoteMD Page Crawl Report
**Date:** 2026-02-13  
**Task:** Crawl 11 missing pages from WordPress site

## Summary
- **10 of 11 pages successfully crawled and saved**
- All pages saved with full WordPress/Elementor structure
- URLs converted from absolute to relative paths
- Saved to `dist/<page-name>/index.html`

## Successfully Crawled Pages ✓

1. **board-compliance** (119.8 KB)
2. **check-voter-registration** (118.6 KB)  
3. **in-the-news** (169.4 KB)
4. **lawsuit-document** (142.1 KB)
5. **maryland-nvra-violations** (138.2 KB)
6. **press-release** (342.3 KB)
7. **signature-verification** (124.3 KB)
8. **sign-the-petition** (128.4 KB)
9. **voter-id** (132.2 KB)
10. **voter-registration-inflation** (128.9 KB)

## Failed to Crawl ✗

1. **be-an-election-judge** - Site returns 403 Forbidden for automated requests to this specific page

### Recommendation
The missing page can be manually saved from a browser or requires alternative crawling method.

## Missing Blog Posts

Based on the homepage, there are numerous blog posts not yet captured. Examples found:

### Recent Posts (2026)
- `/2026/02/09/big-win-for-maryland-election-integrity-...`
- `/2026/02/07/secure-the-vote-maryland-hosts-successful-lobby-day-...`  
- `/2026/02/03/secure-the-vote-maryland-testifies-against-redistricting-...`

### Existing Posts in dist/
- `/2024/04/19/election-accuracy-citizen-action-guide/`
- `/2025/03/31/response-to-the-maryland-state-board-of-elections.../`

The site uses a date-based permalink structure (`/YYYY/MM/DD/post-name/`). To get a complete list, check:
- The press-release page (342 KB - likely contains post listings)
- The in-the-news page (169 KB - may contain post listings)
- Or crawl the sitemap at `https://securethevotemd.com/sitemap.xml`

## URL Conversion Applied

All saved pages have:
- `https://securethevotemd.com/` → `/`
- `http://securethevotemd.com/` → `/`

This ensures the static site works with relative paths.
