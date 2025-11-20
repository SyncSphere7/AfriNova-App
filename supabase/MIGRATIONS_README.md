# Database Migrations

This directory contains all database migrations for the AfriNova project.

## Current Status

✅ **All migrations have been applied to the current Supabase project**

Project Reference: `umvdtrmjtfmeidswwuac`

## Applied Migrations (in order)

1. ✅ `20251119221314_create_initial_schema.sql` - Initial database schema with users, projects, subscriptions
2. ✅ `20251119234321_update_subscriptions_for_multi_gateway.sql` - Multi-gateway payment support
3. ✅ `20251120001114_update_subscription_tiers_v2.sql` - Subscription tiers and limits
4. ✅ `20251120003347_create_profile_trigger_and_auth_enhancements.sql` - Profile auto-creation trigger
5. ✅ `20251120005332_add_language_preference.sql` - Language preference for i18n
6. ✅ `20251120010849_create_integrations_system.sql` - Integrations marketplace tables
7. ✅ `20251120010953_seed_integration_categories_and_core_integrations.sql` - 160+ integrations seeded
8. ✅ `20251120012451_fix_missing_foreign_key_indexes.sql` - Performance indexes
9. ✅ `20251120012518_optimize_rls_policies_performance.sql` - RLS policy optimization
10. ✅ `20251120013037_fix_function_search_path_security_correct.sql` - Function security fixes
11. ✅ `20251120023326_create_project_templates.sql` - Project templates table
12. ✅ `20251120023406_seed_project_templates.sql` - 12 templates seeded

## If You Need to Apply Migrations to a New Supabase Project

### Option 1: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of each migration file (in order)
4. Execute each migration

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push
```

### Option 3: Using Direct SQL

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"

# Run each migration file
\i supabase/migrations/20251119221314_create_initial_schema.sql
\i supabase/migrations/20251119234321_update_subscriptions_for_multi_gateway.sql
# ... continue with all migrations in order
```

## Database Schema Overview

### Core Tables
- `profiles` - User profiles with subscription and usage tracking
- `projects` - User-created projects with AI generation status
- `generations` - History of AI code generations
- `project_templates` - Pre-built project templates (12 seeded)

### Integrations
- `integration_categories` - Categories for integrations
- `integrations` - Available integrations (160+ seeded)
- `user_integrations` - User's configured integrations

### Payments
- `subscriptions` - User subscription records
- `transactions` - Payment transactions
- `invoices` - Generated invoices

### Security
All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own data
- Public data (templates, integrations) is readable by all
- Authentication required for write operations

## Creating New Migrations

When you need to make database changes:

1. **Using Supabase CLI** (recommended):
   ```bash
   supabase migration new your_migration_name
   ```

2. **Manual Creation**:
   Create a new file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`

3. **Migration Format**:
   ```sql
   /*
     # Migration Title

     1. Changes
       - Description of changes

     2. Security
       - RLS policies
   */

   -- Your SQL here
   ```

4. **Apply the Migration**:
   ```bash
   supabase db push
   ```

## Best Practices

1. **Never modify existing migrations** - Always create new ones
2. **Use transactions** - Wrap changes in BEGIN/COMMIT when possible
3. **Test locally first** - Use `supabase start` to test locally
4. **Add comments** - Explain what each migration does
5. **Enable RLS** - Always enable and configure RLS for new tables
6. **Create indexes** - Add indexes for foreign keys and frequently queried columns
7. **Use IF EXISTS/IF NOT EXISTS** - Make migrations idempotent

## Rolling Back

If you need to roll back a migration:

```sql
-- Create a new migration that reverses the changes
-- DO NOT delete or modify the original migration file
```

## Verifying Migrations

To verify all migrations are applied:

```bash
# Using Supabase CLI
supabase db remote list

# Using SQL
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

## Troubleshooting

### Migration fails with "already exists"
- Add `IF NOT EXISTS` to CREATE statements
- Check if migration was partially applied

### RLS policy conflicts
- Check existing policies with: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`
- Drop conflicting policies before creating new ones

### Permission errors
- Ensure you're using the correct database role
- Check that RLS policies allow the operation

## Need Help?

- Check Supabase docs: https://supabase.com/docs/guides/database/migrations
- Review existing migrations for examples
- Test changes locally before applying to production
