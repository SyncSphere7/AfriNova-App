# 🔌 AfriNova API - Pricing & Documentation

**Generate production-ready code programmatically with AfriNova's powerful AI API**

---

## 🎯 Overview

AfriNova API allows developers to integrate our multi-agent code generation system directly into their applications, CI/CD pipelines, or custom tools. No model management, no infrastructure costs—just clean, production-ready code on demand.

**Key Benefits:**
- ✅ **10 Specialized AI Agents** - Frontend, Backend, Database, Security, Testing, DevOps, and more
- ✅ **No Infrastructure Costs** - We handle all AI model hosting and optimization
- ✅ **Production-Ready Code** - Not just snippets, complete applications with tests
- ✅ **Multi-Language Support** - English, French, Swahili, Arabic, Portuguese
- ✅ **Africa-Optimized** - Built-in support for Pesapal, M-Pesa, African payments
- ✅ **160+ Integrations** - Pre-configured templates for popular services

---

## 💰 Pricing Models

### **Option 1: Credit-Based Pricing** (Recommended for Most Users)

Simple, predictable pricing based on what you generate:

| **Tier** | **Monthly Price** | **Credits Included** | **Cost per Credit** | **Overage Rate** |
|----------|-------------------|----------------------|---------------------|------------------|
| 🆓 **Free** | $0/month | 100 credits | Free | $0.10/credit |
| 🚀 **Starter** | $29/month | 1,000 credits | $0.029 | $0.04/credit |
| 📈 **Growth** | $79/month | 5,000 credits | $0.016 | $0.025/credit |
| 💎 **Pro** | $199/month | 20,000 credits | $0.010 | $0.015/credit |
| 🏢 **Enterprise** | Custom | Custom credits | Custom | Custom |

**What 1 Credit Generates:**

| **Project Size** | **Credits** | **Lines of Code** | **Example** |
|------------------|-------------|-------------------|-------------|
| Simple component | 1 credit | ~50 lines | Button, Card, Input form |
| Page component | 10 credits | ~500 lines | Dashboard page, Landing page |
| Full feature | 50 credits | ~2,500 lines | Auth system, Payment flow |
| Complete project | 200 credits | ~10,000 lines | Full-stack e-commerce app |

**Best For:**
- ✅ Non-technical users who want simple pricing
- ✅ Agencies building apps for clients
- ✅ Predictable monthly costs
- ✅ No surprises on your bill

---

### **Option 2: Pay-As-You-Go** (For Technical Users)

Flexible usage-based pricing with no monthly commitment:

| **Purchase Amount** | **Credit Amount** | **Bonus** | **Effective Rate** |
|---------------------|-------------------|-----------|-------------------|
| $10 | $10 | - | Standard |
| $50 | $55 | 10% bonus | 10% discount |
| $100 | $120 | 20% bonus | 20% discount |
| $500 | $650 | 30% bonus | 30% discount |
| $1,000+ | Custom | 35%+ bonus | 35%+ discount |

**Pricing Structure:**
- **Simple Components:** $0.10 per component
- **Page Components:** $1.00 per page
- **Full Features:** $5.00 per feature
- **Complete Projects:** $20.00 per project

**Credits Never Expire!**

**Best For:**
- ✅ Developers who want control over costs
- ✅ Irregular usage patterns
- ✅ Testing and experimentation
- ✅ High-volume users (30%+ discounts)

---

## 🎁 What's Included in All Plans

### **Core Features**
- ✅ 10 specialized AI agents (Frontend, Backend, Database, Security, Testing, etc.)
- ✅ Production-ready code with TypeScript support
- ✅ Automatic testing and security audits
- ✅ 160+ pre-configured integrations
- ✅ Multi-language support (5+ languages)
- ✅ Retro Windows 95 aesthetic (optional)

### **Payment Gateway Support**
- ✅ Pesapal (M-Pesa, Airtel Money, Tigo Pesa)
- ✅ Stripe (cards, Apple Pay, Google Pay)
- ✅ PayPal (international)
- ✅ Flutterwave, Paystack, Square, M-Pesa Direct

### **Mobile App Generation**
- ✅ React Native (Expo/CLI)
- ✅ Flutter
- ✅ Ionic
- ✅ Native device features (camera, GPS, push notifications)

### **Support**
- 🆓 Free: Community support (Discord, GitHub)
- 🚀 Starter: Email support (24-48hr response)
- 📈 Growth: Priority email (12hr response)
- 💎 Pro: 24/7 support with dedicated Slack channel
- 🏢 Enterprise: Dedicated account manager + SLA

---

## 🚀 Getting Started

### Step 1: Get Your API Key

