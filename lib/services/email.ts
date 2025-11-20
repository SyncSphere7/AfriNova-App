export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getWelcomeEmail(userName: string): EmailTemplate {
  return {
    subject: 'Welcome to AfriNova! 🚀',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AfriNova!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Welcome to AfriNova - your AI-powered code generation platform! We're excited to have you on board.</p>
      <p><strong>What you can do now:</strong></p>
      <ul>
        <li>Create your first project with AI</li>
        <li>Generate production-ready code instantly</li>
        <li>Download and customize your generated code</li>
        <li>Explore 20+ integrations</li>
      </ul>
      <p>Your Free plan includes <strong>5 generations per month</strong> and <strong>3 projects</strong>. Ready to get started?</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/new" class="button">Create Your First Project</a>
      <p>If you have any questions, our support team is here to help!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Welcome to AfriNova, ${userName}!

We're excited to have you on board.

What you can do now:
- Create your first project with AI
- Generate production-ready code instantly
- Download and customize your generated code
- Explore 20+ integrations

Your Free plan includes 5 generations per month and 3 projects.

Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/new

If you have any questions, our support team is here to help!

© ${new Date().getFullYear()} AfriNova. All rights reserved.`,
  };
}

export function getSubscriptionConfirmationEmail(
  userName: string,
  tier: string,
  billingCycle: string,
  amount: number,
  generationsLimit: number
): EmailTemplate {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const cycle = billingCycle === 'annual' ? 'Annual' : 'Monthly';

  return {
    subject: `Welcome to AfriNova ${tierName} Plan! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .plan-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Subscription Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Thank you for subscribing to AfriNova ${tierName}! Your payment has been processed successfully.</p>
      <div class="plan-details">
        <h3>Your Plan Details</h3>
        <p><strong>Plan:</strong> ${tierName}</p>
        <p><strong>Billing:</strong> ${cycle} - $${amount.toFixed(2)}</p>
        <p><strong>Generations:</strong> ${generationsLimit === 999999 ? 'Unlimited' : `${generationsLimit} per month`}</p>
        ${billingCycle === 'annual' ? '<p><strong>Savings:</strong> 20% off (billed annually)</p>' : ''}
      </div>
      <p><strong>What's included:</strong></p>
      <ul>
        <li>${generationsLimit === 999999 ? 'Unlimited' : generationsLimit} AI code generations per month</li>
        <li>All 20 integrations</li>
        <li>Priority queue processing</li>
        <li>${tier === 'starter' ? 'Email support (48h)' : tier === 'growth' ? 'Priority support (4h)' : '24/7 dedicated support'}</li>
        ${tier !== 'starter' ? '<li>API access & white-label options</li>' : ''}
        ${tier === 'pro' ? '<li>Custom AI models & dedicated account manager</li>' : ''}
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Subscription Confirmed!

Hi ${userName},

Thank you for subscribing to AfriNova ${tierName}! Your payment has been processed successfully.

Plan Details:
- Plan: ${tierName}
- Billing: ${cycle} - $${amount.toFixed(2)}
- Generations: ${generationsLimit === 999999 ? 'Unlimited' : `${generationsLimit} per month`}
${billingCycle === 'annual' ? '- Savings: 20% off (billed annually)' : ''}

Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

© ${new Date().getFullYear()} AfriNova. All rights reserved.`,
  };
}

export function getUsageWarningEmail(
  userName: string,
  generationsUsed: number,
  generationsLimit: number,
  percentageUsed: number
): EmailTemplate {
  const remaining = generationsLimit - generationsUsed;

  return {
    subject: '⚠️ You\'ve Used 80% of Your Generations',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .usage-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Usage Warning</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>You've used <strong>${percentageUsed}%</strong> of your monthly generations!</p>
      <div class="usage-box">
        <h3>Current Usage</h3>
        <p><strong>${generationsUsed}</strong> of <strong>${generationsLimit}</strong> generations used</p>
        <p><strong>${remaining}</strong> generations remaining</p>
      </div>
      <p><strong>What happens when you reach your limit?</strong></p>
      <ul>
        <li>You won't be able to create new projects until next month</li>
        <li>Your usage resets on the 1st of each month</li>
        <li>Existing projects remain accessible</li>
      </ul>
      <p>Need more generations? Consider upgrading your plan!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing" class="button">View Plans</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Usage Warning

Hi ${userName},

You've used ${percentageUsed}% of your monthly generations!

Current Usage:
- ${generationsUsed} of ${generationsLimit} generations used
- ${remaining} generations remaining

What happens when you reach your limit?
- You won't be able to create new projects until next month
- Your usage resets on the 1st of each month
- Existing projects remain accessible

Need more generations? Consider upgrading your plan!
Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing

© ${new Date().getFullYear()} AfriNova. All rights reserved.`,
  };
}

export function getGenerationCompleteEmail(
  userName: string,
  projectName: string,
  projectId: string
): EmailTemplate {
  return {
    subject: `✅ Your Project "${projectName}" is Ready!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .project-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Generation Complete!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Great news! Your AI-generated project is ready.</p>
      <div class="project-box">
        <h3>${projectName}</h3>
        <p>Your production-ready code has been generated by our multi-agent AI system.</p>
      </div>
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Review your generated code</li>
        <li>Download all files as a ZIP</li>
        <li>Customize and deploy</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/projects/${projectId}" class="button">View Project</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Generation Complete!

Hi ${userName},

Great news! Your AI-generated project "${projectName}" is ready.

Your production-ready code has been generated by our multi-agent AI system.

What's next?
- Review your generated code
- Download all files as a ZIP
- Customize and deploy

View Project: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/projects/${projectId}

© ${new Date().getFullYear()} AfriNova. All rights reserved.`,
  };
}

export function getTrialEndingSoonEmail(
  userName: string,
  tier: string,
  daysRemaining: number
): EmailTemplate {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  return {
    subject: `Your ${tierName} Trial Ends in ${daysRemaining} Days`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .trial-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Trial is Ending Soon</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Your ${tierName} plan trial will end in <strong>${daysRemaining} days</strong>.</p>
      <div class="trial-box">
        <h3>What happens next?</h3>
        <p>After your trial ends:</p>
        <ul>
          <li>Your account will downgrade to the Free plan</li>
          <li>You'll have 5 generations per month</li>
          <li>Premium features will be disabled</li>
        </ul>
      </div>
      <p>Want to keep your ${tierName} benefits? Subscribe now!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings" class="button">Continue Subscription</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AfriNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Your Trial is Ending Soon

Hi ${userName},

Your ${tierName} plan trial will end in ${daysRemaining} days.

What happens next?
After your trial ends:
- Your account will downgrade to the Free plan
- You'll have 5 generations per month
- Premium features will be disabled

Want to keep your ${tierName} benefits? Subscribe now!
Visit: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings

© ${new Date().getFullYear()} AfriNova. All rights reserved.`,
  };
}
