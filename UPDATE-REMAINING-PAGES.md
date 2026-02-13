# Quick Guide: Updating Remaining Pages with SEO

This guide shows you how to update the frontmatter on the remaining pages to match the SEO-optimized template.

---

## 📋 Pages Still Needing Updates

- `src/pages/be-an-election-judge.njk`
- `src/pages/board-compliance.njk`
- `src/pages/check-voter-registration.njk`
- `src/pages/citizen-action.njk`
- `src/pages/in-the-news.njk`
- `src/pages/lawsuit-document.njk`
- `src/pages/maryland-nvra-violations.njk`
- `src/pages/poll-watchers-toolkit.njk`
- `src/pages/press-release.njk`
- `src/pages/register-for-lobby-day-jan-27.njk`
- `src/pages/resources.njk`
- `src/pages/sign-the-petition.njk`
- `src/pages/voter-registration-inflation.njk`
- `src/pages/whats-happening.njk`

---

## ✏️ How to Update

### **Step 1: Open the file**
```bash
# Example
code src/pages/be-an-election-judge.njk
```

### **Step 2: Replace the frontmatter**

**BEFORE** (typical current state):
```yaml
---
layout: base.njk
title: "Be An Election Judge"
description: "Some description here..."
slug: "be-an-election-judge"
order: 999
date: 2024-04-02T11:40:21
---
```

**AFTER** (SEO-optimized):
```yaml
---
layout: base.njk
title: "Become a Maryland Election Judge - Secure Our Elections"
description: "Learn how to become an election judge in Maryland. Serve your community, ensure election integrity, and get paid to help secure fair and transparent elections."
keywords: "Maryland election judge, become election judge Maryland, election worker, poll worker Maryland, election day volunteer, secure elections Maryland"
slug: "be-an-election-judge"
order: 7
date: 2024-04-02T11:40:21
modified: 2026-02-13T10:20:00
image: "/images/election-judge-og.jpg"
ogType: "article"
section: "Citizen Action"
breadcrumbs:
  - name: "Citizen Action"
    url: "/pages/citizen-action/"
  - name: "Election Judge"
    url: "/pages/be-an-election-judge/"
---
```

### **Step 3: Customize the SEO fields**

#### **Title** (50-60 characters)
- Include primary keyword
- Make it compelling
- Include location (Maryland)
- Add value proposition

**Examples:**
- "Maryland Voter ID Legislation - Election Security"
- "Election Board Compliance - Holding Officials Accountable"
- "Check Maryland Voter Registration Status"

#### **Description** (150-160 characters)
- Expand on the title
- Include a call-to-action
- Natural keyword usage
- Compelling and informative

**Examples:**
- "Verify your Maryland voter registration status online. Ensure your information is accurate and up-to-date for upcoming elections. Check now."
- "Hold Maryland's election boards accountable. Learn how to monitor compliance, report violations, and ensure transparent election administration."

#### **Keywords** (5-8 relevant terms)
- Primary keyword
- Secondary keywords
- Location-specific terms
- Related phrases
- Natural language variations

**Examples:**
```yaml
keywords: "Maryland voter registration, check registration status, verify voter info, Maryland elections, voter database lookup"
```

#### **Image** (OG image path)
- Create or use existing image
- 1200x630px recommended
- Fallback to `/images/og-default.jpg` if not ready

#### **ogType**
- `"article"` - For informational/educational pages
- `"website"` - For utility/action pages (contact, register, etc.)

#### **Section** (for article types)
Choose one of these categories:
- `"Accountability"`
- `"Legislation"`
- `"Advocacy"`
- `"News"`
- `"Citizen Action"`
- `"Resources"`

#### **Breadcrumbs** (optional but recommended)
Helps with navigation and SEO:
```yaml
breadcrumbs:
  - name: "Resources"
    url: "/pages/resources/"
  - name: "Poll Watchers Toolkit"
    url: "/pages/poll-watchers-toolkit/"
```