1. Log in to [AfriNova Dashboard](https://afrinova.vercel.app/dashboard)
2. Navigate to **Settings → API Keys**
3. Click **"Generate New API Key"**
4. Copy your key (starts with `afn_`)
5. Store securely (never commit to git!)

### Step 2: Make Your First API Call

```bash
curl -X POST https://afrinova.vercel.app/api/v1/generate \
  -H "Authorization: Bearer afn_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React login form with email validation",
    "type": "component",
    "framework": "react",
    "language": "en"
  }'
```

**Response:**
```json
{
  "success": true,
  "credits_used": 1,
  "remaining_credits": 999,
  "generation": {
    "files": [
      {
        "path": "components/LoginForm.tsx",
        "content": "// Generated code here..."
      }
    ],
    "tests": [
      {
        "path": "components/__tests__/LoginForm.test.tsx",
        "content": "// Generated tests here..."
      }
    ]
  },
  "metadata": {
    "lines_of_code": 45,
    "generation_time_ms": 2341,
    "agents_used": ["FRONTEND", "TESTING"]
  }
}
```

---

## 📚 API Reference

### Base URL
```
https://afrinova.vercel.app/api/v1
```

### Authentication
All API requests require a Bearer token:
```
Authorization: Bearer afn_your_api_key_here
```

---

### **POST /api/v1/generate**

Generate code from a text description.

**Headers:**
```
Authorization: Bearer afn_your_api_key_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "string (required) - Description of what to build",
  "type": "component | page | feature | project (required)",
  "framework": "react | vue | angular | next | react-native | flutter (optional)",
  "techStack": {
    "frontend": "React",
    "backend": "Node.js (Express)",
    "database": "PostgreSQL",
    "styling": "Tailwind CSS",
    "payments": ["Pesapal", "Stripe"],
    "integrations": ["Google Analytics", "SendGrid"]
  },
  "language": "en | fr | sw | ar | pt (optional, default: en)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "credits_used": 10,
  "remaining_credits": 990,
  "generation": {
    "files": [
      {"path": "string", "content": "string"}
    ],
    "tests": [
      {"path": "string", "content": "string"}
    ]
  },
  "metadata": {
    "lines_of_code": 500,
    "generation_time_ms": 3500,
    "agents_used": ["FRONTEND", "BACKEND", "TESTING"],
    "security_scan": {
      "passed": true,
      "warnings": []
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "insufficient_credits | invalid_api_key | rate_limit_exceeded",
    "message": "string",
    "details": {}
  }
}
```

---

### **GET /api/v1/usage**

Get your current API usage statistics.

**Response:**
```json
{
  "success": true,
  "usage": {
    "credits_remaining": 850,
    "credits_used_this_month": 150,
    "plan": "starter",
    "billing_cycle_resets": "2025-12-01T00:00:00Z",
    "overage_credits": 0,
    "total_generations": 45
  },
  "rate_limits": {
    "requests_per_minute": 30,
    "requests_this_minute": 5
  }
}
```

---

### **GET /api/v1/keys**

List all your API keys.

**Response:**
```json
{
  "success": true,
  "keys": [
    {
      "id": "key_abc123",
      "name": "Production Key",
      "prefix": "afn_abc...",
      "created_at": "2025-01-15T10:30:00Z",
      "last_used": "2025-01-20T14:22:00Z",
      "status": "active"
    }
  ]
}
```

---

### **DELETE /api/v1/keys/:keyId**

Revoke an API key.

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## 🔒 Security Best Practices

### **Protect Your API Keys**
```bash
# ✅ DO: Store in environment variables
export AFRINOVA_API_KEY="afn_your_key_here"

# ❌ DON'T: Hardcode in your code
const apiKey = "afn_abc123def456"; // 🚨 NEVER DO THIS
```

### **Use Separate Keys**
- **Development:** Use a test key with low limits
- **Staging:** Separate key for staging environment
- **Production:** High-limit key with monitoring

### **Rotate Keys Regularly**
- Rotate keys every 90 days
- Revoke old keys after rotation
- Monitor for suspicious activity

### **Rate Limiting**
- **Free:** 10 requests/minute
- **Starter:** 30 requests/minute
- **Growth:** 100 requests/minute
- **Pro:** 500 requests/minute
- **Enterprise:** Custom limits

---

## 📊 Usage Examples

### Example 1: Generate a React Component

```python
import requests

API_KEY = "afn_your_key_here"
API_URL = "https://afrinova.vercel.app/api/v1/generate"

response = requests.post(
    API_URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "prompt": "Create a product card component with image, title, price, and add to cart button",
        "type": "component",
        "framework": "react",
        "language": "en"
    }
)

if response.status_code == 200:
    data = response.json()
    print(f"✅ Generated {data['metadata']['lines_of_code']} lines")
    print(f"💰 Credits used: {data['credits_used']}")
    
    # Save generated code
    for file in data['generation']['files']:
        with open(file['path'], 'w') as f:
            f.write(file['content'])
else:
    print(f"❌ Error: {response.json()['error']['message']}")
```

---

### Example 2: Generate Full-Stack Feature with M-Pesa

```javascript
const axios = require('axios');

const API_KEY = process.env.AFRINOVA_API_KEY;
const API_URL = 'https://afrinova.vercel.app/api/v1/generate';

async function generateMpesaCheckout() {
  try {
    const response = await axios.post(
      API_URL,
      {
        prompt: 'Create a complete M-Pesa checkout flow for an e-commerce store',
        type: 'feature',
        techStack: {
          frontend: 'React',
          backend: 'Node.js (Express)',
          payments: ['Pesapal'],
          database: 'PostgreSQL'
        },
        language: 'en'
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Generated in ${response.data.metadata.generation_time_ms}ms`);
    console.log(`💰 Credits used: ${response.data.credits_used}`);
    console.log(`🔒 Security scan: ${response.data.metadata.security_scan.passed ? 'PASSED' : 'FAILED'}`);

    return response.data.generation;
  } catch (error) {
    console.error('❌ Generation failed:', error.response?.data || error.message);
  }
}

