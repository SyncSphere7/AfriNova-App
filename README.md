# AfriNova - AI-Powered Application Generator

AfriNova is a production-ready SaaS platform that generates complete, deployable applications using AI. Users describe what they want to build, select their tech stack, and receive fully functional code ready for deployment.

## Features

### 🤖 AI Code Generation
- Powered by OpenRouter (Claude 3.5 Sonnet)
- Generates production-ready code from natural language descriptions
- Supports multiple tech stacks and frameworks
- Real-time progress tracking during generation
- Download generated code as organized ZIP files

### 📦 Project Templates
- 12 pre-built templates across multiple categories:
  - E-commerce, SaaS, Content Management
  - Productivity, Social Media, Education
  - Business, Real Estate, Health & Fitness
- Each template includes pre-configured tech stack and detailed prompts
- Filter by category, complexity, and popularity
- One-click template selection

### 🔌 Integrations Marketplace
- 160+ pre-configured integrations
- Categories: Payments, Analytics, Communication, Development, Marketing, etc.
- Detailed documentation and setup guides
- OAuth and API key configuration support
- Integration status tracking

### 💳 Payment Processing
- Multi-gateway support (Pesapal, Stripe, PayPal)
- Subscription management
- Usage-based billing
- Transaction history
- Webhook handling for payment events

### 👤 User Management
- Email/password authentication via Supabase
- User profiles with avatar support
- Password reset functionality
- Protected routes and middleware
- Row-level security (RLS) for data access

### 🎨 Modern UI/UX
- Clean, professional design
- Pixel-art inspired aesthetic
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Loading states and error handling
- Toast notifications

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions
- **ORM**: Supabase Client

### External Services
- **AI**: OpenRouter (Claude 3.5 Sonnet)
- **Email**: Resend
- **Payments**: Pesapal, Stripe, PayPal
- **Deployment**: Vercel

## Project Structure

```
afrinova/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/                # Protected dashboard
│   │   ├── integrations/         # Integrations marketplace
│   │   ├── new/                  # Create new project
│   │   ├── projects/             # Projects list and detail
│   │   ├── settings/             # User settings
│   │   └── templates/            # Project templates
│   ├── api/                      # API routes
│   └── pricing/                  # Pricing page
├── components/                   # React components
│   ├── auth/                     # Auth components
│   ├── dashboard/                # Dashboard components
│   ├── payments/                 # Payment components
│   ├── projects/                 # Project components
│   ├── shared/                   # Shared components
│   └── ui/                       # UI components (shadcn)
├── lib/                          # Utility libraries
│   ├── i18n/                     # Internationalization
│   ├── openrouter/               # OpenRouter client
│   ├── services/                 # Business logic
│   ├── supabase/                 # Supabase clients
│   └── utils/                    # Utility functions
├── supabase/
│   ├── functions/                # Edge functions
│   │   ├── generate-code/
│   │   ├── pesapal-checkout/
│   │   ├── pesapal-webhook/
│   │   └── send-email/
│   └── migrations/               # Database migrations
├── types/                        # TypeScript types
└── public/                       # Static assets
```

## Database Schema

### Core Tables
- `profiles` - User profiles with subscription info
- `projects` - User-created projects
- `generations` - AI generation history
- `project_templates` - Pre-built templates
- `integrations` - Available integrations
- `integration_categories` - Integration categories
- `user_integrations` - User's configured integrations

### Payment Tables
- `subscriptions` - User subscriptions
- `transactions` - Payment transactions
- `invoices` - Generated invoices

All tables have Row Level Security (RLS) policies for data protection.

## Getting Started

### Quick Start

See [QUICK_START.md](./QUICK_START.md) for the fastest way to get up and running.

### Detailed Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/afrinova.git
   cd afrinova
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values (see DEPLOYMENT_GUIDE.md for details)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to http://localhost:3000

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENROUTER_API_KEY` - OpenRouter API key for AI generation
- `RESEND_API_KEY` - Resend API key for emails
- `PESAPAL_CONSUMER_KEY` - Pesapal consumer key
- `PESAPAL_CONSUMER_SECRET` - Pesapal consumer secret
- `PESAPAL_ENVIRONMENT` - `sandbox` or `live`

See `.env.example` for complete list.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Supabase Setup

Your Supabase project includes:
- Database with all tables and RLS policies
- Edge Functions for serverless operations
- Authentication configuration
- Storage for user uploads

Migrations are in `supabase/migrations/` and can be applied via Supabase CLI or Dashboard.

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Modular, reusable components
- Clear separation of concerns

### Adding New Features

1. Create components in `components/`
2. Add pages in `app/`
3. Business logic in `lib/services/`
4. Database changes via migrations in `supabase/migrations/`
5. Types in `types/`

## API Documentation

### Edge Functions

#### `generate-code`
Generates code using AI based on project requirements.
- **Method**: POST
- **Auth**: Required
- **Body**: `{ projectId, prompt, techStack }`
- **Response**: `{ success, code, tokensUsed, model }`

#### `send-email`
Sends transactional emails using Resend.
- **Method**: POST
- **Auth**: Required
- **Body**: `{ to, subject, html }`

#### `pesapal-checkout`
Creates a Pesapal payment checkout session.
- **Method**: POST
- **Auth**: Required
- **Body**: `{ amount, description, currency }`

#### `pesapal-webhook`
Handles Pesapal payment webhooks.
- **Method**: POST
- **Auth**: No (verified via signature)

## Security

### Authentication
- Supabase Auth for secure user management
- JWT-based session handling
- Password hashing and secure storage
- Email verification support

### Database Security
- Row Level Security (RLS) on all tables
- User can only access their own data
- Authenticated user checks in all policies
- Service role key only used in Edge Functions

### API Security
- All Edge Functions require authentication
- CORS headers properly configured
- Input validation and sanitization
- Rate limiting (via Supabase)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Review [QUICK_START.md](./QUICK_START.md)
- Open an issue on GitHub

## Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] Team workspaces
- [ ] Version control for projects
- [ ] Code editor integration
- [ ] One-click deployment
- [ ] Custom domain support
- [ ] API access for developers
- [ ] Mobile app

## Current Status

✅ **Production Ready**

All core features are implemented and tested:
- Authentication system
- AI code generation
- Project templates
- Integrations marketplace
- Payment processing
- User dashboard
- Email notifications

---

Built with ❤️ using Next.js, TypeScript, Supabase, and AI
