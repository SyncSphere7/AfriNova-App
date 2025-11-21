#!/bin/bash
# Setup script for AfriNova API System
# This script will help you configure your environment variables

echo "🚀 AfriNova API System Setup"
echo "=============================="
echo ""

# Get Supabase API Keys
echo "📌 Step 1: Getting Supabase API Keys..."
echo "Running: supabase projects api-keys --project-ref zergvcnzvaeuibkukkgw"
echo ""

supabase projects api-keys --project-ref zergvcnzvaeuibkukkgw

echo ""
echo "=============================="
echo ""
echo "📝 Step 2: Update .env.local file"
echo ""
echo "Please copy the keys above and paste them into .env.local:"
echo "  1. Copy the 'anon key' (public)"
echo "  2. Copy the 'service_role key' (secret)"
echo ""
echo "Then edit .env.local and replace:"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here"
echo "  - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
echo ""
echo "You can edit the file with:"
echo "  nano .env.local"
echo "  or"
echo "  code .env.local"
echo ""
echo "=============================="
echo ""
echo "⚙️  Step 3: Add OpenRouter API Key (Required for AI generation)"
echo ""
echo "Get your API key from: https://openrouter.ai/keys"
echo "Then add to .env.local:"
echo "  OPENROUTER_API_KEY=sk-or-v1-xxxxx"
echo ""
echo "=============================="
echo ""
echo "🎯 Step 4: Start the development server"
echo ""
echo "Once you've updated .env.local, run:"
echo "  npm run dev"
echo ""
echo "Then test the API system:"
echo "  1. Go to http://localhost:3000"
echo "  2. Sign up / Log in"
echo "  3. Navigate to Dashboard → Settings → API Keys"
echo "  4. Generate your first API key"
echo "  5. Test with curl (see example below)"
echo ""
echo "=============================="
echo ""
echo "📚 Testing the API"
echo ""
echo "Example curl command (replace YOUR_API_KEY):"
echo ""
echo 'curl -X POST http://localhost:3000/api/v1/generate \'
echo '  -H "Authorization: Bearer YOUR_API_KEY" \'
echo '  -H "Content-Type: application/json" \'
echo "  -d '{
    \"prompt\": \"Create a simple button component\",
    \"techStack\": {
      \"frontend\": \"React\",
      \"styling\": \"Tailwind CSS\"
    },
    \"projectType\": \"component\"
  }'"
echo ""
echo "=============================="
echo ""
echo "✅ Setup script complete!"
echo ""
