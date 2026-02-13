# SecureTheVoteMD - Layout & Spacing Analysis
**Date:** 2026-02-13  
**Issue:** Content is left-justified and spacing problems throughout site

## Comparison: WordPress vs Vercel

### WordPress Site (securethevotemd.com)
- **Container Max-Width:** 1200px centered
- **Content Alignment:** Centered, properly constrained
- **Section Padding:** Consistent 3em-4em vertical spacing
- **Text Alignment:** Mix of centered (hero, petition) and left (content sections)

### Vercel Site (secure-the-vote.vercel.app) - CURRENT ISSUES
- **Container:** Missing proper max-width constraints
- **Content:** Appears left-justified, not centered
- **Spacing:** Inconsistent padding/margins
- **Layout:** Full-width instead of constrained 1140-1200px

## PROBLEMS IDENTIFIED

### 1. **Container Width Issues**
```css
/* WordPress has:
.elementor-9 .elementor-element.elementor-element-5be49054 > .elementor-container {
  max-width: 1200px;
}
*/
/* Current site: Missing this constraint */
```

### 2. **Content Centering**
- Main content sections need `margin: 0 auto` with max-width
- Containers should center-align, not default to left

### 3. **Section Spacing**
- Petition section: Should have `padding: 3em 0`
- Statement of Purpose: Should have `padding: 4em 0`
- Mission section: Should have `padding: 3em 0`

### 4. **Column Layout**
- Two-column sections (Statement of Purpose) need proper gap
- Image column and text column need alignment

### 5. **Text Alignment Specifics**
- **Petition heading:** Center-aligned
- **Statement of Purpose heading:** Left-aligned within centered container
- **Mission heading:** Left-aligned within centered container
- **Body text:** Left-aligned

## FILES TO FIX
1. `src/css/elementor-homepage.css` - Primary layout CSS
2. `src/css/style.css` - Global container rules
3. `src/css/elementor.css` - Elementor-specific overrides

## NEXT STEPS
1. Add/fix `.elementor-container` max-width rules
2. Ensure all sections have proper centering
3. Fix section padding to match WordPress measurements
4. Test responsive behavior
5. Build and verify on Vercel preview
