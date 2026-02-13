# SEO Testing & Validation Checklist

Use this checklist after deploying the SEO-optimized site to ensure everything is working correctly.

---

## 🔧 Pre-Deployment Tests (Local)

### **1. Install Dependencies**
```bash
cd repos/Secure-the-Vote
npm install
```
- [ ] No errors during installation
- [ ] `@11ty/eleventy-plugin-sitemap` installed successfully

### **2. Build Site**
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] `public/sitemap.xml` is generated
- [ ] `public/robots.txt` exists
- [ ] All pages build successfully

### **3. Local Server Test**
```bash
npm start
```
- [ ] Server starts at http://localhost:8080
- [ ] Homepage loads correctly
- [ ] Navigate to multiple pages without errors

### **4. Manual Source Code Check**
View source (Ctrl+U / Cmd+U) on any page and verify:
- [ ] `<title>` tag is present and properly formatted
- [ ] `<meta name="description">` exists
- [ ] `<link rel="canonical">` is present
- [ ] Open Graph tags (og:title, og:description, og:image) are present
- [ ] Twitter Card tags are present
- [ ] `<script type="application/ld+json">` with Schema.org structured data exists

---

## 🚀 Post-Deployment Tests

### **1. Basic Accessibility**
Visit: `https://securethevotemd.com`

- [ ] Site loads within 3 seconds
- [ ] All pages accessible
- [ ] No 404 errors on navigation

### **2. Robots.txt**
Visit: `https://securethevotemd.com/robots.txt`

**Should see:**
```
User-agent: *
Allow: /
Crawl-delay: 1
Sitemap: https://securethevotemd.com/sitemap.xml
```
- [ ] File is publicly accessible
- [ ] Sitemap URL is correct

### **3. Sitemap.xml**
Visit: `https://securethevotemd.com/sitemap.xml`

