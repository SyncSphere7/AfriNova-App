import { AgentType } from './models';

export interface AgentRoutingDecision {
  primaryAgent: AgentType;
  supportingAgents?: AgentType[];
  confidence: number; // 0-1
  reasoning: string;
}

export interface GenerationContext {
  projectType?: string;
  techStack?: string[];
  existingCode?: string;
  userPreferences?: Record<string, any>;
}

/**
 * AgentRouter - Intelligently routes user requests to the best AI agent(s)
 * 
 * This class analyzes user prompts and automatically selects the most appropriate
 * agent(s) to handle the request, eliminating manual agent selection.
 */
export class AgentRouter {
  /**
   * Analyze user request and select the best agent(s)
   * @param userPrompt - The user's request/description
   * @param context - Optional context about the project
   * @returns Routing decision with primary agent, supporting agents, and confidence
   */
  route(userPrompt: string, context?: GenerationContext): AgentRoutingDecision {
    const prompt = userPrompt.toLowerCase();
    
    // Check for multi-agent scenarios first
    if (this.isFullStackRequest(prompt)) {
      return {
        primaryAgent: 'FRONTEND',
        supportingAgents: ['BACKEND', 'DATABASE', 'SECURITY', 'TESTING'],
        confidence: 0.95,
        reasoning: 'Full-stack application requires multiple agents',
      };
    }
    
    if (this.isEcommerceRequest(prompt)) {
      return {
        primaryAgent: 'FRONTEND',
        supportingAgents: ['BACKEND', 'DATABASE', 'PAYMENTS', 'SECURITY'],
        confidence: 0.92,
        reasoning: 'E-commerce application requires UI, backend, database, and payments',
      };
    }
    
    // Single agent routing
    if (this.isFrontendRequest(prompt)) {
      return {
        primaryAgent: 'FRONTEND',
        supportingAgents: ['UXUI'],
        confidence: 0.95,
        reasoning: 'Request contains UI/component keywords',
      };
    }
    
    if (this.isBackendRequest(prompt)) {
      return {
        primaryAgent: 'BACKEND',
        supportingAgents: ['DATABASE', 'SECURITY'],
        confidence: 0.90,
        reasoning: 'Request involves API/server logic',
      };
    }
    
    if (this.isDatabaseRequest(prompt)) {
      return {
        primaryAgent: 'DATABASE',
        supportingAgents: ['SECURITY'],
        confidence: 0.92,
        reasoning: 'Request involves database schema/queries',
      };
    }
    
    if (this.isPaymentRequest(prompt)) {
      return {
        primaryAgent: 'PAYMENTS',
        supportingAgents: ['SECURITY', 'BACKEND'],
        confidence: 0.88,
        reasoning: 'Request involves payment processing',
      };
    }
    
    if (this.isSecurityRequest(prompt)) {
      return {
        primaryAgent: 'SECURITY',
        supportingAgents: [],
        confidence: 0.85,
        reasoning: 'Request focuses on security/authentication',
      };
    }
    
    if (this.isTestingRequest(prompt)) {
      return {
        primaryAgent: 'TESTING',
        supportingAgents: [],
        confidence: 0.90,
        reasoning: 'Request asks for tests',
      };
    }
    
    if (this.isDesignRequest(prompt)) {
      return {
        primaryAgent: 'UXUI',
        supportingAgents: ['FRONTEND'],
        confidence: 0.87,
        reasoning: 'Request involves UI/UX design',
      };
    }
    
    if (this.isDevOpsRequest(prompt)) {
      return {
        primaryAgent: 'DEVOPS',
        supportingAgents: [],
        confidence: 0.89,
        reasoning: 'Request involves deployment/infrastructure',
      };
    }
    
    if (this.isAnalyticsRequest(prompt)) {
      return {
        primaryAgent: 'ANALYTICS',
        supportingAgents: [],
        confidence: 0.86,
        reasoning: 'Request involves tracking/metrics',
      };
    }
    
    if (this.isIntegrationRequest(prompt)) {
      return {
        primaryAgent: 'INTEGRATIONS',
        supportingAgents: ['BACKEND', 'SECURITY'],
        confidence: 0.88,
        reasoning: 'Request involves third-party integration',
      };
    }
    
    // Default: Use FRONTEND (most general)
    return {
      primaryAgent: 'FRONTEND',
      supportingAgents: [],
      confidence: 0.50,
      reasoning: 'No specific agent match, using default frontend agent',
    };
  }
  