generateMpesaCheckout();
```

---

## 💡 Frequently Asked Questions

### **Do I need to know which AI models you use?**
No! We handle all AI infrastructure, model selection, and optimization. You just describe what you want, and we generate it using our 10-agent system.

### **Can I switch between credit-based and pay-as-you-go?**
Yes! You can purchase pay-as-you-go credits anytime. If you have a subscription, those credits are used first.

### **What happens if I run out of credits?**
- **Subscription plans:** You'll be charged overage rates (see pricing table)
- **Pay-as-you-go:** API calls will fail with `insufficient_credits` error

### **Do credits expire?**
- **Subscription credits:** Reset monthly
- **Pay-as-you-go credits:** Never expire!

### **Can I generate mobile apps via API?**
Yes! Set `framework: "react-native"`, `"flutter"`, or `"ionic"` in your request.

### **Is generated code production-ready?**
Yes! All code includes:
- ✅ TypeScript types
- ✅ Unit tests
- ✅ Security best practices
- ✅ Error handling
- ✅ Accessibility (WCAG 2.1 AA)

### **Can I request specific payment gateways?**
Yes! Specify in `techStack.payments`: `["Pesapal", "Stripe", "PayPal", "Flutterwave", "M-Pesa", "Paystack", "Square"]`

### **Do you store generated code?**
No. Generated code is returned in the API response and not stored on our servers.

---

## 🎯 Competitive Pricing

AfriNova API beats competitors on both price and features:

| **Feature** | **AfriNova** | **Competitor A** | **Competitor B** |
|-------------|--------------|------------------|------------------|
| **Price (Starter)** | $29/month | $40/month | $50/month |
| **Credits** | 1,000 credits | 500 credits | 750 credits |
| **Multi-Agent System** | ✅ 10 agents | ❌ Single model | ❌ Single model |
| **African Payments** | ✅ Pesapal, M-Pesa | ❌ | ❌ |
| **Mobile Apps** | ✅ React Native, Flutter | ❌ | ✅ React Native only |
| **Testing Included** | ✅ Unit + E2E tests | ❌ | ✅ Unit tests only |
| **Security Audit** | ✅ Automatic | ❌ | ❌ |
| **Credits Expire?** | ❌ Never (pay-as-you-go) | ✅ Monthly | ✅ Monthly |

---

## 📞 Support

### **Technical Support**
- 📧 Email: api@afrinova.com
- 💬 Discord: [AfriNova Community](https://discord.gg/afrinova)
- 📖 Docs: [API Documentation](https://afrinova.vercel.app/docs/api)

### **Enterprise Sales**
- 📧 Email: business@afrinova.com
- 📅 Schedule a call: [Book Demo](https://calendly.com/afrinova)

### **Billing Questions**
- 📧 Email: billing@afrinova.com

---

## 🚀 Ready to Get Started?

1. [Sign up for free](https://afrinova.vercel.app/auth/signup)
2. [Generate your first API key](https://afrinova.vercel.app/dashboard/settings/api)
3. [Read the full API docs](https://afrinova.vercel.app/docs/api)
4. [Join our Discord community](https://discord.gg/afrinova)

**Questions?** Email us at hello@afrinova.com

---

<div align="center">

**A Product of [SyncSphere LLC](https://www.syncsphereofficial.com/)**

© 2025 SyncSphere LLC. All rights reserved.

</div>
