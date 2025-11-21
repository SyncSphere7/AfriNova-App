/**
 * Email Service - Automated Email Sending
 * 
 * Handles all email notifications through Resend API
 * Supports: transactional emails, marketing emails, system notifications
 */

import {
  getWelcomeEmail,
  getSubscriptionConfirmationEmail,
  getUsageWarningEmail,
  getGenerationCompleteEmail,
  getTrialEndingSoonEmail,
  type EmailTemplate,
} from './email';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AfriNova <noreply@afrinova.com>';
const RESEND_API_URL = 'https://api.resend.com/emails';

export interface SendEmailOptions {
  to: string | string[];
  template: EmailTemplate;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export interface EmailQueueItem {
  id: string;
  user_id: string;
  email_type: string;
  recipient: string;
  subject: string;
  html_content: string;
  text_content?: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  last_attempt_at?: string;
  error_message?: string;
  created_at: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!RESEND_API_KEY || RESEND_API_KEY === 'your_resend_api_key_here') {
      console.warn('⚠️ Resend API key not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.template.subject,
        html: options.template.html,
        text: options.template.text,
        reply_to: options.replyTo,
        attachments: options.attachments,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully: ${result.id}`);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const template = getWelcomeEmail(userName);
  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  userEmail: string,
  userName: string,
  plan: string,
  billingCycle: 'monthly' | 'annual',
  amount: number,
  generationsLimit: number = 30
): Promise<boolean> {
  const template = getSubscriptionConfirmationEmail(userName, plan, billingCycle, amount, generationsLimit);
  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send usage warning email (approaching limit)
 */
export async function sendUsageWarningEmail(
  userEmail: string,
  userName: string,
  usagePercentage: number,
  generationsUsed: number,
  generationsLimit: number
): Promise<boolean> {
  const template = getUsageWarningEmail(userName, usagePercentage, generationsUsed, generationsLimit);
  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send generation complete email
 */
export async function sendGenerationCompleteEmail(
  userEmail: string,
  userName: string,
  projectName: string,
  projectId: string
): Promise<boolean> {
  const template = getGenerationCompleteEmail(userName, projectName, projectId);
  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send trial ending soon email
 */
export async function sendTrialEndingSoonEmail(
  userEmail: string,
  userName: string,
  daysRemaining: number,
  plan: string
): Promise<boolean> {
  const template = getTrialEndingSoonEmail(userName, plan, daysRemaining);
  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  reason: string
): Promise<boolean> {
  const template: EmailTemplate = {
    subject: '⚠️ Payment Failed - Action Required',
    html: `
      <h2>Hi ${userName},</h2>
      <p>We were unable to process your payment of <strong>$${amount}</strong>.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>To avoid service interruption, please update your payment method:</p>
      <p style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing" 
           style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Update Payment Method
        </a>
      </p>
      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br>The AfriNova Team</p>
    `,
    text: `Hi ${userName},\n\nWe were unable to process your payment of $${amount}.\nReason: ${reason}\n\nPlease update your payment method at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
  };

  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send subscription cancelled email
 */
export async function sendSubscriptionCancelledEmail(
  userEmail: string,
  userName: string,
  plan: string,
  endDate: string
): Promise<boolean> {
  const template: EmailTemplate = {
    subject: 'Subscription Cancelled',
    html: `
      <h2>Hi ${userName},</h2>
      <p>Your <strong>${plan}</strong> subscription has been cancelled.</p>
      <p>You'll continue to have access until <strong>${new Date(endDate).toLocaleDateString()}</strong>.</p>
      <p>If you change your mind, you can reactivate your subscription anytime:</p>
      <p style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing" 
           style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reactivate Subscription
        </a>
      </p>
      <p>We're sorry to see you go. If you have feedback on how we can improve, please let us know.</p>
      <p>Best regards,<br>The AfriNova Team</p>
    `,
    text: `Hi ${userName},\n\nYour ${plan} subscription has been cancelled.\nYou'll have access until: ${new Date(endDate).toLocaleDateString()}\n\nReactivate anytime at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing`,
  };

  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Send API key created email
 */
export async function sendApiKeyCreatedEmail(
  userEmail: string,
  userName: string,
  keyName: string,
  environment: 'sandbox' | 'production'
): Promise<boolean> {
  const template: EmailTemplate = {
    subject: '🔑 New API Key Created',
    html: `
      <h2>Hi ${userName},</h2>
      <p>A new API key has been created for your account:</p>
      <ul>
        <li><strong>Name:</strong> ${keyName}</li>
        <li><strong>Environment:</strong> ${environment}</li>
        <li><strong>Created:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p><strong>⚠️ Security Reminder:</strong></p>
      <ul>
        <li>Never share your API keys</li>
        <li>Don't commit keys to version control</li>
        <li>Rotate keys regularly</li>
        <li>Use sandbox keys for testing</li>
      </ul>
      <p>If you didn't create this key, please secure your account immediately:</p>
      <p style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/api-keys" 
           style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View API Keys
        </a>
      </p>
      <p>Best regards,<br>The AfriNova Team</p>
    `,
    text: `Hi ${userName},\n\nA new API key "${keyName}" (${environment}) has been created.\n\nView your keys: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/api-keys`,
  };

  const result = await sendEmail({
    to: userEmail,
    template,
  });
  return result.success;
}

/**
 * Queue an email for later delivery (background processing)
 * Useful for bulk emails or retrying failed sends
 */
export async function queueEmail(
  userId: string,
  emailType: string,
  recipient: string,
  template: EmailTemplate
): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { error } = await supabase
      .from('email_queue')
      .insert({
        user_id: userId,
        email_type: emailType,
        recipient,
        subject: template.subject,
        html_content: template.html,
        text_content: template.text,
        status: 'pending',
        attempts: 0,
      });

    if (error) {
      console.error('Failed to queue email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Queue email error:', error);
    return false;
  }
}

/**
 * Process pending emails from queue
 * Run this with a cron job or background worker
 */
export async function processEmailQueue(batchSize: number = 10): Promise<number> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Get pending emails
    const { data: emails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3) // Max 3 attempts
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (error || !emails || emails.length === 0) {
      return 0;
    }

    let sentCount = 0;

    // Process each email
    for (const email of emails) {
      const template: EmailTemplate = {
        subject: email.subject,
        html: email.html_content,
        text: email.text_content || undefined,
      };

      const result = await sendEmail({
        to: email.recipient,
        template,
      });

      if (result.success) {
        // Mark as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            last_attempt_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        sentCount++;
      } else {
        // Increment attempts
        const newAttempts = email.attempts + 1;
        await supabase
          .from('email_queue')
          .update({
            status: newAttempts >= 3 ? 'failed' : 'pending',
            attempts: newAttempts,
            last_attempt_at: new Date().toISOString(),
            error_message: result.error,
          })
          .eq('id', email.id);
      }
    }

    console.log(`✅ Processed ${sentCount}/${emails.length} emails from queue`);
    return sentCount;
  } catch (error) {
    console.error('Process email queue error:', error);
    return 0;
  }
}

/**
 * Clean up old sent emails from queue
 */
export async function cleanupEmailQueue(daysOld: number = 30): Promise<number> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error, count } = await supabase
      .from('email_queue')
      .delete()
      .eq('status', 'sent')
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Failed to cleanup email queue:', error);
      return 0;
    }

    console.log(`🗑️ Cleaned up ${count || 0} old emails from queue`);
    return count || 0;
  } catch (error) {
    console.error('Cleanup email queue error:', error);
    return 0;
  }
}
