# Quick Start Guide

## 🚀 Deploy to Vercel in 5 Minutes

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://umvdtrmjtfmeidswwuac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmR0cm1qdGZtZWlkc3d3dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODUxMTAsImV4cCI6MjA3OTE2MTExMH0.2Jt63M_Gol4yDt9k4of21cKas8RWZQzeAMsEcfgIAPg

VITE_SUPABASE_URL=https://umvdtrmjtfmeidswwuac.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmR0cm1qdGZtZWlkc3d3dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODUxMTAsImV4cCI6MjA3OTE2MTExMH0.2Jt63M_Gol4yDt9k4of21cKas8RWZQzeAMsEcfgIAPg

PESAPAL_CONSUMER_KEY=EtXNj8ULJ0TXOqA8dzZBPpCLjSfL6zSp
PESAPAL_CONSUMER_SECRET=LjJbEqb9X3YkxfJAkPEWIROAANk=
PESAPAL_ENVIRONMENT=live

OPENROUTER_API_KEY=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

RESEND_API_KEY=re_NkQT5xw8_BgSGBBgA7Kg4pDAy3tDGWpc6
```

4. Click "Deploy"

### 3. Update Supabase Auth URLs

1. Go to https://app.supabase.com/project/umvdtrmjtfmeidswwuac/auth/url-configuration
2. Add your Vercel URL to Site URL and Redirect URLs

✅ Done! Your app is live!

---

## 💻 Continue Development Locally

### 1. Clone Your Repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

Then edit `.env` with your values (use the same ones from Vercel)

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## 📦 Your Database is Ready!

Your Supabase project already has:
- ✅ All tables and RLS policies
- ✅ 12 project templates
- ✅ 160+ integrations
- ✅ Edge functions deployed

**No additional setup needed!**

---

## 🔑 Need New API Keys?

### OpenRouter (for AI code generation)
- Get key: https://openrouter.ai/keys
- Add credits to your account

### Resend (for emails)
- Get key: https://resend.com/api-keys

### Pesapal (for payments)
- Get keys: https://www.pesapal.com

---

## 📚 More Details

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete documentation.
