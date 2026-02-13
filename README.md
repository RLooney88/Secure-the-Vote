# Secure The Vote MD - Eleventy Static Site

This is a static site migration from WordPress/Elementor to Eleventy (11ty), preserving the exact design and structure of the original site.

## 📋 Project Overview

- **Source**: WordPress with Elementor page builder
- **Target**: Eleventy static site generator
- **Pages**: 20 pages migrated with full content and styling
- **Forms**: 4 HighLevel form integrations preserved
- **Design**: Exact Elementor styling maintained via custom CSS

## 🏗️ Structure

```
repos/Secure-the-Vote/
├── src/
│   ├── _data/
│   │   └── site.json          # Site metadata
│   ├── _includes/
│   │   ├── base.njk           # Base layout template
│   │   ├── header.njk         # Site header/navigation
│   │   └── footer.njk         # Site footer
│   ├── css/
│   │   ├── style.css          # Core styles
│   │   ├── elementor-compat.css # Elementor class compatibility
│   │   └── slider.css         # Carousel/slider styles
│   ├── js/
│   │   ├── main.js            # Core JavaScript
│   │   └── slider.js          # Carousel functionality
│   ├── pages/
│   │   └── *.njk              # 19 content pages
│   └── index.njk              # Homepage
├── scripts/
│   ├── parse-wordpress.js     # WordPress data parser
│   ├── pages-clean.json       # Cleaned WordPress pages
│   └── forms-clean.json       # HighLevel forms data
├── public/                    # Build output (generated)
├── .eleventy.js               # Eleventy configuration
└── package.json               # Dependencies
```

## 📄 Migrated Pages

1. Home (index)
2. Register for Lobby Day – Jan 27
3. Check Voter Registration
4. Voter Registration Inflation
5. Maryland NVRA Violations
6. Be an Election Judge
7. Signature Verification
8. Voter ID
9. Board Compliance
10. List Maintenance
11. Trump Executive Order
12. Sign the Petition
13. Poll Watchers Toolkit
14. In The News
15. Lawsuit Document
16. Press Release
17. Resources
18. What's Happening
19. Citizen Action
20. Contact Us

## 🎨 Design Preservation

The site maintains exact design fidelity through:

- **Elementor CSS Classes**: All original Elementor classes preserved and styled
- **Section Structure**: Container/column/widget hierarchy maintained
- **Background Overlays**: Preserved from original sections
- **Typography**: Exact heading sizes and styles
- **Spacing**: Original padding/margins maintained
- **Animations**: Fade-in effects preserved
- **Forms**: HighLevel iframe embeds integrated seamlessly

## 📝 Forms Integration

Four HighLevel forms are integrated:

1. **Lobby Day Registration** (`register-for-lobby-day-jan-27`)
2. **Election Judge Request** (`be-an-election-judge`)
3. **Petition Request** (`citizen-action`)
4. **Contact Form** (`contact-us`)

Forms include:
- Auto-resize iframe handling
- Exact styling from WordPress
- Original form script inclusion

## 🚀 Development

### Prerequisites

- Node.js v18+ (tested on v24.13.0)
- npm or yarn

### Installation

```bash
cd repos/Secure-the-Vote
npm install
```

### Commands

```bash
# Development server with live reload
npm start

# Build for production
npm run build

# Clean build directory
npm run clean
```

## 🌐 Deployment

### Static Hosting Options

The built site in `public/` can be deployed to:

1. **Netlify**
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `public`

2. **Vercel**
   - Import project
   - Framework: Eleventy
   - Build command: `npm run build`
   - Output directory: `public`

3. **GitHub Pages**
   ```bash
   npm run build
   # Push public/ contents to gh-pages branch
   ```

4. **Traditional Hosting**
   - Build locally: `npm run build`
   - Upload `public/` contents to web root
   - Ensure HighLevel form script can load

### Environment Configuration

Update `src/_data/site.json` for production:

```json
{
  "name": "Secure The Vote MD",
  "url": "https://securethevotemd.com",
  "year": 2026
}
```

## 🔧 Customization

### Adding New Pages

1. Create `.njk` file in `src/pages/`
2. Add frontmatter:
   ```yaml
   ---
   layout: base.njk
   title: "Page Title"
   description: "Page description"
   slug: "page-slug"
   order: 1
   ---
   ```
3. Add page content (HTML or Markdown)
4. Rebuild: `npm run build`

### Updating Navigation

Edit `src/_includes/header.njk` to add/remove navigation links.

### Modifying Styles

- **Core styles**: `src/css/style.css`
- **Elementor compatibility**: `src/css/elementor-compat.css`
- **Carousel**: `src/css/slider.css`

## 📦 Dependencies

- **@11ty/eleventy**: ^3.0.0 - Static site generator
- **luxon**: ^3.4.4 - Date formatting
- **markdown-it**: ^14.0.0 - Markdown parsing

## 🎯 Design Requirements Met

✅ Extracted styling from WordPress pages  
✅ Matched Elementor's section/column/container structure  
✅ Same colors, typography, button styles, spacing  
✅ Forms integrated seamlessly  
✅ All current design elements preserved exactly  

## 📝 Notes

- Images still reference WordPress CDN URLs (securethevotemd.com)
- For full static deployment, download and host images locally
- HighLevel form script requires internet connection
- Carousel uses vanilla JavaScript (no external dependencies)

## 🐛 Known Issues

- None at time of build

## 📞 Support

For issues or questions about the migration, refer to the original WordPress export at:
- `research/wordpress-migration/securethevotemd/pages.json`
- `research/wordpress-migration/securethevotemd/highlevel-forms.json`

## 📅 Migration Date

February 13, 2026

---

**Built with Eleventy** | **Design preserved from WordPress/Elementor**
