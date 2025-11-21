# Monitoring & Alert System Guide

## Overview

AfriNova now has a comprehensive monitoring and alert system that tracks errors, performance, and system health. This guide explains how everything works and how to configure it.

## 🎯 What We Built

### 1. **Error Tracking** (`lib/services/error-tracking.ts`)
- Centralized error logging to database
- Optional Sentry integration (production-ready)
- API error logging with full context
- Error statistics and analytics
- Automatic cleanup of old logs (30 days)

### 2. **Performance Monitoring** (`lib/services/performance-monitoring.ts`)
- Track API response times
- Monitor database query performance
- Track AI generation durations
- Performance statistics (avg, P50, P95, P99)
- Identify slowest routes

### 3. **Alert System** (`lib/services/alert-system.ts`)
- Monitor critical system issues
- Email, Slack, and Discord notifications
- Configurable alert rules
- Cooldown periods to prevent spam
- Auto-resolution tracking

### 4. **Health Checks** (`/api/health`)
- Monitor all critical services
- Check database connectivity
- Verify service configurations
- Response time tracking

## 📊 Database Tables

### `error_logs`
Stores all application errors with full context.

**Columns:**
- `id` - Unique identifier
- `error_type` - Type of error (e.g., "ValidationError", "DatabaseError")
- `error_message` - Error message
- `error_stack` - Stack trace
- `user_id` - User who encountered the error
- `route` - API route where error occurred
- `method` - HTTP method (GET, POST, etc.)
- `status_code` - HTTP status code
- `request_body` - Request payload (JSONB)
- `user_agent` - Browser/client info
- `ip_address` - Client IP
- `metadata` - Additional context (JSONB)
- `created_at` - Timestamp

### `performance_metrics`
Tracks operation durations and performance data.

**Columns:**
- `id` - Unique identifier
- `metric_type` - Type: `api_response`, `database_query`, `generation`, `external_api`
- `route` - API route or operation
- `method` - HTTP method
- `duration_ms` - Duration in milliseconds
- `status_code` - HTTP status code
- `user_id` - User who made the request
- `metadata` - Additional context (JSONB)
- `created_at` - Timestamp

### `alerts`
Stores system alerts for critical issues.

**Columns:**
- `id` - Unique identifier
- `alert_type` - Type: `error_rate`, `critical_error`, `slow_response`, `service_down`, `custom`
- `severity` - Severity: `critical`, `warning`, `info`
- `title` - Alert title
- `message` - Alert message
- `metadata` - Additional context (JSONB)
- `resolved` - Whether alert is resolved
- `resolved_at` - When alert was resolved
- `created_at` - Timestamp

### `alert_rules`
Defines when alerts should be triggered.

**Columns:**
- `id` - Unique identifier
- `name` - Rule name
- `alert_type` - Type of alert to trigger
- `severity` - Alert severity
- `enabled` - Whether rule is active
- `conditions` - Threshold and comparison logic (JSONB)
- `channels` - Notification channels: `email`, `slack`, `discord`
- `recipients` - Email addresses to notify
- `cooldown_minutes` - Minimum time between alerts
- `created_at` - Timestamp
- `updated_at` - Last update timestamp

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Error Tracking (Optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Cron Job Authentication
CRON_SECRET=your_secret_here

# Alert Notifications
ADMIN_EMAIL=admin@afrinova.com

# Slack Integration (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Discord Integration (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```

### Default Alert Rules

The system comes with 4 pre-configured alert rules:

1. **High Error Rate**
   - Triggers when error rate exceeds 10% in 15 minutes
   - Severity: Critical
   - Cooldown: 30 minutes

2. **Critical Error Detected**
   - Triggers on any 500-level error
   - Severity: Critical
   - Cooldown: 15 minutes

3. **Slow API Responses**
   - Triggers when P95 response time exceeds 3 seconds
   - Severity: Warning
   - Cooldown: 60 minutes

4. **Service Down**
   - Triggers when service is unreachable
   - Severity: Critical
   - Cooldown: 10 minutes

## 🚀 API Endpoints

### Health Check
```bash
GET /api/health
```

Returns system health status:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:00:00Z",
  "services": {
    "database": { "status": "healthy", "responseTime": "45ms" },
    "email": { "status": "healthy", "configured": true },
    "payments": {
      "pesapal": { "status": "healthy", "configured": true },
      "stripe": { "status": "not_configured" },
      "paypal": { "status": "not_configured" }
    },
    "ai": { "status": "healthy", "configured": true },
    "monitoring": { "status": "healthy", "errorLogging": true }
  },
  "version": "1.0.0",
  "environment": "production",
  "responseTime": "52ms"
}
```

### System Stats
```bash
GET /api/admin/stats
Authorization: Bearer <token>
```

Returns system-wide statistics:
```json
{
  "overview": {
    "totalUsers": 150,
    "totalProjects": 450,
    "activeSubscriptions": 75,
    "activeApiKeys": 120,
    "generationsThisMonth": 1234,
    "estimatedMRR": 2625
  },
  "errors": {
    "totalErrors": 12,
    "errorRate": 2.5,
    "errorsByType": { "400": 8, "500": 4 },
    "topErrors": [...]
  },
  "recentActivity": [...],
  "topUsers": [...]
}
```

### Alerts Management
```bash
# Get alerts
GET /api/admin/alerts?resolved=false&severity=critical&limit=50
Authorization: Bearer <token>

