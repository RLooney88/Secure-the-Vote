# SecureTheVote Admin Portal - Feature Roadmap

## Current Status (v1.0)
- ✅ Admin login & authentication
- ✅ Petition signature management
- ✅ Blog post management (draft mode)
- ✅ Petition management (draft mode)
- ✅ Banner configuration
- ✅ Site Editor AI (file editing)
- ✅ Preview/Publish workflow (staging → production)
- ✅ Global preview/publish buttons

## Planned Features

### Phase 2: Dynamic CMS Builder (AI-Powered)

**Problem:** Clients want to add new features (events, galleries, forms, etc.) without developer intervention.

**Solution:** AI Site Builder that can scaffold entire CMS features on demand.

**Capabilities Needed:**

1. **Database Schema Generation**
   - AI creates new PostgreSQL tables based on user request
   - Example: "Add an event calendar" → Creates `events` table with fields (title, date, location, description, etc.)
   - Automatically includes draft/published status for preview workflow
   - Creates appropriate indexes

2. **API Endpoint Generation**
   - Creates CRUD endpoints for new tables
   - `/api/admin/events` → GET (list), POST (create), PUT (update), DELETE
   - `/api/admin/events/publish-drafts` → Publish endpoint
   - Includes JWT auth automatically
   - Follows existing code patterns

3. **Admin UI Tab Generation**
   - Adds new tab to admin navigation
   - Generates table view with pagination, search, filters
   - Generates create/edit form with appropriate field types
   - Includes preview/publish integration
   - Matches existing design system

4. **Frontend Integration**
   - Generates public-facing pages (e.g., `/events` page)
   - Creates Eleventy templates if needed
   - Adds to site navigation
   - Responsive design matching site theme

5. **File Structure Updates**
   - Creates proper directory structure
   - Follows existing conventions
   - Updates relevant config files
   - Commits to staging branch for preview

**Example User Flow:**

```
User: "Add an event calendar with title, date, location, description, and registration link"

AI Builder:
1. Creates `events` table in PostgreSQL
2. Creates `/api/admin/events.js` (CRUD endpoints)
3. Creates `/api/admin/events/publish-drafts.js`
4. Adds "Events" tab to admin dashboard
5. Creates admin/events form UI
6. Creates public `/events` page template
7. Updates site navigation
8. Pushes all changes to staging
9. Returns: "Event calendar created! Preview at [staging URL]"
```

**Technical Implementation:**

- **AI Agent:** Separate specialized agent for CMS scaffolding
- **Templates:** Code templates for tables, APIs, UI components
- **Validation:** Schema validation, code linting before commit
- **Rollback:** Can undo changes if preview isn't satisfactory
- **Documentation:** Auto-generates docs for new features

**Dependencies:**
- PostgreSQL schema introspection
- Code generation templates
- File system write permissions
- Git commit/push automation
- More advanced Claude prompt engineering

**Estimated Complexity:** High
**Estimated Time:** 2-3 weeks for full implementation
**Priority:** Medium (after core features stabilized)

---

## Phase 3: Advanced Features (Future)

- Multi-site management (one admin, multiple client sites)
- Custom form builder (drag-and-drop)
- Media library & image management
- Email template editor
- Analytics dashboard
- User role permissions (multiple admin levels)
- Automated backups
- Version history / change log
- A/B testing for content

---

## Technical Debt / Improvements

- [ ] Add loading states to all async operations
- [ ] Improve error messages (user-friendly)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement undo/redo for content changes
- [ ] Add keyboard shortcuts for power users
- [ ] Mobile-responsive admin dashboard
- [ ] Dark mode toggle
- [ ] Export/import site configuration
- [ ] Automated testing suite

---

**Last Updated:** 2026-02-13  
**Maintained By:** Aster
