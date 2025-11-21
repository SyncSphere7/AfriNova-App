import { createClient } from '@/lib/supabase/server';
import { sendEmail } from './email-sender';
import { getErrorStats } from './error-tracking';
import { getPerformanceStats } from './performance-monitoring';

/**
 * Alert System
 * 
 * Monitors system health and sends alerts for critical issues:
 * - High error rates
 * - Critical errors (500s, database failures)
 * - Slow response times
 * - Service outages
 */

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'error_rate' | 'critical_error' | 'slow_response' | 'service_down' | 'custom';
export type AlertChannel = 'email' | 'slack' | 'discord';

export interface Alert {
  id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolved_at?: string;
  created_at?: string;
}

export interface AlertRule {
  id?: string;
  name: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  enabled: boolean;
  conditions: {
    threshold?: number;
    timeWindowMinutes?: number;
    comparison?: 'greater_than' | 'less_than' | 'equals';
  };
  channels: AlertChannel[];
  recipients?: string[]; // Email addresses
  cooldown_minutes?: number; // Minimum time between alerts
  created_at?: string;
  updated_at?: string;
}

/**
 * Default alert rules
 */
const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'High Error Rate',
    alert_type: 'error_rate',
    severity: 'critical',
    enabled: true,
    conditions: {
      threshold: 10, // 10% error rate
      timeWindowMinutes: 15,
      comparison: 'greater_than',
    },
    channels: ['email'],
    cooldown_minutes: 30,
  },
  {
    name: 'Critical Error Detected',
    alert_type: 'critical_error',
    severity: 'critical',
    enabled: true,
    conditions: {
      threshold: 1, // Any critical error
      timeWindowMinutes: 5,
      comparison: 'greater_than',
    },
    channels: ['email'],
    cooldown_minutes: 15,
  },
  {
    name: 'Slow API Responses',
    alert_type: 'slow_response',
    severity: 'warning',
    enabled: true,
    conditions: {
      threshold: 3000, // 3 seconds
      timeWindowMinutes: 15,
      comparison: 'greater_than',
    },
    channels: ['email'],
    cooldown_minutes: 60,
  },
  {
    name: 'Service Down',
    alert_type: 'service_down',
    severity: 'critical',
    enabled: true,
    conditions: {
      threshold: 1,
      timeWindowMinutes: 5,
      comparison: 'greater_than',
    },
    channels: ['email'],
    cooldown_minutes: 10,
  },
];

/**
 * Create an alert
 */
export async function createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        metadata: alert.metadata,
        resolved: alert.resolved,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create alert:', error);
      return null;
    }

    // Send notifications
    await sendAlertNotifications(data);

    return data;
  } catch (error) {
    console.error('Create alert error:', error);
    return null;
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      console.error('Failed to resolve alert:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resolve alert error:', error);
    return false;
  }
}

/**
 * Get recent unresolved alerts
 */
export async function getUnresolvedAlerts(limit: number = 50): Promise<Alert[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get unresolved alerts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get unresolved alerts error:', error);
    return [];
  }
}

/**
 * Check if an alert should be sent based on cooldown period
 */
async function shouldSendAlert(
  alertType: AlertType,
  cooldownMinutes: number
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - cooldownMinutes);

    const { data, error } = await supabase
      .from('alerts')
      .select('id')
      .eq('alert_type', alertType)
      .gte('created_at', cutoffTime.toISOString())
      .limit(1);

    if (error) {
      console.error('Failed to check alert cooldown:', error);
      return true; // Allow alert on error
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Should send alert error:', error);
    return true;
  }
}

/**
 * Send alert notifications through configured channels
 */