- [ ] File is publicly accessible
- [ ] Contains all pages
- [ ] URLs are absolute (start with https://securethevotemd.com)
- [ ] No broken/invalid URLs

### **4. Meta Tags Validation**

Pick 3-5 pages and view source. Verify each has:
- [ ] Unique `<title>` (not duplicated)
- [ ] Unique `<meta name="description">`
- [ ] Canonical URL matches page URL
- [ ] OG image path is correct
- [ ] No missing/broken meta tags

**Test Pages:**
- Homepage: https://securethevotemd.com
- Voter ID: https://securethevotemd.com/pages/voter-id/
- Contact: https://securethevotemd.com/pages/contact-us/

### **5. Structured Data Validation**

**Google Rich Results Test:**
https://search.google.com/test/rich-results

Test these URLs:
- [ ] Homepage
- [ ] Any article/news page

**Should pass with:**
- Organization schema
- WebSite schema
- WebPage schema
- (Optional) Article schema for news pages

**Schema.org Validator:**
https://validator.schema.org/

- [ ] Paste page source
- [ ] No critical errors
- [ ] Organization, WebSite, WebPage detected

### **6. Social Sharing Validation**

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/

Test these URLs:
- [ ] https://securethevotemd.com
- [ ] https://securethevotemd.com/pages/voter-id/
- [ ] https://securethevotemd.com/pages/contact-us/

**Should show:**
- Title
- Description
- Image (once images are uploaded)
- Site name

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

- [ ] Same pages as Facebook
- [ ] Card type: "summary_large_image"
- [ ] Title, description, image visible

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/

- [ ] Same pages tested
- [ ] No errors

### **7. Mobile-Friendly Test**
https://search.google.com/test/mobile-friendly

Test key pages:
- [ ] Homepage
- [ ] Voter ID page
- [ ] Contact page

**Should pass:**
- Mobile-friendly
- No content wider than screen
- Text readable without zooming

### **8. Page Speed Insights**
https://pagespeed.web.dev/

Test:
- [ ] Homepage: Score 90+ (mobile & desktop)
- [ ] Key pages: Score 85+

**If scores are low:**
- Optimize images (compress, WebP format)
- Minimize JavaScript
- Leverage browser caching

---

## 📊 Search Console Setup (Within 24 hours)

### **Google Search Console**
https://search.google.com/search-console

1. **Add Property**
   - [ ] Add https://securethevotemd.com
   - [ ] Verify ownership (DNS, HTML file, or tag)

2. **Submit Sitemap**
   - [ ] Go to Sitemaps section
   - [ ] Submit: https://securethevotemd.com/sitemap.xml
   - [ ] Wait for "Success" status

3. **Check Coverage**
   - [ ] No errors in "Coverage" report
   - [ ] Pages are being indexed

### **Bing Webmaster Tools**
https://www.bing.com/webmasters

1. **Add Site**
   - [ ] Add https://securethevotemd.com
   - [ ] Verify ownership

2. **Submit Sitemap**
   - [ ] Submit sitemap URL
   - [ ] Confirm submission

---

## 🔍 Advanced Validation

### **Canonical URL Check**
For each page, verify in source code:
```html
<link rel="canonical" href="https://securethevotemd.com/pages/voter-id/">
```
- [ ] Canonical matches actual URL
- [ ] No trailing slash inconsistencies
- [ ] HTTPS (not HTTP)

### **Heading Hierarchy**
Check 2-3 content pages:
- [ ] Only one `<h1>` per page
- [ ] Headings in order (h1 → h2 → h3, not h1 → h3)
- [ ] Headings describe content

### **Alt Text for Images**
Review content pages:
- [ ] All images have `alt` attributes
- [ ] Alt text is descriptive (not "image1.jpg")
- [ ] Decorative images have empty alt (`alt=""`)

### **Internal Links**
- [ ] All navigation links work
- [ ] No broken internal links
- [ ] Footer links functional

---

## 📈 Monitoring (First 30 Days)

### **Week 1**
- [ ] Check Google Search Console daily for crawl errors
- [ ] Monitor sitemap submission status
- [ ] Test social shares on real posts

### **Week 2-4**
- [ ] Review indexing status (how many pages indexed)
- [ ] Check "Performance" report for initial impressions/clicks
- [ ] Monitor any manual actions or penalties

### **Month 2+**
- [ ] Analyze which pages rank for target keywords
- [ ] Review user engagement (bounce rate, time on page)
- [ ] Identify pages needing optimization
- [ ] Create fresh content regularly

---

## 🆘 Common Issues & Fixes

### **Sitemap not found**
**Fix:**
```bash
# Rebuild site
npm run build

# Verify file exists
ls public/sitemap.xml

# Deploy updated public folder
vercel --prod
```

### **Meta tags not showing**
**Fix:**
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- View source (not DevTools)
- Check `src/_data/seo.json` exists
- Verify frontmatter syntax

### **Structured data errors**
**Fix:**
- Check JSON-LD syntax (valid JSON)
- Ensure required fields are present (@context, @type, name)
- Test individual pages in Schema.org validator

### **Social sharing not working**
**Fix:**
- Verify OG image path is correct and accessible
- Image must be at least 200x200px (recommended 1200x630px)
- Use full URL (https://securethevotemd.com/images/og-default.jpg)
- Re-scrape URL in Facebook Debugger

### **Pages not indexing**
**Fix:**
- Check robots.txt not blocking pages
- Verify sitemap includes all pages
- Check Google Search Console for crawl errors
- Ensure canonical URLs are correct
- Request indexing manually in Search Console

---

## ✅ Final Verification

Before marking SEO implementation as complete:
- [ ] All tests pass
- [ ] No critical errors in validators
- [ ] Sitemap submitted to Google & Bing
- [ ] Social sharing works (images display)
- [ ] Mobile-friendly confirmed
- [ ] Page speed acceptable (85+)
- [ ] All navigation links work
- [ ] Documentation reviewed
- [ ] Monitoring set up

---

## 📞 Resources

- **Google Search Console:** https://search.google.com/search-console
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Eleventy Docs:** https://www.11ty.dev/docs/

---

**🎉 Once all tests pass, your SEO implementation is production-ready!**
