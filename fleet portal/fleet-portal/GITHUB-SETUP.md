# 🐙 GitHub Setup Guide

## Quick Start: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fleet-portal` (or whatever you want)
3. Description: "Fleet management client portal MVP"
4. Choose: **Private** (keep it private initially)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Push Your Code

```bash
cd fleet-portal

# Set your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/fleet-portal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel from GitHub

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project
5. Add environment variables (if using Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Done! Your app will be live at `your-project.vercel.app`

## Alternative: Deploy Without GitHub

If you don't want to use GitHub:

```bash
cd fleet-portal
npm install -g vercel
vercel login
vercel
```

Follow the prompts and your app will be deployed directly.

## Making Updates

After you make changes to your code:

```bash
git add .
git commit -m "Add new feature"
git push
```

Vercel will automatically redeploy your app!

## GitHub Pages Alternative

If you prefer GitHub Pages over Vercel:

1. Edit `vite.config.js` and add:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/fleet-portal/', // Your repo name
})
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add to `package.json` scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy
```

5. Enable GitHub Pages in your repo settings → Pages → Source: gh-pages branch

**Note:** Vercel is recommended over GitHub Pages for this project because it handles SPA routing better and is easier to set up environment variables.

## Repository Settings

### Recommended Settings:

- **Visibility:** Private (until you're ready to open-source)
- **Branch Protection:** Enable for `main` once you have collaborators
- **Secrets:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if using GitHub Actions

### Collaborators:

If working with a team:
1. Settings → Collaborators
2. Add team members
3. They can clone: `git clone https://github.com/YOUR_USERNAME/fleet-portal.git`

## Troubleshooting

**Authentication Error:**
```bash
# Use Personal Access Token instead of password
# Generate at: https://github.com/settings/tokens
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/fleet-portal.git
```

**Large Files:**
GitHub has a 100MB file limit. This project is small (~1MB), so you shouldn't have issues.

**Merge Conflicts:**
If you edit on GitHub and locally:
```bash
git pull origin main
# Resolve conflicts
git add .
git commit -m "Resolve conflicts"
git push
```

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect to Vercel
3. ✅ Set up environment variables
4. ✅ Make your first change and see auto-deploy in action!
