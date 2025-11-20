#!/bin/bash

echo "🔍 Deployment Pre-flight Check"
echo "================================"
echo ""

echo "✓ Checking Node.js version..."
node --version

echo "✓ Checking npm version..."
npm --version

echo "✓ Checking package.json exists..."
if [ -f "package.json" ]; then
  echo "  ✓ package.json found"
else
  echo "  ✗ package.json missing!"
  exit 1
fi

echo "✓ Checking package-lock.json exists..."
if [ -f "package-lock.json" ]; then
  echo "  ✓ package-lock.json found"
else
  echo "  ✗ package-lock.json missing!"
  exit 1
fi

echo "✓ Checking critical dependencies..."
npm list @supabase/ssr jszip 2>&1 | grep -E "@supabase/ssr|jszip"

echo "✓ Checking Next.js config..."
if [ -f "next.config.js" ]; then
  echo "  ✓ next.config.js found"
  grep -q "output: 'export'" next.config.js && echo "  ⚠ WARNING: Static export mode detected!" || echo "  ✓ SSR mode enabled"
else
  echo "  ✗ next.config.js missing!"
  exit 1
fi

echo "✓ Checking environment variables..."
if [ -f ".env" ]; then
  echo "  ✓ .env found"
  grep -c "NEXT_PUBLIC_SUPABASE" .env && echo "  ✓ Supabase vars configured"
else
  echo "  ⚠ .env not found (should be set in deployment platform)"
fi

echo ""
echo "================================"
echo "✅ Pre-flight check complete!"
echo ""
echo "To test deployment locally:"
echo "  1. rm -rf node_modules .next"
echo "  2. npm ci"
echo "  3. npm run build"
