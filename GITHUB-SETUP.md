# GitHub Repository Setup

## Option 1: Using GitHub CLI (Fastest)

```bash
# Navigate to project
cd repos/Secure-the-Vote

# Create repository
gh repo create Secure-the-Vote --public --description "SecureTheVoteMD static site - Eleventy" --source=.

# Push code
git add .
git commit -m "Initial commit: Complete Eleventy static site"
git push -u origin main
```

## Option 2: Using GitHub Web Interface

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `Secure-the-Vote`
3. Description: `SecureTheVoteMD static site - Eleventy`
4. Visibility: **Public** (or Private if preferred)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Push Local Code

```bash
# Navigate to project
cd repos/Secure-the-Vote

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete Eleventy static site"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Secure-the-Vote.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Option 3: Manual GitHub API (If CLI unavailable)

```bash
# Set variables
GITHUB_TOKEN="your_personal_access_token"
GITHUB_USER="your_username"

# Create repo via API
curl -H "Authorization: token $GITHUB_TOKEN" \
     -d '{"name":"Secure-the-Vote","description":"SecureTheVoteMD static site - Eleventy","private":false}' \
     https://api.github.com/user/repos

# Then push as in Option 2
git remote add origin https://github.com/$GITHUB_USER/Secure-the-Vote.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Repository Settings

After creating the repository:

### Branch Protection (Optional but Recommended)

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### Secrets (for GitHub Actions if using)

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `HIGHLEVEL_API_KEY`
   - `HIGHLEVEL_LOCATION_ID`
   - `ADMIN_SECRET_KEY`

### GitHub Pages (Alternative to Vercel)

If deploying to GitHub Pages instead:

1. Go to Settings → Pages
2. Source: GitHub Actions
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Eleventy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

Note: GitHub Pages doesn't support serverless functions - use Vercel for full petition system.

## Collaborators

To add team members:

1. Go to Settings → Collaborators
2. Click "Add people"
3. Enter GitHub username
4. Set permission level

## Repository Topics

Add topics for discoverability:

```
eleventy
static-site
maryland
voting
election-integrity
jamstack
vercel
```

Go to main page → Click ⚙️ next to "About" → Add topics

## README Badge (Optional)

Add deployment status badge to README.md:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Secure-the-Vote)
```

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code
3. → Go to [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel setup
4. → Review [README.md](./README.md) for development guide

---

**DO NOT COMMIT `.env` FILES!**

Always use `.env.example` as template and add real values locally or in Vercel dashboard.
