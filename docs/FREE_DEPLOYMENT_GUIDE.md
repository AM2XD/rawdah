# Free Deployment & Publishing Guide

This application is a static Single Page Application (SPA) built with **React**, **Vite**, and **Tailwind CSS**, connected directly to **Firebase Firestore & Authentication**. Because it requires no custom backend server to run, it can be hosted **100% free forever** on several top-tier static hosting platforms.

---

## Option 0: Directly from Google AI Studio (Instant & Already Live!)

If you are using Google AI Studio Build:
- Your application is **already deployed and hosted live**!
- You can find your live production/preview link in the AI Studio header (Share button) or use the **Shared App URL**:
  `https://ais-pre-g6zt4gekgqbcp6izmcke54-19401030006.europe-west2.run.app`
- Anyone can visit this URL right now from any computer, phone, or tablet.

---

## Option 1: Vercel (Recommended — Free, Fast & Automatic HTTPS)

Vercel provides generous free hosting for React/Vite web apps with custom domain support and automatic GitHub deploys.

### Method A: Deploy via GitHub (Zero configuration)
1. Push your repository to GitHub (`github.com/your-username/your-repo`).
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub (Free Hobby tier).
3. Click **"Add New Project"** and import your repository.
4. Vercel automatically detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* Add your Firebase environment variables under **Environment Variables**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Click **Deploy**. Within 30 seconds, you get a free `your-app.vercel.app` domain with SSL.

### Method B: Deploy via Command Line (`vercel CLI`)
```bash
npm install -g vercel
vercel
```
Follow the interactive prompts and select the defaults.

---

## Option 2: Netlify (Free & Drag-and-Drop)

Netlify is another top free tier hosting provider for Vite apps.

### Method A: Manual Drag-and-Drop (No Git required)
1. Build your production bundle locally:
   ```bash
   npm run build
   ```
   This generates a self-contained `dist/` folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder into your browser.
4. Your website is instantly live at a free `something.netlify.app` URL.

### Method B: Connect to GitHub
1. Sign in to [netlify.com](https://netlify.com) using your GitHub account.
2. Select **"Import from Git"**.
3. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy Site**.

*Note for Netlify SPA routing*: Create a file `public/_redirects` with:
```
/*    /index.html   200
```
*(This ensures refreshing any URL route resolves to index.html).*

---

## Option 3: Firebase Hosting (Keep database & hosting together)

Since your project already integrates with **Firebase Firestore & Authentication**, you can host the website directly on Firebase's free Spark plan.

### Steps:
1. Install the Firebase CLI tool:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in with your Google account:
   ```bash
   firebase login
   ```
3. Initialize hosting in your project root:
   ```bash
   firebase init hosting
   ```
   - Select your existing Firebase project (`cemetery-map-demo-2026`).
   - What do you want to use as your public directory? Type: `dist`
   - Configure as a single-page app (rewrite all urls to /index.html)? Type: `Yes`
   - Set up automatic builds and deploys with GitHub? Type: `No` (or Yes if desired).
4. Build the app and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
5. Your application will be live at:
   `https://cemetery-map-demo-2026.web.app` and `https://cemetery-map-demo-2026.firebaseapp.com`

---

## Option 4: GitHub Pages (100% Free with GitHub Actions)

If your code is hosted in a public GitHub repository:

1. In `vite.config.ts`, set the base path if using a subpath (e.g. `base: '/cemetery-map/'`) or leave `'/'` if using a custom root domain.
2. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add these scripts to `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Run:
   ```bash
   npm run deploy
   ```
5. Enable GitHub Pages in your GitHub Repository settings -> **Pages** -> Source: `gh-pages` branch.

---

## Summary Comparison

| Platform | Free Tier Limits | Custom Domain? | Setup Speed | Best For |
|---|---|---|---|---|
| **AI Studio (Current)** | Free / Built-in | Subdomain | Instant (Already done) | Quick sharing & testing |
| **Vercel** | 100 GB bandwidth / mo | Yes (Free SSL) | 2 minutes | Production web apps |
| **Firebase Hosting** | 10 GB storage, 360 MB/day | Yes (Free SSL) | 3 minutes | Keeping Auth/DB/Hosting in one console |
| **Netlify** | 100 GB bandwidth / mo | Yes (Free SSL) | 1 minute (Drag & Drop) | Simplest manual upload |
| **GitHub Pages** | 1 GB storage, 100 GB/mo | Yes | 5 minutes | Open-source GitHub repos |
