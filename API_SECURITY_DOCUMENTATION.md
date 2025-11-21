# API Security System Documentation

## Overview

AfriNova includes a comprehensive API security system that prevents users from accidentally committing API keys, secrets, and credentials to their repositories.

## Components

### 1. AI Agent System Prompts (`lib/openrouter/models.ts`)

All 10 AI agents have been updated with security instructions:
- **FRONTEND** - Client-side API key protection
- **BACKEND** - Server-side secret management
- **DATABASE** - Database credential protection
- **PAYMENTS** - PCI-DSS compliance for payment keys
- **SECURITY** - Zero-tolerance secret enforcement
- **TESTING** - No real keys in test mocks
- **UXUI** - Masked/hidden UI for sensitive data
- **DEVOPS** - CI/CD secret management
- **ANALYTICS** - Public vs private key distinction
- **INTEGRATIONS** - 160+ API protection

Each agent will:
- ✅ Refuse to generate hardcoded secrets
- ✅ Flag attempts to use real credentials
- ✅ Educate users on proper environment variable usage
- ✅ Provide safe code examples

### 2. Secret Scanner Utility (`lib/utils/secret-scanner.ts`)

Detects 20+ secret patterns including:
- API keys (sk-, pk-, AKIA-, etc.)
- Bearer tokens
- Passwords
- Database connection strings
- Private keys (PEM format)
- Service-specific keys (Stripe, GitHub, SendGrid, AWS)
- JWT tokens

**Usage:**

```typescript
import { scanForSecrets, formatScanResults } from '@/lib/utils/secret-scanner';

const code = `const apiKey = "sk_live_abc123";`;
const result = scanForSecrets(code);

if (result.hasSecrets) {
  console.warn(formatScanResults(result));
  // Score: 'safe' | 'suspicious' | 'dangerous'
  // Warnings: Array of detected secrets with line numbers
}
```

### 3. AI Generation Integration (`lib/services/ai-generation.ts`)

Automatically scans all generated code and returns security warnings:

```typescript
const result = await generateCode(projectId, prompt, techStack);

if (result.securityScan?.hasSecrets) {
  // Display warnings to user
  console.warn(result.securityScan.message);
}
```

### 4. Security Warning Component (`components/shared/security-warning.tsx`)

React component to display security warnings in UI:

```tsx
import { SecurityWarning } from '@/components/shared/security-warning';

<SecurityWarning scanResult={generationResult.securityScan} />
```

## Integration Example

### In a Project Generation Page:

```typescript
'use client';

import { useState } from 'react';
import { generateCode } from '@/lib/services/ai-generation';
import { SecurityWarning } from '@/components/shared/security-warning';
import { Button } from '@/components/ui/button';

export default function GenerateProjectPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generationResult = await generateCode(
        projectId,
        prompt,
        techStack
      );
      
      setResult(generationResult);
      
      // If dangerous secrets detected, show modal/alert
      if (generationResult.securityScan?.score === 'dangerous') {
        alert('⚠️ Security Issue: Please review detected secrets before continuing!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={loading}>
        Generate Project
      </Button>
      
      {result?.securityScan && (
        <SecurityWarning scanResult={result.securityScan} />
      )}
      
      {/* Display generated code */}
    </div>
  );
}
```

## Security Patterns Detected

### Critical Severity:
- Stripe live keys: `sk_live_*`
- AWS access keys: `AKIA*`
- GitHub tokens: `ghp_*`, `gho_*`, `ghs_*`
- SendGrid keys: `SG.*`
- Bearer tokens
- Passwords in code
- Database connection strings

### High Severity:
- Stripe test keys: `sk_test_*`
- Public keys with secrets: `pk_*`
- Private keys (PEM format)
- Consumer secrets

### Medium Severity:
- Generic API keys
- Generic tokens
- JWT tokens (if real)

## Best Practices

### ✅ DO:
```typescript
// Use environment variables
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('API key not configured');

// Server-side secrets (no NEXT_PUBLIC_)
const stripeSecret = process.env.STRIPE_SECRET_KEY;

// Client-side public values (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### ❌ DON'T:
```typescript
// Never hardcode secrets
const apiKey = "sk-1234567890abcdef"; // 🚨 SECURITY VIOLATION

// Never expose server secrets in client
const secret = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY; // 🚨 EXPOSED

// Never commit credentials
const dbUrl = "postgresql://user:pass@host/db"; // 🚨 CREDENTIALS LEAK
```

## Environment Variables Setup

### `.env.local` (NEVER commit):
```env
# ⚠️ Add this file to .gitignore!

# Server-side secrets (no NEXT_PUBLIC_)
OPENROUTER_API_KEY=sk_or_...
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Client-side public values (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### `.env.example` (Safe to commit):
```env
# Copy this to .env.local and fill in your values

OPENROUTER_API_KEY=your_key_here
STRIPE_SECRET_KEY=sk_test_your_key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Monitoring & Logging

Security alerts are logged to `security_alerts` table (optional):

```sql
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('safe', 'suspicious', 'dangerous')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Testing

Test the scanner with known patterns:

```typescript
import { scanForSecrets } from '@/lib/utils/secret-scanner';

// Should detect
const dangerousCode = `
  const stripeKey = "sk_live_abc123def456";
  const githubToken = "ghp_abcdefghij1234567890";
`;

const result = scanForSecrets(dangerousCode);
console.log(result.hasSecrets); // true
console.log(result.score); // 'dangerous'

// Should be safe
const safeCode = `
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing API key');
`;

const safeResult = scanForSecrets(safeCode);
console.log(safeResult.hasSecrets); // false
console.log(safeResult.score); // 'safe'
```

## Maintenance

### Adding New Patterns:

Edit `lib/utils/secret-scanner.ts` and add to `SECRET_PATTERNS` array:

```typescript
{
  regex: /your-pattern-here/gi,
  type: 'api_key',
  severity: 'critical',
  name: 'Your Service Name'
}
```

### Adding Safe Patterns:

Add to `SAFE_PATTERNS` array to prevent false positives:

```typescript
/your-safe-pattern/gi
```

## Support

For security concerns or false positives, contact: security@syncsphereofficial.com

---

**Built with security in mind by SyncSphere LLC** 🔒
