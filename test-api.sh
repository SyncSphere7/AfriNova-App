#!/bin/bash
# Test script for AfriNova API System
# Run this after setting up .env.local and starting the dev server

echo "🧪 Testing AfriNova API System"
echo "================================"
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
    echo "❌ Error: API key required"
    echo ""
    echo "Usage: ./test-api.sh YOUR_API_KEY"
    echo ""
    echo "Example:"
    echo "  ./test-api.sh afn_live_abc123def456..."
    echo ""
    echo "To get your API key:"
    echo "  1. Start the dev server: npm run dev"
    echo "  2. Go to http://localhost:3000"
    echo "  3. Log in"
    echo "  4. Navigate to Dashboard → Settings → API Keys"
    echo "  5. Generate a new API key"
    echo ""
    exit 1
fi

API_KEY=$1
API_URL="http://localhost:3000"

echo "🔑 Using API Key: ${API_KEY:0:20}..."
echo "🌐 API URL: $API_URL"
echo ""

# Test 1: Generate a simple component
echo "📝 Test 1: Generate a simple button component"
echo "=============================================="
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/v1/generate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple button component with primary and secondary variants",
    "techStack": {
      "frontend": "React",
      "styling": "Tailwind CSS"
    },
    "projectType": "component"
  }')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo ""

# Test 2: Check usage statistics
echo "📊 Test 2: Check usage statistics"
echo "=================================="
echo ""

USAGE_RESPONSE=$(curl -s "$API_URL/api/v1/usage" \
  -H "Authorization: Bearer $API_KEY")

echo "$USAGE_RESPONSE" | jq '.' 2>/dev/null || echo "$USAGE_RESPONSE"
echo ""
echo ""

# Test 3: List API keys
echo "🔑 Test 3: List all API keys"
echo "============================="
echo ""

KEYS_RESPONSE=$(curl -s "$API_URL/api/v1/keys" \
  -H "Authorization: Bearer $API_KEY")

echo "$KEYS_RESPONSE" | jq '.' 2>/dev/null || echo "$KEYS_RESPONSE"
echo ""
echo ""

echo "✅ Test complete!"
echo ""
echo "If you see errors, check:"
echo "  1. Is the dev server running? (npm run dev)"
echo "  2. Is your .env.local configured correctly?"
echo "  3. Is your API key valid?"
echo ""
