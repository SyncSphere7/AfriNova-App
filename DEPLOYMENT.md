# Deployment Guide

## ✅ Pre-Deployment Checklist

This application is configured for **Server-Side Rendering (SSR)** deployment on platforms like Vercel, Netlify, Railway, or Render.

### Critical Configuration

- ✅ **Node.js**: >= 18.0.0
- ✅ **npm**: >= 9.0.0
- ✅ **Build Command**: `npm run build` or `npm ci && npm run build`
- ✅ **Start Command**: `npm start`
- ✅ **Output Directory**: `.next`

### Required Environment Variables

Set these in your deployment platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_INTEGRATION_ENCRYPTION_KEY=your_32_char_encryption_key
```

## 🚀 Deployment Platforms

### Vercel (Recommended)

1. Connect your GitHub repository
2. Vercel auto-detects Next.js
3. Add environment variables in Settings → Environment Variables
4. Deploy!

**Build Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`

### Netlify

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

### Railway

1. Create new project from GitHub
2. Add environment variables
3. Railway auto-deploys on push

### Render

**Build Command:** `npm ci && npm run build`
**Start Command:** `npm start`

## 🔧 Troubleshooting Deployment Errors

### Error: "Module not found: Can't resolve '@supabase/ssr'"

**Cause:** Dependencies not installed on deployment platform

**Fix:**
1. Ensure `package-lock.json` is committed to git
2. Check build command includes `npm ci` or `npm install`
3. Verify deployment platform is using Node >= 18
4. Clear build cache and redeploy

**Verification Script:**
```bash
bash .deployment-check.sh
```

### Error: "output: export" issues

**Cause:** Static export mode is incompatible with SSR

**Fix:** Ensure `next.config.js` does NOT have `output: 'export'`

**Correct config:**
```javascript
const nextConfig = {
  // NO output: 'export' here
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};
```

### Error: Build succeeds but runtime errors

**Cause:** Missing environment variables

**Fix:**
1. Check all `NEXT_PUBLIC_*` vars are set
2. Verify Supabase connection
3. Check deployment logs for specific errors

## 🧪 Local Deployment Testing

Simulate production deployment locally:

```bash
# Clean install (mimics deployment)
rm -rf node_modules .next
npm ci

# Build
npm run build

# Test production server
npm start
```

## 📊 Expected Build Output

Successful build should show:

```
✓ Compiled successfully
✓ Generating static pages (15/15)

Route (app)                              Size     First Load JS
┌ ○ /                                    ~2 kB     ~157 kB
├ λ /dashboard                           ~176 B    ~89 kB
├ λ /dashboard/integrations              ~13 kB    ~189 kB
└ λ /api/welcome-email                   0 B       0 B

λ  (Server)  server-side renders at runtime
○  (Static)  automatically rendered as static HTML
```

## 🔐 Security Checklist

- [ ] Environment variables set in deployment platform (NOT in code)
- [ ] `.env` file is in `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] API keys are client-side encrypted
- [ ] CORS configured for production domain

## 📞 Support

If deployment still fails:

1. Run `.deployment-check.sh` and share output
2. Share full deployment logs
3. Verify Node version: `node --version`
4. Verify dependencies: `npm list @supabase/ssr jszip`

## 🎯 Quick Deploy Commands

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Railway:**
```bash
npm i -g @railway/cli
railway up
```
