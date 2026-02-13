# Deployment Guide - Secure The Vote MD

## 🚀 Quick Deploy

### Option 1: Netlify (Recommended)

1. **Push to GitHub**
   ```bash
   cd repos/Secure-the-Vote
   git init
   git add .
   git commit -m "Initial Eleventy migration"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and choose your repo
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `public`
   - Click "Deploy site"

3. **Custom Domain** (Optional)
   - In Netlify dashboard: Domain settings
   - Add custom domain: `securethevotemd.com`
   - Follow DNS configuration instructions

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd repos/Secure-the-Vote
   vercel
   ```
   
3. **Follow prompts**:
   - Link to existing project or create new
   - Build command: `npm run build`
   - Output directory: `public`

### Option 3: GitHub Pages

1. **Add deploy script to `package.json`**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d public"
   }
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from branch `gh-pages`

## 📦 Manual Deploy (Traditional Hosting)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload `public/` contents**
   - Use FTP/SFTP to upload everything in `public/` to web root
   - Or use hosting control panel file manager

3. **Verify**
   - Visit your domain
   - Test all pages
   - Submit test form

## 🔧 Pre-Deployment Checklist

### 1. Update Site Configuration

Edit `src/_data/site.json`:
```json
{
  "name": "Secure The Vote MD",
  "description": "Strengthening our Constitutional Republic through secure voting",
  "url": "https://securethevotemd.com",  // ← Update this
  "year": 2026,
  "author": "Secure The Vote MD",
  "email": "info@securethevotemd.com"    // ← Verify this
}
```

### 2. Download Images (Optional but Recommended)

**Why**: Currently images load from WordPress CDN. For full independence:

```bash
# Create download script
cat > scripts/download-images.sh << 'EOF'
#!/bin/bash
mkdir -p src/images
cd src/images

# Download images from WordPress
wget https://securethevotemd.com/wp-content/uploads/2026/02/Democracy-7.png
wget https://securethevotemd.com/wp-content/uploads/2025/03/2025-Feb-25-Secure-the-Vorte-66-1024x683.jpg
# Add more wget commands for each image...

cd ../..
EOF

chmod +x scripts/download-images.sh
./scripts/download-images.sh
```

Then update image paths in pages from:
```html
<img src="https://securethevotemd.com/wp-content/uploads/..." />
```
to:
```html
<img src="/images/Democracy-7.png" />
```

### 3. Test Forms

After deployment, test each form:
- [ ] Lobby Day Registration (`/pages/register-for-lobby-day-jan-27/`)
- [ ] Election Judge Request (`/pages/be-an-election-judge/`)
- [ ] Petition Request (`/pages/citizen-action/`)
- [ ] Contact Form (`/pages/contact-us/`)

Verify:
- Form loads correctly
- Form submits successfully
- Confirmation/thank you message appears
- Data arrives in HighLevel

### 4. SEO Setup

**Add `robots.txt`** to `src/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://securethevotemd.com/sitemap.xml
```

**Add `sitemap.xml`** (or use Eleventy plugin):
```bash
npm install --save-dev @quasibit/eleventy-plugin-sitemap
```

Then in `.eleventy.js`:
```javascript
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://securethevotemd.com",
    },
  });
  // ... rest of config
};
```

### 5. Analytics (Optional)

Add Google Analytics or Plausible to `src/_includes/base.njk`:

```html
<!-- Before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔐 SSL/HTTPS

- **Netlify/Vercel**: SSL included automatically
- **Traditional hosting**: Enable Let's Encrypt in control panel
- **Cloudflare**: Add site to Cloudflare for free SSL

## 🌍 DNS Configuration

### If Using Netlify/Vercel

1. **Add DNS records at domain registrar**:
   ```
   Type: A
   Name: @
   Value: <Netlify/Vercel IP>

   Type: CNAME
   Name: www
   Value: <your-site>.netlify.app (or vercel.app)
   ```

2. **Wait for DNS propagation** (up to 48 hours, usually minutes)

3. **Verify** with [whatsmydns.net](https://www.whatsmydns.net)

## 📊 Post-Deployment Testing

### 1. Functional Testing
- [ ] All pages load correctly
- [ ] Navigation works on all pages
- [ ] Forms display and submit
- [ ] Mobile menu toggles
- [ ] Home page carousel works
- [ ] All links work (no 404s)

### 2. Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### 3. Performance Testing

Run [Google PageSpeed Insights](https://pagespeed.web.dev/):
- Target: 90+ for both mobile and desktop
- Check:
  - [ ] First Contentful Paint < 1.8s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Total Blocking Time < 200ms
  - [ ] Cumulative Layout Shift < 0.1

**Optimization tips**:
- Compress images with [ImageOptim](https://imageoptim.com/)
- Enable compression on hosting
- Add caching headers
- Consider lazy-loading images below the fold

### 4. Accessibility Testing

Run [WAVE](https://wave.webaim.org/):
- [ ] No errors
- [ ] Proper heading hierarchy
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Color contrast meets WCAG AA

### 5. SEO Verification
- [ ] Meta titles on all pages
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags working
- [ ] Sitemap accessible
- [ ] robots.txt accessible

## 🔄 CI/CD Setup (Advanced)

For automatic deploys on git push:

**GitHub Actions + Netlify**:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=public
```

## 🆘 Troubleshooting

### Forms Not Loading
- Check HighLevel script is loading: `view-source:` and look for `form_embed.js`
- Verify iframe URLs are correct in page HTML
- Check browser console for errors

### Carousel Not Working
- Check `slider.js` is loading
- Verify `.elementor-slides-wrapper` exists in HTML
- Check browser console for JavaScript errors

### Images Not Loading
- If self-hosting: Verify images copied to `public/images/`
- If using WordPress CDN: Check URLs are correct
- Check image paths don't have double slashes (`//images`)

### Build Fails
- Delete `node_modules` and `public`
- Run `npm install` again
- Check Node.js version: `node --version` (need v18+)

### 404 Errors
- Check `.eleventy.js` output directory is `public`
- Verify hosting is serving from correct directory
- Check file paths are relative (not absolute)

## 📞 Support

For deployment issues:
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Eleventy**: [11ty.dev](https://11ty.dev)

---

**Ready to deploy!** Choose your hosting, follow the steps above, and your site will be live.

**Estimated deployment time**: 
- Netlify/Vercel: 5-10 minutes
- GitHub Pages: 10-15 minutes  
- Manual upload: 15-30 minutes
