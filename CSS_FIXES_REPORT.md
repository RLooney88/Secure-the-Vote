# CSS Styling Differences Report
## SecureTheVoteMD - WordPress vs Vercel Site

### Critical Issues Found:

#### 1. **COLOR INCONSISTENCIES**

**Gold Color Mismatch:**
- WordPress uses: `#F6BF58` (consistent throughout)
- Vercel currently has MIXED values:
  - `style.css` uses: `#F6B221` in CSS variable `--gold`
  - Should be: `#F6BF58` EVERYWHERE

**Announcement Bar:**
- `homepage.css` correctly sets: `background: #9B1E37` (maroon)
- But may conflict with other CSS

#### 2. **TOP BAR (Gold Bar)**

Current in `header.css`:
```css
.top-bar {
  background-color: #F6BF58; /* CORRECT */
}
```

Current in `style.css`:
```css
:root {
  --gold: #F6B221; /* WRONG - should be #F6BF58 */
}

.top-bar {
  background: var(--gold); /* Uses wrong variable */
}
```

**FIX:** Change `--gold` from `#F6B221` to `#F6BF58`

#### 3. **ANNOUNCEMENT BAR**

Current in `homepage.css`:
```css
.announcement-bar {
  background: #9B1E37; /* CORRECT - maroon */
}
```

Current in `style.css`:
```css
.announcement-bar {
  background: var(--gold); /* WRONG - uses gold instead of maroon */
}
```

**FIX:** Change announcement bar in style.css to use maroon (#9B1E37)

#### 4. **BUTTON COLORS**

Slider buttons in inline styles (index.njk):
```css
background-color: #F6BF58 !important; /* CORRECT */
```

Style.css buttons:
```css
.btn-secondary {
  background: var(--gold); /* Currently #F6B221, should be #F6BF58 */
}
```

#### 5. **HEADER STYLES**

header.css and style.css have DUPLICATE and CONFLICTING styles:
- Both define `.top-bar`
- Both define `.site-header`
- Both define `.main-navigation`
- Causes CSS specificity conflicts

**FIX:** Consolidate or ensure proper cascade

### FILES TO MODIFY:

1. **src/css/style.css**
   - Change `--gold: #F6B221` to `--gold: #F6BF58`
   - Change `.announcement-bar { background: var(--gold); }` to `background: #9B1E37`

2. **src/css/header.css** (already correct, just verify)
   - Uses `#F6BF58` directly (CORRECT)

3. **src/css/homepage.css** (already correct)
   - Uses `#9B1E37` for announcement bar (CORRECT)

### LOAD ORDER ISSUE:

Current load order in `index.html`:
```html
<link rel="stylesheet" href="/css/elementor-homepage.css">
<link rel="stylesheet" href="/css/header.css">
<link rel="stylesheet" href="/css/style.css">
```

**PROBLEM:** `style.css` loads LAST and overrides correct values from `header.css` and `homepage.css`

**SOLUTION:** Either:
1. Fix the values in `style.css` (RECOMMENDED)
2. OR change load order to put `style.css` first
3. OR remove duplicate styles

### EXPECTED COLORS (WordPress Standard):

| Element | Color | Hex Code |
|---------|-------|----------|
| Top Bar Background | Gold | #F6BF58 |
| Announcement Bar | Maroon | #9B1E37 |
| Donate Button | Maroon | #9B1E37 |
| Slider Button | Gold | #F6BF58 |
| Primary Links | Pink | #CC3366 |
| Maroon Sections | Dark Maroon | #9B1E37 |

### ACTION ITEMS:

✅ 1. Update CSS variable `--gold` in style.css
✅ 2. Fix announcement-bar background in style.css
✅ 3. Verify no other instances of #F6B221
✅ 4. Test locally after changes
✅ 5. Compare visual output with WordPress site
