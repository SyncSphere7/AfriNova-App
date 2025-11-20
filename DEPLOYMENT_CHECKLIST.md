# Deployment Checklist

Use this checklist when deploying AfriNova.

## ✅ Pre-Deployment

- [ ] Code is committed to Git
- [ ] .env file is NOT committed (check .gitignore)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All environment variables documented

## ✅ GitHub Setup

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] Repository is private (recommended for commercial projects)

## ✅ Vercel Deployment

- [ ] Account created on Vercel
- [ ] Repository imported to Vercel
- [ ] All environment variables added:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] PESAPAL_CONSUMER_KEY
  - [ ] PESAPAL_CONSUMER_SECRET
  - [ ] PESAPAL_ENVIRONMENT
  - [ ] OPENROUTER_API_KEY
  - [ ] RESEND_API_KEY
- [ ] Build settings verified (Next.js preset)
- [ ] First deployment successful
- [ ] Custom domain added (optional)

## ✅ Supabase Configuration

- [ ] Supabase project created/existing project verified
- [ ] All migrations applied
- [ ] Auth redirect URLs updated with Vercel domain
- [ ] Site URL updated with Vercel domain
- [ ] Edge Functions environment variables set:
  - [ ] OPENROUTER_API_KEY
  - [ ] RESEND_API_KEY
  - [ ] PESAPAL_CONSUMER_KEY
  - [ ] PESAPAL_CONSUMER_SECRET
- [ ] Edge Functions deployed (4 functions)

## ✅ External Services

- [ ] OpenRouter account has credits
- [ ] Resend account verified
- [ ] Resend domain verified (for production emails)
- [ ] Pesapal account configured
- [ ] Pesapal environment set correctly (sandbox/live)

## ✅ Testing

- [ ] Can access deployed site
- [ ] Can sign up for account
- [ ] Can log in
- [ ] Can browse templates
- [ ] Can create project
- [ ] Can view integrations
- [ ] Password reset works
- [ ] Settings page loads

## ✅ Post-Deployment

- [ ] Test code generation (costs credits)
- [ ] Test email delivery
- [ ] Test payment flow (if applicable)
- [ ] Monitor error logs in Vercel
- [ ] Monitor database usage in Supabase
- [ ] Set up monitoring/alerts (optional)

## ✅ Documentation

- [ ] README.md reviewed
- [ ] Team has access to environment variables
- [ ] API keys stored securely
- [ ] Deployment process documented

## 🎉 Launch Ready!

Once all items are checked, your application is live and ready for users!

## 🚨 Troubleshooting

If something doesn't work:

1. Check Vercel build logs
2. Check Supabase Edge Function logs
3. Check browser console for errors
4. Verify all environment variables
5. Check Auth redirect URLs in Supabase
6. Review DEPLOYMENT_GUIDE.md

## 📞 Need Help?

- Check QUICK_START.md for quick fixes
- Review DEPLOYMENT_GUIDE.md for details
- Check Vercel/Supabase documentation