  /**
   * Multi-agent routing for complex requests
   * Returns array of agents that should work together
   */
  routeMultiAgent(userPrompt: string, context?: GenerationContext): AgentType[] {
    const agents: AgentType[] = [];
    const prompt = userPrompt.toLowerCase();
    
    // Full-stack application = all agents
    if (this.isFullStackRequest(prompt)) {
      return ['FRONTEND', 'BACKEND', 'DATABASE', 'SECURITY', 'TESTING', 'DEVOPS'];
    }
    
    // E-commerce = specific agents
    if (this.isEcommerceRequest(prompt)) {
      return ['FRONTEND', 'BACKEND', 'DATABASE', 'PAYMENTS', 'SECURITY'];
    }
    
    // Default: use single agent routing
    const decision = this.route(userPrompt, context);
    agents.push(decision.primaryAgent);
    if (decision.supportingAgents) {
      agents.push(...decision.supportingAgents);
    }
    
    return agents;
  }
  
  // ==================== REQUEST TYPE DETECTION ====================
  
  private isFrontendRequest(prompt: string): boolean {
    const keywords = [
      'component', 'ui', 'interface', 'page', 'layout', 'form',
      'button', 'modal', 'dialog', 'card', 'navbar', 'sidebar',
      'react', 'next.js', 'nextjs', 'tailwind', 'shadcn', 'responsive',
      'styling', 'css', 'frontend', 'client', 'display', 'render',
      'view', 'screen', 'menu', 'navigation', 'header', 'footer',
      'input', 'select', 'dropdown', 'checkbox', 'radio', 'toggle',
      'animation', 'transition', 'hover', 'click', 'interactive',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isBackendRequest(prompt: string): boolean {
    const keywords = [
      'api', 'endpoint', 'route', 'server', 'backend', 'logic',
      'authentication', 'authorization', 'middleware', 'validation',
      'controller', 'service', 'rest', 'graphql', 'webhook',
      'edge function', 'serverless', 'handler', 'processor',
      'crud', 'create', 'read', 'update', 'delete', 'fetch',
      'request', 'response', 'http', 'get', 'post', 'put', 'patch',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isDatabaseRequest(prompt: string): boolean {
    const keywords = [
      'database', 'table', 'schema', 'migration', 'query', 'sql',
      'postgres', 'postgresql', 'supabase', 'rls', 'policy', 'index',
      'trigger', 'foreign key', 'constraint', 'relationship', 'join',
      'column', 'row', 'record', 'insert', 'select', 'update', 'delete',
      'primary key', 'unique', 'not null', 'default', 'cascade',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isPaymentRequest(prompt: string): boolean {
    const keywords = [
      'payment', 'stripe', 'paypal', 'pesapal', 'checkout', 'billing',
      'subscription', 'invoice', 'transaction', 'refund', 'charge',
      'm-pesa', 'mpesa', 'mobile money', 'flutterwave', 'paystack',
      'pay', 'purchase', 'buy', 'price', 'amount', 'currency',
      'credit card', 'debit card', 'card', 'bank', 'account',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isSecurityRequest(prompt: string): boolean {
    const keywords = [
      'security', 'auth', 'authentication', 'authorization', 'login',
      'signup', 'sign up', 'sign in', 'password', 'jwt', 'token',
      'encrypt', 'encryption', 'hash', 'hashing', 'csrf', 'xss',
      'sanitize', 'validate', 'validation', 'permission', 'role',
      'access control', 'vulnerability', 'secure', 'protect', 'guard',
      'oauth', 'sso', 'session', '2fa', 'mfa', 'verification',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isTestingRequest(prompt: string): boolean {
    const keywords = [
      'test', 'testing', 'unit test', 'integration test', 'e2e',
      'end-to-end', 'jest', 'playwright', 'cypress', 'vitest',
      'mock', 'fixture', 'assertion', 'expect', 'describe', 'it',
      'coverage', 'test case', 'spec', 'suite', 'runner',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isDesignRequest(prompt: string): boolean {
    const keywords = [
      'design', 'ux', 'ui/ux', 'user experience', 'user interface',
      'wireframe', 'mockup', 'prototype', 'figma', 'sketch',
      'accessibility', 'a11y', 'usability', 'user flow', 'journey',
      'color scheme', 'palette', 'typography', 'font', 'spacing',
      'layout design', 'visual', 'aesthetic', 'style guide', 'brand',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isDevOpsRequest(prompt: string): boolean {
    const keywords = [
      'deploy', 'deployment', 'ci/cd', 'pipeline', 'docker', 'container',
      'vercel', 'netlify', 'github actions', 'gitlab ci', 'jenkins',
      'build', 'environment', 'production', 'staging', 'development',
      'monitoring', 'logging', 'infrastructure', 'server', 'cloud',
      'aws', 'azure', 'gcp', 'kubernetes', 'k8s', 'helm',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isAnalyticsRequest(prompt: string): boolean {
    const keywords = [
      'analytics', 'tracking', 'metrics', 'event', 'dashboard',
      'google analytics', 'ga4', 'mixpanel', 'amplitude', 'posthog',
      'conversion', 'funnel', 'user behavior', 'report', 'chart',
      'graph', 'statistics', 'data', 'insight', 'kpi', 'measure',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isIntegrationRequest(prompt: string): boolean {
    const keywords = [
      'integration', 'integrate', 'third-party', 'api client', 'oauth',
      'webhook', 'connect', 'external service', 'import', 'export',
      'sync', 'synchronize', 'twilio', 'sendgrid', 'mailgun',
      'aws', 's3', 'cloudinary', 'slack', 'discord', 'telegram',
      'zapier', 'webhook', 'api key', 'credentials', 'sdk',
    ];
    return this.matchKeywords(prompt, keywords);
  }
  
  private isFullStackRequest(prompt: string): boolean {
    const patterns = [
      'full stack', 'fullstack', 'full-stack', 'complete application',
      'entire app', 'build a', 'create an application', 'develop a platform',
      'build me', 'generate app', 'make an app', 'whole project',
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }
  
  private isEcommerceRequest(prompt: string): boolean {
    const patterns = [
      'e-commerce', 'ecommerce', 'shop', 'store', 'marketplace',
      'shopping cart', 'product catalog', 'online store', 'sell products',
      'buy products', 'checkout', 'cart', 'order', 'inventory',
    ];
    return patterns.some(pattern => prompt.includes(pattern));
  }
  
  /**
   * Match keywords in prompt with weighted scoring
   */
  private matchKeywords(prompt: string, keywords: string[], threshold: number = 2): boolean {
    const matchCount = keywords.filter(keyword => prompt.includes(keyword)).length;
    return matchCount >= threshold;
  }
}

// Singleton instance
export const agentRouter = new AgentRouter();

/**
 * Convenience function for quick routing
 */
export function routeToAgent(
  userPrompt: string,
  context?: GenerationContext
): AgentRoutingDecision {
  return agentRouter.route(userPrompt, context);
}

/**
 * Convenience function for multi-agent routing
 */
export function routeToMultipleAgents(
  userPrompt: string,
  context?: GenerationContext
): AgentType[] {
  return agentRouter.routeMultiAgent(userPrompt, context);
}