# Create custom alert
POST /api/admin/alerts
Authorization: Bearer <token>
{
  "title": "Manual Alert",
  "message": "Something needs attention",
  "severity": "warning",
  "metadata": { "custom": "data" }
}

# Resolve alert
PATCH /api/admin/alerts
Authorization: Bearer <token>
{
  "alertId": "uuid"
}
```

### Alert Rules Management
```bash
# Get all rules
GET /api/admin/alert-rules
Authorization: Bearer <token>

# Create rule
POST /api/admin/alert-rules
Authorization: Bearer <token>
{
  "name": "Custom Rule",
  "alert_type": "custom",
  "severity": "warning",
  "enabled": true,
  "conditions": {
    "threshold": 10,
    "timeWindowMinutes": 15,
    "comparison": "greater_than"
  },
  "channels": ["email", "slack"],
  "recipients": ["admin@afrinova.com"],
  "cooldown_minutes": 30
}

# Update rule
PATCH /api/admin/alert-rules
Authorization: Bearer <token>
{
  "ruleId": "uuid",
  "updates": { "enabled": false }
}

# Delete rule
DELETE /api/admin/alert-rules
Authorization: Bearer <token>
{
  "ruleId": "uuid"
}
```

## 💻 Usage in Code

### Track Errors
```typescript
import { logError, logApiError, createErrorResponse } from '@/lib/services/error-tracking';

// Simple error logging
try {
  // risky operation
} catch (error) {
  await logError(error, {
    userId: user.id,
    route: '/api/subscribe',
    action: 'create_subscription',
  });
}

// API error logging with full context
try {
  // API operation
} catch (error) {
  await logApiError(error, request, user.id);
}

// Create error response with automatic logging
catch (error) {
  return await createErrorResponse(error, request, 500, user.id);
}
```

### Track Performance
```typescript
import { PerformanceTracker, createPerformanceMiddleware } from '@/lib/services/performance-monitoring';

// Using middleware (recommended)
export async function POST(request: Request) {
  const perf = createPerformanceMiddleware('/api/subscribe');
  const tracker = perf.start('POST');
  
  try {
    // Your API logic
    
    await tracker.end(200, { metadata: 'optional' });
    return NextResponse.json({ success: true });
  } catch (error) {
    await tracker.end(500);
    throw error;
  }
}

// Manual tracking
const tracker = new PerformanceTracker('api_response', {
  route: '/api/subscribe',
  method: 'POST',
  userId: user.id,
});

// Do work...

await tracker.end(200);
```

### Create Custom Alerts
```typescript
import { createAlert } from '@/lib/services/alert-system';

await createAlert({
  alert_type: 'custom',
  severity: 'warning',
  title: 'Unusual Activity Detected',
  message: `User ${user.id} created 50 projects in 1 hour`,
  metadata: {
    userId: user.id,
    projectCount: 50,
    timeWindow: '1 hour',
  },
  resolved: false,
});
```

## ⏰ Automated Monitoring

### Cron Jobs

Three cron jobs run automatically:

1. **Process Emails** - Every 10 minutes
   ```
   POST /api/cron/process-emails
   ```

2. **Check Trial Endings** - Daily at 10 AM
   ```
   POST /api/cron/check-trial-endings
   ```

3. **Check System Health** - Every 15 minutes (NEW)
   ```
   POST /api/cron/check-system-health
   ```

Configured in `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/process-emails", "schedule": "*/10 * * * *" },
    { "path": "/api/cron/check-trial-endings", "schedule": "0 10 * * *" },
    { "path": "/api/cron/check-system-health", "schedule": "*/15 * * * *" }
  ]
}
```

### What Gets Monitored Automatically

Every 15 minutes, the system checks:

✅ **Error Rate** - Triggers if error rate > 10% in last 15 minutes
✅ **Critical Errors** - Triggers if any 500-level errors occur
✅ **Slow Responses** - Triggers if P95 response time > 3 seconds
✅ **Service Health** - Monitors database, email, payments, AI services

## 📧 Alert Notifications

### Email Alerts
- Beautiful HTML emails with severity color coding
- Includes error details and metadata
- Links to monitoring dashboard
- Sent to configured admin emails

### Slack Alerts
- Rich message formatting
- Color-coded by severity
- Includes all alert details
- Requires `SLACK_WEBHOOK_URL` environment variable

### Discord Alerts
- Embedded messages with color coding
- All alert details included
- Timestamp tracking
- Requires `DISCORD_WEBHOOK_URL` environment variable

## 🧹 Automatic Cleanup

The system automatically cleans up old data:

- **Error Logs**: Deleted after 30 days
- **Performance Metrics**: Deleted after 30 days
- **Email Queue**: Deleted after 30 days

Cleanup runs daily at 2 AM via the email processing cron job.

## 🔍 Querying Data

### Get Error Statistics
```typescript
import { getErrorStats } from '@/lib/services/error-tracking';

