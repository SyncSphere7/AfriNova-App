import { AI_MODELS, AGENT_SYSTEM_PROMPTS, type AgentType, type GenerationRequest, type GenerationResponse } from './models';
import { analyzeProjectComplexity, getOptimalMaxTokens } from './model-router';
import { getMultilingualInstructions } from './language-prompts';
import type { TechStack } from '@/types';
import type { LanguageCode } from '@/lib/i18n/languages';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateWithAgent(request: GenerationRequest): Promise<GenerationResponse> {
  const {
    agentType,
    prompt,
    context = '',
    techStack = [],
    maxTokens = 16000, // IMPROVED: Increased from 4000 to 16000 for larger code generation
    temperature = 0.7,
    userLanguage = 'en', // MULTILINGUAL: Default to English
  } = request;

  const model = AI_MODELS[agentType];
  let systemPrompt = AGENT_SYSTEM_PROMPTS[agentType];

  // MULTILINGUAL: Add language-specific instructions to system prompt
  if (userLanguage && userLanguage !== 'en') {
    const multilingualInstructions = getMultilingualInstructions(userLanguage as LanguageCode);
    systemPrompt = systemPrompt + multilingualInstructions;
  }

  let fullPrompt = prompt;

  if (context) {
    fullPrompt = `Context: ${context}\n\n${prompt}`;
  }

  if (techStack.length > 0) {
    fullPrompt = `Tech Stack: ${techStack.join(', ')}\n\n${fullPrompt}`;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AfriNova AI Code Generator',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate code');
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage.total_tokens,
    model,
    agentType,
  };
}

export async function orchestrateGeneration(
  projectPrompt: string,
  techStack: string[],
  techStackObject?: TechStack,
  userLanguage?: LanguageCode // MULTILINGUAL: User's preferred language
): Promise<Record<AgentType, GenerationResponse>> {
  const results: Partial<Record<AgentType, GenerationResponse>> = {};

  // IMPROVED: Analyze project complexity for smart token allocation
  const complexity = techStackObject
    ? analyzeProjectComplexity(projectPrompt, techStackObject, techStackObject.integrations || [])
    : { complexity: 'medium' as const, estimatedTokens: 12000 };

  const agents: AgentType[] = ['UXUI', 'FRONTEND', 'BACKEND', 'DATABASE'];

  if (techStack.includes('payments')) {
    agents.push('PAYMENTS');
  }

  if (techStack.includes('auth')) {
    agents.push('SECURITY');
  }

  agents.push('TESTING');

  let previousContext = '';

  for (const agentType of agents) {
    // IMPROVED: Use optimal token limit based on complexity and agent type
    const optimalTokens = getOptimalMaxTokens(agentType, complexity.complexity);

    const result = await generateWithAgent({
      agentType,
      prompt: projectPrompt,
      context: previousContext,
      techStack,
      maxTokens: optimalTokens,
      temperature: agentType === 'TESTING' ? 0.5 : 0.7,
      userLanguage, // MULTILINGUAL: Pass user's language to agent
    });

    results[agentType] = result;
    // IMPROVED: Pass 5000 chars instead of 1000 for better context continuity
    // Free models (DeepSeek 128K, Gemini 1M) can handle much more context
    previousContext += `\n\n${agentType} Output:\n${result.content.substring(0, 5000)}...\n`;
  }

  return results as Record<AgentType, GenerationResponse>;
}
