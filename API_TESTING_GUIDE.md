# API System Testing Guide

This guide will walk you through testing the complete AfriNova API system.

## Prerequisites

Before testing, ensure you have:
- ✅ Supabase project created and migrations applied
- ✅ Environment variables configured in `.env.local`
- ✅ OpenRouter API key (for AI code generation)

## Step 1: Configure Environment Variables

### Get Supabase API Keys

Run the setup script:
```bash
./setup-api.sh
```

This will display your Supabase API keys. Copy them and update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zergvcnzvaeuibkukkgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (your service role key)
```

### Add OpenRouter API Key

Get your key from: https://openrouter.ai/keys

Add to `.env.local`:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

## Step 2: Start Development Server

```bash
npm install  # If you haven't already
npm run dev
```

The app will start at: http://localhost:3000

## Step 3: Create Your First API Key

1. **Sign Up / Log In**
   - Go to http://localhost:3000
   - Create an account or log in

2. **Navigate to API Keys**
   - Click Dashboard → Settings → API Keys
   - Or go directly to: http://localhost:3000/dashboard/settings/api-keys

3. **Generate API Key**
   - Click "Create API Key"
   - Name: `Test Key`
   - Environment: `Production`
   - Click "Create Key"

4. **Save Your Key**
   - ⚠️ **IMPORTANT**: Copy the API key NOW! You won't see it again.
   - It will look like: `afn_live_abc123def456...`

## Step 4: Test the API

### Option A: Use the Test Script (Recommended)

```bash
./test-api.sh afn_live_YOUR_KEY_HERE
```

This will test:
- ✅ Code generation endpoint
- ✅ Usage statistics endpoint
- ✅ API keys listing endpoint

### Option B: Manual Testing with curl

#### Test 1: Generate Code
```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple button component with hover effects",
    "techStack": {
      "frontend": "React",
      "styling": "Tailwind CSS"
    },
    "projectType": "component"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "path": "components/Button.tsx",
        "content": "// Generated button component code..."
      }
    ],
    "instructions": "How to use the button component...",
    "metadata": {
      "project_type": "component",
      "lines_of_code": 45,
      "tokens_used": 234,
      "generation_time_ms": 3500,
      "credits_consumed": 1,
      "credits_remaining": 99
    }
  }
}
```

#### Test 2: Check Usage Statistics
```bash
curl http://localhost:3000/api/v1/usage \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "summary": {
        "total_api_keys": 1,
        "active_keys": 1,
        "total_credits_used": 1,
        "credits_remaining": 99,
        "total_requests": 1
      },
      "recent_activity": [...]
    }
  }
}
```

#### Test 3: List API Keys
```bash
curl http://localhost:3000/api/v1/keys \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE"
```

#### Test 4: Create New API Key via API
```bash
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Second API Key",
    "environment": "sandbox"
  }'
```

#### Test 5: Check Rate Limiting
```bash
# Run this in a loop to test rate limits
for i in {1..35}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/v1/generate \
    -H "Authorization: Bearer afn_live_YOUR_KEY_HERE" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test","techStack":{"frontend":"React"},"projectType":"component"}'
done
```

After 30 requests (default rate limit), you should get:
```json
{
  "error": "Rate limit exceeded. Max 30 requests per minute."
}
```

## Step 5: Test in Dashboard

1. **View API Keys Dashboard**
   - Go to http://localhost:3000/dashboard/settings/api-keys
   - You should see your created keys
   - Check credits remaining
   - View request count

2. **Generate More Keys**
   - Try creating sandbox keys (`afn_test_...`)
   - Create keys with different names

3. **Revoke a Key**
   - Click "Revoke" on a key
   - Try using the revoked key - should get 401 error

4. **Delete a Key**
   - Click the trash icon
   - Confirm deletion
   - Key should disappear from the list

## Step 6: Test Error Handling

### Test Invalid API Key
```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Authorization: Bearer invalid_key_123" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

**Expected:** 401 Unauthorized

### Test Missing API Key
```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

**Expected:** 401 Unauthorized with helpful message

### Test Invalid Request Body
```bash
curl -X POST http://localhost:3000/api/v1/generate \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
```

**Expected:** 400 Bad Request with validation error

### Test Insufficient Credits
1. Set credits_allocated to 0 in database
2. Try to generate code
3. **Expected:** 402 Payment Required

## Step 7: Monitor in Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor
4. Check tables:
   - `api_keys` - See your generated keys (hashed)
   - `api_usage` - See detailed request logs
   - `profiles` - See user data

## Step 8: Check Response Headers

Every API response includes helpful headers:

```bash
curl -i http://localhost:3000/api/v1/usage \
  -H "Authorization: Bearer afn_live_YOUR_KEY_HERE"
```

Look for:
- `X-API-Version: v1`
- `X-Credits-Used: 10`
- `X-Credits-Remaining: 990`
- `X-Credits-Total: 1000`
- `X-RateLimit-Limit: 30`

## Troubleshooting

### "Invalid API key" Error
- ✅ Check you copied the full key (starts with `afn_live_` or `afn_test_`)
- ✅ Verify key is active (not revoked)
- ✅ Check Bearer token format: `Authorization: Bearer afn_live_...`

### "Failed to generate code" Error
- ✅ Verify OPENROUTER_API_KEY is set in `.env.local`
- ✅ Check OpenRouter API key is valid
- ✅ Ensure you have OpenRouter credits

### Database Connection Errors
- ✅ Check SUPABASE_URL is correct
- ✅ Verify anon and service_role keys are correct
- ✅ Confirm migrations were applied successfully

### Rate Limit Issues
- ⏱️ Wait 1 minute for rate limit to reset
- 📊 Check `rate_limit_per_minute` in `api_keys` table
- 🔄 Rate limits are per-key, not per-user

## Success Criteria ✅

Your API system is working correctly if:

1. ✅ You can create API keys via dashboard
2. ✅ Keys are displayed once and then hidden
3. ✅ Code generation works with valid API key
4. ✅ Usage statistics are tracked correctly
5. ✅ Credits are deducted after successful generations
6. ✅ Rate limiting kicks in after 30 requests/minute
7. ✅ Revoked keys return 401 errors
8. ✅ All data is logged in `api_usage` table
9. ✅ Response headers include credit information
10. ✅ Error messages are clear and helpful

## Performance Benchmarks

Expected performance:
- **API Key Validation**: < 100ms
- **Code Generation**: 2-10 seconds (depends on complexity)
- **Usage Statistics**: < 200ms
- **Key Creation**: < 300ms

## Security Checklist

- ✅ API keys are SHA-256 hashed in database
- ✅ Plain keys are never stored
- ✅ Keys are shown only once
- ✅ RLS policies prevent cross-user access
- ✅ Rate limiting prevents abuse
- ✅ Bearer token authentication required
- ✅ IP addresses and user agents are logged

## Next Steps

Once testing is complete:

1. **Deploy to Production**
   - Deploy to Vercel/Netlify
   - Update environment variables
   - Test production endpoints

2. **Add Billing Integration**
   - Connect Pesapal for credit purchases
   - Implement subscription management
   - Add credit top-up functionality

3. **Monitor Usage**
   - Set up alerts for high usage
   - Monitor error rates
   - Track API performance

4. **Documentation**
   - Share API docs with users
   - Create example projects
   - Write integration guides

---

**Need Help?**
- 📚 API Documentation: `/API_PRICING.md`
- 🐛 Issues: Check console logs and Supabase logs
- 💬 Questions: Review the code comments in API routes

Happy Testing! 🚀
