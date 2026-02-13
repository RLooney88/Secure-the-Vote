# SEO Quick Reference Card

**Project:** SecureTheVoteMD  
**Status:** Ready to Deploy  
**Date:** February 13, 2026

---

## ⚡ Deploy NOW (5 Minutes)

```bash
cd repos/Secure-the-Vote
npm install
npm run build
vercel --prod  # or your deploy command
```

**Verify:**
- Visit https://securethevotemd.com/sitemap.xml
- Visit https://securethevotemd.com/robots.txt
- View source on homepage (check `<head>`)

---

## 📝 Update a Page (2 Minutes)

1. Open: `src/pages/PAGE-NAME.njk`
2. Replace frontmatter:

```yaml
---
layout: base.njk
title: "Page Title (50-60 chars) - Secure The Vote MD"
description: "Compelling description 150-160 characters with keywords"
keywords: "keyword1, keyword2, keyword3, Maryland, elections"
slug: "page-slug"
order: 1-14
date: YYYY-MM-DDTHH:MM:SS
modified: 2026-02-13T10:20:00
image: "/images/page-og.jpg"
ogType: "article"
section: "Category"
breadcrumbs:
  - name: "Category"
    url: "/pages/category/"
---
```

3. Rebuild: `npm run build`
4. Redeploy: `vercel --prod`

---

## 🔍 Test SEO

### **Basic:**
- View source on any page (Ctrl+U / Cmd+U)
- Check `<title>`, `<meta name="description">`, og tags

### **Advanced:**
- **Structured Data:** https://search.google.com/test/rich-results
- **Social Sharing:**
  - Facebook: https://developers.facebook.com/tools/debug/
  - Twitter: https://cards-dev.twitter.com/validator
- **Mobile:** https://search.google.com/test/mobile-friendly
- **Speed:** https://pagespeed.web.dev/

---

## 📊 Submit to Search Engines (10 Minutes)

### **Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add property: `https://securethevotemd.com`
3. Verify ownership (DNS or HTML tag)
4. Submit sitemap: `https://securethevotemd.com/sitemap.xml`

### **Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Add site: `https://securethevotemd.com`
3. Verify ownership
4. Submit sitemap

---

## 📋 Pages Status

**✅ Optimized (6):**
- Homepage
- Voter ID
- List Maintenance
- Signature Verification
- Trump Executive Order
- Contact Us

**⏳ Needs Update (14):**
- be-an-election-judge
- board-compliance
- check-voter-registration
- citizen-action
- in-the-news
- lawsuit-document
- maryland-nvra-violations
- poll-watchers-toolkit
- press-release
- register-for-lobby-day-jan-27
- resources
- sign-the-petition
- voter-registration-inflation
- whats-happening

**Guide:** `UPDATE-REMAINING-PAGES.md`

---

## 🎨 OG Images Needed (Optional)

**Priority:**
- `/images/og-default.jpg` (1200x630px) - **MOST IMPORTANT**
- `/images/logo.png` (square)

**Page-Specific:**
- voter-id-og.jpg
- list-maintenance-og.jpg
- signature-verification-og.jpg
- trump-eo-og.jpg
- contact-og.jpg
- + 14 more for remaining pages

**Note:** Site works without images, but social shares won't have previews.

---

## 📂 Key Files

**SEO Config:**
- `src/_data/seo.json` - Site-wide settings

**Templates:**
- `src/_includes/seo.njk` - Meta tags
- `src/_includes/structured-data.njk` - Schema.org
- `src/_includes/base.njk` - Main layout

**Technical:**
- `src/robots.txt` - Crawler rules
- `.eleventy.js` - Sitemap plugin
- `package.json` - Dependencies

---

## 📚 Documentation

**Start Here:**
1. `SEO-COMPLETION-REPORT.md` - Overview & quick start
2. `UPDATE-REMAINING-PAGES.md` - How to update pages
3. `SEO-TESTING-CHECKLIST.md` - Validation guide
4. `SEO-IMPLEMENTATION.md` - Full technical docs

---

## 🆘 Common Issues

**Problem:** Sitemap not found  
**Fix:** `npm run build` then redeploy

**Problem:** Meta tags not showing  
**Fix:** Clear cache (Ctrl+Shift+R), view source (not DevTools)

**Problem:** Social sharing no image  
**Fix:** Create `/images/og-default.jpg` (1200x630px), use full URL in og:image

**Problem:** Pages not indexing  
**Fix:** Submit sitemap in Google Search Console, check robots.txt not blocking

---

## 📈 Success Metrics

**Week 1:**
- Pages indexed in Search Console
- Sitemap processed

**Month 1:**
- 50+ pages indexed
- Search impressions showing

**Month 3:**
- 100+ daily impressions
- 10+ daily clicks
- Top 10 for target keywords

---

## 🎯 SEO Best Practices

✅ Update `modified` date when content changes  
✅ Keep titles under 60 characters  
✅ Keep descriptions 150-160 characters  
✅ Use location keywords (Maryland)  
✅ Create unique content regularly  
✅ Build quality backlinks  
✅ Monitor Search Console weekly  

---

## 🔗 Essential Links

- **Search Console:** https://search.google.com/search-console
- **Bing Webmaster:** https://www.bing.com/webmasters
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Facebook Debug:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator
- **PageSpeed:** https://pagespeed.web.dev/
- **Eleventy Docs:** https://www.11ty.dev/docs/

---

**🚀 Your site is SEO-ready. Deploy and watch your traffic grow!**