async function sendAlertNotifications(alert: Alert): Promise<void> {
  try {
    const supabase = await createClient();

    // Get alert rules for this alert type
    const { data: rules, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('alert_type', alert.alert_type)
      .eq('enabled', true);

    if (error || !rules || rules.length === 0) {
      console.log('No alert rules found for', alert.alert_type);
      return;
    }

    for (const rule of rules) {
      // Send to each configured channel
      if (rule.channels.includes('email')) {
        await sendEmailAlert(alert, rule.recipients);
      }
      if (rule.channels.includes('slack')) {
        await sendSlackAlert(alert);
      }
      if (rule.channels.includes('discord')) {
        await sendDiscordAlert(alert);
      }
    }
  } catch (error) {
    console.error('Failed to send alert notifications:', error);
  }
}

/**
 * Send alert via email
 */
async function sendEmailAlert(alert: Alert, recipients?: string[]): Promise<void> {
  try {
    const adminEmails = recipients || [process.env.ADMIN_EMAIL || 'admin@afrinova.com'];

    const severityColors = {
      critical: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${severityColors[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .critical { background: #fef2f2; color: #991b1b; }
            .warning { background: #fffbeb; color: #92400e; }
            .info { background: #eff6ff; color: #1e40af; }
            .metadata { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
            .metadata-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .metadata-item:last-child { border-bottom: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🚨 System Alert</h1>
            </div>
            <div class="content">
              <div style="margin-bottom: 15px;">
                <span class="badge ${alert.severity}">${alert.severity}</span>
                <span style="margin-left: 10px; color: #6b7280;">${alert.alert_type.replace('_', ' ').toUpperCase()}</span>
              </div>
              
              <h2 style="margin: 15px 0; color: #111827;">${alert.title}</h2>
              <p style="color: #4b5563; margin: 10px 0;">${alert.message}</p>
              
              ${alert.metadata ? `
                <div class="metadata">
                  <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Additional Details</h3>
                  ${Object.entries(alert.metadata).map(([key, value]) => `
                    <div class="metadata-item">
                      <span style="font-weight: 600; color: #374151;">${key}:</span>
                      <span style="color: #6b7280;">${JSON.stringify(value)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                <strong>Time:</strong> ${new Date(alert.created_at || Date.now()).toLocaleString()}
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">AfriNova System Monitoring</p>
              <p style="margin: 5px 0 0 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/monitoring" style="color: #3b82f6; text-decoration: none;">View Monitoring Dashboard →</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: emailHtml,
        text: `${alert.title}\n\n${alert.message}\n\nSeverity: ${alert.severity}\nType: ${alert.alert_type}\nTime: ${new Date(alert.created_at || Date.now()).toLocaleString()}`,
      });
    }

    console.log(`Alert email sent to ${adminEmails.join(', ')}`);
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(alert: Alert): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('Slack webhook not configured');
    return;
  }

  try {
    const severityEmojis = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const severityColors = {
      critical: 'danger',
      warning: 'warning',
      info: '#3b82f6',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${severityEmojis[alert.severity]} *System Alert*`,
        attachments: [
          {
            color: severityColors[alert.severity],
            title: alert.title,
            text: alert.message,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Type',
                value: alert.alert_type.replace('_', ' ').toUpperCase(),
                short: true,
              },
              {
                title: 'Time',
                value: new Date(alert.created_at || Date.now()).toLocaleString(),
                short: false,
              },
            ],
            footer: 'AfriNova Monitoring',
            footer_icon: 'https://afrinova.com/icon.png',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }

    console.log('Alert sent to Slack');
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

/**
 * Send alert to Discord
 */
async function sendDiscordAlert(alert: Alert): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('Discord webhook not configured');
    return;
  }

  try {
    const severityColors = {
      critical: 14362664, // Red
      warning: 16098851, // Orange
      info: 3901635,    // Blue
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `🚨 ${alert.title}`,
            description: alert.message,
            color: severityColors[alert.severity],
            fields: [
              {
                name: 'Severity',
                value: alert.severity.toUpperCase(),
                inline: true,
              },
              {
                name: 'Type',
                value: alert.alert_type.replace('_', ' ').toUpperCase(),
                inline: true,
              },
              {
                name: 'Time',
                value: new Date(alert.created_at || Date.now()).toLocaleString(),
                inline: false,
              },
            ],
            footer: {
              text: 'AfriNova System Monitoring',
            },
            timestamp: new Date(alert.created_at || Date.now()).toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    console.log('Alert sent to Discord');
  } catch (error) {
    console.error('Failed to send Discord alert:', error);
  }
}

/**
 * Check system health and create alerts if needed
 * This should be called periodically (e.g., every 5-15 minutes via cron)
 */
export async function checkSystemHealth(): Promise<void> {
  try {
    // Check error rate
    const errorStats = await getErrorStats(0.25); // Last 15 minutes
    if (errorStats.errorRate > 10) {
      const shouldAlert = await shouldSendAlert('error_rate', 30);
      if (shouldAlert) {
        await createAlert({
          alert_type: 'error_rate',
          severity: 'critical',
          title: 'High Error Rate Detected',
          message: `Error rate is ${errorStats.errorRate.toFixed(2)}% (${errorStats.totalErrors} errors). This exceeds the 10% threshold.`,
          metadata: {
            errorRate: errorStats.errorRate,
            totalErrors: errorStats.totalErrors,
            topErrors: errorStats.topErrors,
          },
          resolved: false,
        });
      }
    }

    // Check for critical errors
    const recentCriticalErrors = errorStats.errorsByType['500'] || 0;
    if (recentCriticalErrors > 0) {
      const shouldAlert = await shouldSendAlert('critical_error', 15);
      if (shouldAlert) {
        await createAlert({
          alert_type: 'critical_error',
          severity: 'critical',
          title: 'Critical Errors Detected',
          message: `${recentCriticalErrors} critical errors (500) occurred in the last 15 minutes.`,
          metadata: {
            errorCount: recentCriticalErrors,
            errorsByType: errorStats.errorsByType,
          },
          resolved: false,
        });
      }
    }

    // Check performance
    const perfStats = await getPerformanceStats(0.25); // Last 15 minutes
    if (perfStats.p95ResponseTime > 3000) {
      const shouldAlert = await shouldSendAlert('slow_response', 60);
      if (shouldAlert) {
        await createAlert({
          alert_type: 'slow_response',
          severity: 'warning',
          title: 'Slow API Responses Detected',
          message: `P95 response time is ${perfStats.p95ResponseTime}ms. This exceeds the 3000ms threshold.`,
          metadata: {
            avgResponseTime: perfStats.avgResponseTime,
            p95ResponseTime: perfStats.p95ResponseTime,
            p99ResponseTime: perfStats.p99ResponseTime,
            slowestRoutes: perfStats.slowestRoutes,
          },
          resolved: false,
        });
      }
    }

    console.log('System health check completed');
  } catch (error) {
    console.error('System health check failed:', error);
  }
}

/**
 * Initialize default alert rules
 */
export async function initializeAlertRules(): Promise<void> {
  try {
    const supabase = await createClient();

    // Check if rules already exist
    const { data: existingRules } = await supabase
      .from('alert_rules')
      .select('id')
      .limit(1);

    if (existingRules && existingRules.length > 0) {
      console.log('Alert rules already initialized');
      return;
    }

    // Insert default rules
    const { error } = await supabase
      .from('alert_rules')
      .insert(DEFAULT_ALERT_RULES);

    if (error) {
      console.error('Failed to initialize alert rules:', error);
      return;
    }

    console.log('Alert rules initialized successfully');
  } catch (error) {
    console.error('Initialize alert rules error:', error);
  }
}