#### **Order** (navigation priority, 1-14)
Suggested order based on importance:
1. Home (index.njk)
2. Trump Executive Order
3. List Maintenance
4. Signature Verification
5. Voter ID
6. Board Compliance
7. Be an Election Judge
8. Citizen Action
9. Resources
10. In The News
11. Contact Us
12-14. Other pages

---

## 🎯 Page-Specific Suggestions

### **Board Compliance**
```yaml
title: "Maryland Election Board Compliance - Ensuring Accountability"
description: "Hold Maryland's election boards accountable. Learn how to monitor compliance, report violations, and ensure transparent election administration."
keywords: "Maryland election board compliance, election accountability, board of elections oversight, election transparency Maryland"
section: "Accountability"
```

### **Check Voter Registration**
```yaml
title: "Check Maryland Voter Registration Status"
description: "Verify your Maryland voter registration status online. Ensure your information is accurate and up-to-date for upcoming elections. Check now."
keywords: "check voter registration Maryland, verify voter status, Maryland voter lookup, registration verification"
ogType: "website"
```

### **Citizen Action**
```yaml
title: "Take Citizen Action for Maryland Election Integrity"
description: "Get involved in securing Maryland elections. Learn how citizens can take action, volunteer, advocate for election reforms, and protect voting rights."
keywords: "citizen action Maryland, election integrity volunteer, grassroots election reform, Maryland voter advocacy"
section: "Advocacy"
```

### **In The News**
```yaml
title: "Secure The Vote MD - Latest News & Media Coverage"
description: "Stay informed with the latest news, press releases, and media coverage about Maryland election integrity efforts and voter security initiatives."
keywords: "Maryland election news, election integrity press releases, voter security news Maryland, election reform media"
section: "News"
```

### **Poll Watchers Toolkit**
```yaml
title: "Maryland Poll Watcher Toolkit - Ensure Fair Elections"
description: "Essential tools and resources for Maryland poll watchers. Learn your rights, duties, and how to monitor election integrity on Election Day."
keywords: "poll watcher toolkit Maryland, election observer, poll monitoring, election day observer, voter integrity monitoring"
section: "Resources"
```

### **Resources**
```yaml
title: "Maryland Election Integrity Resources & Tools"
description: "Comprehensive resources for Maryland election integrity advocates. Access guides, toolkits, legal documents, and educational materials."
keywords: "election integrity resources Maryland, voter security tools, election reform guides, Maryland voting resources"
section: "Resources"
```

### **Sign The Petition**
```yaml
title: "Sign the Petition - Secure Maryland Elections"
description: "Add your voice! Sign the petition urging Maryland legislators to enact meaningful election reforms and protect voting integrity."
keywords: "Maryland election petition, sign petition secure vote, election reform petition, Maryland voter integrity petition"
ogType: "website"
```

---

## 🚀 Quick Commands

### **Open all pages in VS Code:**
```bash
code src/pages/*.njk
```

### **Find pages with old frontmatter:**
```bash
grep -l "order: 999" src/pages/*.njk
```

### **Test build after updates:**
```bash
npm run build
```

---

## ✅ Verification Checklist

After updating each page:
- [ ] Title is descriptive and under 60 characters
- [ ] Description is compelling and 150-160 characters
- [ ] Keywords are relevant (not stuffed)
- [ ] Image path is correct (or using default)
- [ ] ogType is appropriate (article/website)
- [ ] Section is assigned (if article type)
- [ ] Order number is logical (1-14)
- [ ] Modified date is updated to 2026-02-13
- [ ] YAML syntax is valid (no stray characters)

---

## 🎓 Pro Tips

1. **Use AI for descriptions:** Ask ChatGPT to write compelling meta descriptions based on page content
2. **Keyword research:** Use Google's "People Also Ask" and autocomplete for keyword ideas
3. **Check competitors:** Look at similar organizations' page titles for inspiration
4. **Test social sharing:** Use Facebook Debugger and Twitter Card Validator after deployment
5. **Monitor performance:** Track which pages rank well and refine others accordingly

---

**Need help?** Refer to `SEO-IMPLEMENTATION.md` for the full guide.
