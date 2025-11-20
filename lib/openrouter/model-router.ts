import type { TechStack } from '@/types';

export type ProjectComplexity = 'simple' | 'medium' | 'complex';

interface ComplexityAnalysis {
  complexity: ProjectComplexity;
  estimatedTokens: number;
  recommendedModel: string;
  reasoning: string;
}

/**
 * Analyze project requirements and recommend the best model
 * For Phase 1 (Traction): Use FREE models only
 * For Phase 2 (Post-Investment): Can add premium models
 */
export function analyzeProjectComplexity(
  prompt: string,
  techStack: TechStack,
  integrations: string[] = []
): ComplexityAnalysis {
  let complexityScore = 0;
  const reasons: string[] = [];

  // Factor 1: Prompt length
  const promptWords = prompt.split(/\s+/).length;
  if (promptWords < 100) {
    complexityScore += 1;
    reasons.push('Short prompt');
  } else if (promptWords < 300) {
    complexityScore += 2;
    reasons.push('Medium prompt');
  } else {
    complexityScore += 3;
    reasons.push('Detailed prompt');
  }

  // Factor 2: Tech stack complexity
  const techStackItems = Object.values(techStack).flat().filter(Boolean).length;
  if (techStackItems <= 3) {
    complexityScore += 1;
    reasons.push('Simple tech stack');
  } else if (techStackItems <= 6) {
    complexityScore += 2;
    reasons.push('Standard tech stack');
  } else {
    complexityScore += 3;
    reasons.push('Complex tech stack');
  }

  // Factor 3: Payments integration
  const payments = Array.isArray(techStack.payments) ? techStack.payments : [];
  if (payments.length > 0) {
    complexityScore += 2;
    reasons.push(`${payments.length} payment gateway(s)`);
  }

  // Factor 4: Additional integrations
  if (integrations.length > 0) {
    complexityScore += Math.min(integrations.length, 3);
    reasons.push(`${integrations.length} integration(s)`);
  }

  // Factor 5: Keywords indicating complexity
  const complexKeywords = [
    'authentication',
    'real-time',
    'websocket',
    'microservices',
    'api gateway',
    'load balancing',
    'caching',
    'queue',
    'background jobs',
    'email notifications',
    'file upload',
    'admin dashboard',
    'reporting',
    'analytics',
  ];

  const foundKeywords = complexKeywords.filter(keyword =>
    prompt.toLowerCase().includes(keyword)
  );
  
  if (foundKeywords.length > 0) {
    complexityScore += Math.min(foundKeywords.length, 4);
    reasons.push(`${foundKeywords.length} advanced feature(s)`);
  }

  // Determine complexity and model
  let complexity: ProjectComplexity;
  let recommendedModel: string;
  let estimatedTokens: number;

  if (complexityScore <= 4) {
    complexity = 'simple';
    recommendedModel = 'qwen/qwen-2.5-coder-32b-instruct'; // 32K context, fast
    estimatedTokens = 8000;
  } else if (complexityScore <= 8) {
    complexity = 'medium';
    recommendedModel = 'deepseek/deepseek-r1-distill-llama-70b'; // 128K context, balanced
    estimatedTokens = 12000;
  } else {
    complexity = 'complex';
    recommendedModel = 'google/gemini-2.0-flash-exp:free'; // 1M context, comprehensive
    estimatedTokens = 16000;
  }

  return {
    complexity,
    estimatedTokens,
    recommendedModel,
    reasoning: reasons.join(', '),
  };
}

/**
 * Get optimal maxTokens for a specific agent and project complexity
 */
export function getOptimalMaxTokens(
  agentType: string,
  complexity: ProjectComplexity
): number {
  const tokenLimits = {
    simple: {
      UXUI: 4000,
      FRONTEND: 8000,
      BACKEND: 8000,
      DATABASE: 4000,
      PAYMENTS: 6000,
      SECURITY: 4000,
      TESTING: 4000,
      DEVOPS: 4000,
      ANALYTICS: 4000,
      INTEGRATIONS: 4000,
    },
    medium: {
      UXUI: 6000,
      FRONTEND: 12000,
      BACKEND: 12000,
      DATABASE: 6000,
      PAYMENTS: 8000,
      SECURITY: 6000,
      TESTING: 6000,
      DEVOPS: 6000,
      ANALYTICS: 6000,
      INTEGRATIONS: 6000,
    },
    complex: {
      UXUI: 8000,
      FRONTEND: 16000,
      BACKEND: 16000,
      DATABASE: 8000,
      PAYMENTS: 12000,
      SECURITY: 8000,
      TESTING: 8000,
      DEVOPS: 8000,
      ANALYTICS: 8000,
      INTEGRATIONS: 8000,
    },
  };

  return tokenLimits[complexity][agentType as keyof typeof tokenLimits.simple] || 8000;
}

/**
 * Calculate estimated cost for a generation
 * Currently all FREE models, so cost is $0
 * Can be updated post-investment when using paid models
 */
export function estimateCost(
  estimatedTokens: number,
  model: string
): { cost: number; isFree: boolean } {
  // Phase 1: All free models
  const freeModels = [
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1-distill-llama-70b',
    'qwen/qwen-2.5-coder-32b-instruct',
  ];

  if (freeModels.some(m => model.includes(m))) {
    return { cost: 0, isFree: true };
  }

  // Phase 2: Premium models (post-investment)
  const pricingPerMToken = {
    'anthropic/claude-3.5-sonnet': 15, // $15 per million tokens
    'openai/gpt-4': 30,
    'openai/gpt-4-turbo': 10,
  };

  const modelKey = Object.keys(pricingPerMToken).find(k => model.includes(k));
  if (modelKey) {
    const pricePerToken = pricingPerMToken[modelKey as keyof typeof pricingPerMToken] / 1_000_000;
    return {
      cost: estimatedTokens * pricePerToken,
      isFree: false,
    };
  }

  return { cost: 0, isFree: true };
}
