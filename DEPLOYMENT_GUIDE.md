# AfriNova Deployment Guide

This guide will help you deploy AfriNova to Vercel and continue development from another IDE.

## Part 1: Deploying to Vercel from GitHub

### Step 1: Prepare Your Repository

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/afrinova.git
   git push -u origin main
   ```

2. **Important**: Make sure `.env` is in your `.gitignore` file (it already is by default)

### Step 2: Get Your Environment Variables

You have two options:

#### Option A: Use Your Current Supabase Project
Your current environment variables are:
```
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

#### Option B: Create a New Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key
5. You'll need to run migrations (see Part 2)

### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new

2. **Import your GitHub repository**

3. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**:
   Click "Environment Variables" and add all the variables from Step 2 above:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `PESAPAL_CONSUMER_KEY`
   - `PESAPAL_CONSUMER_SECRET`
   - `PESAPAL_ENVIRONMENT`
   - `OPENROUTER_API_KEY`
   - `RESEND_API_KEY`

5. **Deploy**: Click "Deploy" and wait for the build to complete

6. **Configure Supabase Edge Functions**:
   After deployment, you need to set environment variables in your Supabase Edge Functions:
   - Go to your Supabase Dashboard
   - Navigate to Edge Functions > Settings
   - Add these secrets:
     - `OPENROUTER_API_KEY`: Your OpenRouter API key
     - `RESEND_API_KEY`: Your Resend API key
     - `PESAPAL_CONSUMER_KEY`: Your Pesapal key
     - `PESAPAL_CONSUMER_SECRET`: Your Pesapal secret

### Step 4: Update Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to Authentication > URL Configuration
3. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## Part 2: Continue Development in Another IDE

### Step 1: Clone Your Project

```bash
# Clone from GitHub
git clone https://github.com/yourusername/afrinova.git
cd afrinova

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values** in `.env`:
   - Use the same values from your Vercel deployment
   - Or create new API keys if needed

### Step 3: Connect to Your Existing Supabase Database

Your Supabase database already has all the migrations and data. You don't need to do anything special - just use the same credentials.

**Your current Supabase project details**:
- Project URL: `https://umvdtrmjtfmeidswwuac.supabase.co`
- Project Reference: `umvdtrmjtfmeidswwuac`

### Step 4: (Optional) Install Supabase CLI

If you want to manage migrations or edge functions locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref umvdtrmjtfmeidswwuac
```

### Step 5: Run Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

---

## Part 3: Managing Database Migrations

### If You're Using the Same Supabase Project

All migrations are already applied! Your database has:
- Users and profiles tables
- Projects and generations tables
- Integrations system
- Project templates (12 pre-built templates)
- Subscription and payment tables
- All RLS policies

### If You Created a New Supabase Project

You need to apply migrations:

1. **Copy migration files** from `supabase/migrations/` directory

2. **Apply each migration** in order in your Supabase SQL Editor:
   - Go to Supabase Dashboard > SQL Editor
   - Copy contents of each migration file
   - Execute in order (sorted by filename)

Or use Supabase CLI:
```bash
supabase db push
```

---

## Part 4: Deploying Edge Functions

Your project has 4 Edge Functions:
1. `generate-code` - AI code generation
2. `pesapal-webhook` - Payment webhooks
3. `pesapal-checkout` - Payment processing
4. `send-email` - Email service

### Deploy from Supabase Dashboard

1. Go to Supabase Dashboard > Edge Functions
2. Create new function
3. Copy code from `supabase/functions/[function-name]/index.ts`
4. Deploy

### Or Deploy Using Supabase CLI

```bash
# Deploy all functions
supabase functions deploy generate-code
supabase functions deploy pesapal-webhook
supabase functions deploy pesapal-checkout
supabase functions deploy send-email
```

---

## Part 5: Getting Required API Keys

### OpenRouter (AI Code Generation)
1. Go to https://openrouter.ai
2. Sign up/login
3. Go to Keys: https://openrouter.ai/keys
4. Create a new key
5. Add credits to your account

### Resend (Email Service)
1. Go to https://resend.com
2. Sign up/login
3. Go to API Keys: https://resend.com/api-keys
4. Create a new key
5. Verify your domain (optional for testing)

### Pesapal (Payments)
1. Go to https://www.pesapal.com
2. Sign up for merchant account
3. Get your consumer key and secret from dashboard
4. Use `sandbox` environment for testing

---

## Troubleshooting

### Build Fails on Vercel
- Check that all environment variables are set
- Verify no syntax errors in code
- Check Vercel build logs for specific errors

### Edge Functions Not Working
- Verify environment variables are set in Supabase Dashboard
- Check function logs in Supabase Dashboard
- Ensure CORS headers are properly configured

### Authentication Not Working
- Verify redirect URLs in Supabase Auth settings
- Check that environment variables match between Vercel and Supabase
- Clear browser cookies and try again

### Database Connection Issues
- Verify Supabase project URL and keys are correct
- Check that RLS policies allow your operations
- Use Supabase Dashboard SQL Editor to test queries

---

## Important Security Notes

1. **Never commit `.env` to GitHub** - It's in `.gitignore` by default
2. **Use environment variables** - Never hardcode API keys
3. **Rotate keys regularly** - Especially for production
4. **Use different keys** for development and production
5. **Enable RLS** - All tables should have Row Level Security enabled

---

## Your Current Configuration Summary

**Supabase Project**: `umvdtrmjtfmeidswwuac`
- ✅ Database with all migrations applied
- ✅ 12 project templates seeded
- ✅ 160+ integrations seeded
- ✅ RLS policies configured
- ✅ Edge Functions deployed

**Features Ready**:
- ✅ Authentication (email/password)
- ✅ Project creation with templates
- ✅ AI code generation
- ✅ Integrations marketplace
- ✅ Payment processing (Pesapal)
- ✅ Email notifications
- ✅ User dashboard

---

## Next Steps

1. Push your code to GitHub
2. Deploy to Vercel with environment variables
3. Test the deployment
4. Clone to your local machine
5. Continue development

Need help? Check the main README.md for more details!