const stats = await getErrorStats(7); // Last 7 days
// Returns: totalErrors, errorRate, errorsByType, errorsByRoute, topErrors
```

### Get Performance Statistics
```typescript
import { getPerformanceStats } from '@/lib/services/performance-monitoring';

const stats = await getPerformanceStats(7); // Last 7 days
// Returns: avgResponseTime, p50, p95, p99, slowestRoutes, totalRequests, errorRate
```

### Get Recent Errors
```typescript
import { getRecentErrors } from '@/lib/services/error-tracking';

const errors = await getRecentErrors(50, {
  userId: 'user-id',
  route: '/api/subscribe',
  errorType: 'ValidationError',
});
```

### Get Slow Operations
```typescript
import { getSlowOperations } from '@/lib/services/performance-monitoring';

const slowOps = await getSlowOperations(50, 1000); // Operations > 1s
```

## 🎨 Next Steps

To complete the monitoring system, you should:

1. **Build Admin Monitoring Dashboard** (`/admin/monitoring`)
   - Display error logs with filtering
   - Show performance charts
   - List active alerts
   - System health overview
   - Real-time metrics

2. **Set Up Sentry** (Optional but recommended)
   - Sign up at https://sentry.io
   - Get DSN from project settings
   - Add `NEXT_PUBLIC_SENTRY_DSN` to environment
   - Automatic error tracking in production

3. **Configure Slack/Discord** (Optional)
   - Create incoming webhook in Slack/Discord
   - Add webhook URL to environment variables
   - Test with custom alert

4. **Add Admin Role**
   - Add `role` column to `profiles` table
   - Uncomment admin checks in RLS policies
   - Protect monitoring endpoints

## 🔐 Security Notes

- All monitoring endpoints require authentication
- Error logs contain sensitive data (request bodies, IPs)
- Use RLS policies to restrict access
- Consider adding admin role checks
- Rotate `CRON_SECRET` regularly
- Don't expose Sentry DSN publicly (it's client-side safe but limited)

## 📊 Metrics Overview

### Error Tracking
- ✅ Logs all errors to database
- ✅ Captures full context (user, route, request, stack trace)
- ✅ Optional Sentry integration
- ✅ Error analytics and statistics
- ✅ Automatic cleanup

### Performance Monitoring
- ✅ Tracks API response times
- ✅ Monitors database queries
- ✅ Tracks AI generation durations
- ✅ Calculates percentiles (P50, P95, P99)
- ✅ Identifies slowest routes

### Alert System
- ✅ Monitors error rates
- ✅ Detects critical errors
- ✅ Tracks slow responses
- ✅ Multi-channel notifications (email, Slack, Discord)
- ✅ Configurable rules and thresholds
- ✅ Cooldown periods
- ✅ Auto-resolution tracking

### Health Checks
- ✅ Database connectivity
- ✅ Service configurations
- ✅ Response time tracking
- ✅ Multiple service categories

## 🎯 Success Criteria

- [x] Error tracking service implemented
- [x] Performance monitoring service implemented
- [x] Alert system with notifications
- [x] Health check endpoint
- [x] System stats API
- [x] Database migrations
- [x] Cron jobs configured
- [x] API endpoints for management
- [ ] Admin monitoring dashboard UI (next step)

## 📝 Summary

You now have a production-ready monitoring and alert system that:

1. **Tracks all errors** with full context
2. **Monitors performance** across all API routes
3. **Sends alerts** when critical issues occur
4. **Provides health checks** for uptime monitoring
5. **Automatically cleans up** old data
6. **Supports multiple notification channels**
7. **Offers detailed analytics** via API

The system is ready to use immediately. Just add the environment variables and you're good to go!
