# SecureTheVote CMS - Deployment Checklist

## 🚀 Quick Deployment Steps

### 1. Run Database Migration
The migration script creates all necessary tables.

**Option A: Local test (if you have DB access)**
```bash
cd repos/Secure-the-Vote
export DATABASE_URL="your-railway-postgres-url"
node scripts/migrate.js
```

**Option B: On Vercel (recommended)**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run migration
vercel env pull .env.local
node scripts/migrate.js
```

**Option C: Via Railway CLI or direct Postgres connection**
```bash
# Connect to your Railway Postgres database
# Run the SQL manually from scripts/migrate.js
```

Expected output:
```
🔄 Starting database migrations...
Creating posts table...
Creating banner_slides table...
Creating site_settings table...
Creating petitions table...
Setting default banner toggle...
✅ All migrations completed successfully!

Tables created:
  - posts
  - banner_slides
  - site_settings
  - petitions

✨ Migration complete!
```

### 2. Verify Environment Variables

Required on Vercel:
- ✅ `DATABASE_URL` - Railway Postgres connection
- ✅ `JWT_SECRET` - Admin authentication

Optional:
- ⚠️ `GITHUB_TOKEN` - For auto-commit when publishing (not implemented yet)
- ⚠️ `OPENAI_API_KEY` - For AI SEO generation (falls back to templates)

Check variables:
```bash
vercel env ls
```

### 3. Deploy to Vercel

```bash
# Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "feat: Add CMS features - Posts, Banner, Petitions"
git push origin main

# Or deploy directly via Vercel CLI
vercel --prod
```

### 4. Test the Admin Dashboard

1. **Access:** `https://securethevotemd.com/admin/`

2. **Login** with existing admin credentials

3. **Verify existing features still work:**
   - [ ] Signatures tab loads
   - [ ] CSV export works
   - [ ] Admin Users tab loads
   - [ ] Can create new admin user

4. **Test new Posts tab:**
   - [ ] Click "Posts" tab
   - [ ] Click "New Post"
   - [ ] Title auto-generates slug
   - [ ] Rich text editor loads (Quill)
   - [ ] Can upload featured image URL
   - [ ] "Auto-Generate SEO" button works
   - [ ] "Preview" opens new window
   - [ ] "Save Draft" creates post
   - [ ] "Publish" changes status

5. **Test Banner tab:**
   - [ ] Click "Banner" tab
   - [ ] "Banner Enabled" toggle works
   - [ ] Click "Add Slide"
   - [ ] Can edit slide fields
   - [ ] ↑↓ buttons reorder slides
   - [ ] "Delete" removes slide

6. **Test Petitions tab:**
   - [ ] Click "Petitions" tab
   - [ ] Click "New Petition"
   - [ ] Can set internal name (slug)
   - [ ] Can configure fields
   - [ ] "Save Petition" creates it
   - [ ] Shows signature count
   - [ ] "Deactivate" button works

## 🔍 Troubleshooting

### Migration fails with "ECONNREFUSED"
- DATABASE_URL not set or wrong
- Check Railway Postgres is running
- Verify connection string format

### "Unauthorized" errors in admin
- JWT_SECRET missing or changed
- Clear localStorage and re-login
- Check existing admins still in database

### Posts tab doesn't load
- Check browser console for errors
- Verify `/api/admin/posts` endpoint returns 200
- Check Network tab for API calls

### Quill editor not showing
- Check CDN is accessible
- Verify `https://cdn.quilljs.com/1.3.7/quill.min.js` loads
- Check browser console for errors

### SEO generation fails
- Normal if OPENAI_API_KEY not set (uses template fallback)
- Check API key is valid if set
- Verify OpenAI API credits available

## 📊 Database Schema Reference

### Posts Table
```sql
id SERIAL PRIMARY KEY
title VARCHAR(500) NOT NULL
slug VARCHAR(500) NOT NULL UNIQUE
content TEXT
excerpt TEXT
category VARCHAR(100) DEFAULT 'uncategorized'
post_type VARCHAR(50) DEFAULT 'article'
external_url TEXT
featured_image TEXT
seo_title VARCHAR(200)
seo_description VARCHAR(500)
og_image TEXT
status VARCHAR(20) DEFAULT 'draft'
author_email VARCHAR(255)
published_at TIMESTAMP
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Banner Slides Table
```sql
id SERIAL PRIMARY KEY
title VARCHAR(500) NOT NULL
description TEXT
link_url TEXT
link_text VARCHAR(100) DEFAULT 'Discover more'
background_image TEXT
sort_order INTEGER DEFAULT 0
active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Site Settings Table
```sql
key VARCHAR(100) PRIMARY KEY
value TEXT
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Petitions Table
```sql
id SERIAL PRIMARY KEY
name VARCHAR(255) NOT NULL UNIQUE
title VARCHAR(500) NOT NULL
description TEXT
active BOOLEAN DEFAULT true
fields JSONB DEFAULT '["full_name","email","zip_code"]'
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🎯 Post-Deployment Tasks

### 1. Test Post Publishing
- Create a test post
- Publish it
- Verify HTML is generated
- Download the HTML
- Manually upload to `dist/YYYY/MM/DD/slug/index.html`
- Test the live page

### 2. Configure Banner
- Add 3 slides (or migrate existing from homepage)
- Set proper background images
- Configure links
- Toggle banner on

### 3. Migrate Existing Petition
- Create petition in CMS matching existing one
- Verify signatures still appear in admin

### 4. Backup Database
```bash
# Via Railway CLI or pg_dump
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## 📞 Support

### API Endpoints Quick Reference
- GET `/api/admin/posts` - List posts
- POST `/api/admin/posts` - Create post
- GET `/api/admin/post?id=X` - Get single post
- PUT `/api/admin/post?id=X` - Update post
- DELETE `/api/admin/post?id=X` - Delete post
- POST `/api/admin/post-publish` - Publish post
- POST `/api/admin/post-preview` - Preview post
- POST `/api/admin/post-seo` - Generate SEO
- GET `/api/admin/banner` - List slides
- POST `/api/admin/banner` - Create slide
- PUT `/api/admin/banner?id=X` - Update slide
- DELETE `/api/admin/banner?id=X` - Delete slide
- PUT `/api/admin/banner-settings` - Toggle/reorder
- GET `/api/admin/petitions` - List petitions
- POST `/api/admin/petitions` - Create petition
- PUT `/api/admin/petitions?id=X` - Update petition
- DELETE `/api/admin/petitions?id=X` - Deactivate petition

### Common Issues
1. **Admin can't see new tabs** → Clear browser cache, hard refresh (Ctrl+Shift+R)
2. **API returns 500** → Check server logs in Vercel dashboard
3. **Database connection fails** → Verify DATABASE_URL in Vercel env vars
4. **Quill not loading** → Check CDN accessibility, try different network

---

**Last Updated:** February 13, 2026  
**Version:** 1.0.0  
**Next Steps:** Run migration → Deploy → Test
