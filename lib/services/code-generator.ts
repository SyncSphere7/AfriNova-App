import { createClient } from '@/lib/supabase/client';
import { generateWithAgent, orchestrateGeneration } from '@/lib/openrouter/client';
import type { AgentType } from '@/lib/openrouter/models';
import type { LanguageCode } from '@/lib/i18n/languages';

export interface CodeGenerationRequest {
  projectId: string;
  userId: string;
  prompt: string;
  techStack: string[];
  enhancedPrompt?: string;
  userLanguage?: LanguageCode; // MULTILINGUAL: User's preferred language
}

export interface GeneratedCodeStructure {
  frontend?: {
    components: Record<string, string>;
    pages: Record<string, string>;
    styles: Record<string, string>;
    utils: Record<string, string>;
  };
  backend?: {
    routes: Record<string, string>;
    controllers: Record<string, string>;
    services: Record<string, string>;
    middleware: Record<string, string>;
  };
  database?: {
    migrations: Record<string, string>;
    schemas: Record<string, string>;
  };
  tests?: {
    unit: Record<string, string>;
    integration: Record<string, string>;
  };
  config?: {
    packageJson: string;
    envExample: string;
    readme: string;
  };
}

export async function generateProjectCode(
  request: CodeGenerationRequest
): Promise<GeneratedCodeStructure> {
  const { projectId, userId, prompt, techStack, enhancedPrompt, userLanguage = 'en' } = request;

  const supabase = createClient();

  await supabase
    .from('projects')
    .update({
      status: 'generating',
      progress: 10,
    })
    .eq('id', projectId);

  const { data: profile } = await supabase
    .from('profiles')
    .select('generations_used, generations_limit')
    .eq('id', userId)
    .single();

  if (profile && profile.generations_used >= profile.generations_limit) {
    throw new Error('Generation limit reached. Please upgrade your plan.');
  }

  const generationId = crypto.randomUUID();
  await supabase.from('generations').insert({
    id: generationId,
    project_id: projectId,
    user_id: userId,
    prompt,
    enhanced_prompt: enhancedPrompt || prompt,
    status: 'processing',
    model_used: 'multi-agent',
  });

  try {
    await supabase
      .from('projects')
      .update({ progress: 20 })
      .eq('id', projectId);

    const results = await orchestrateGeneration(
      enhancedPrompt || prompt,
      techStack,
      undefined, // techStackObject (optional)
      userLanguage // MULTILINGUAL: Pass user's language to AI agents
    );

    await supabase
      .from('projects')
      .update({ progress: 60 })
      .eq('id', projectId);

    const codeStructure: GeneratedCodeStructure = {};

    if (results.FRONTEND) {
      codeStructure.frontend = parseCodeOutput(results.FRONTEND.content, 'frontend');
    }

    if (results.BACKEND) {
      codeStructure.backend = parseCodeOutput(results.BACKEND.content, 'backend');
    }

    if (results.DATABASE) {
      codeStructure.database = parseCodeOutput(results.DATABASE.content, 'database');
    }

    if (results.TESTING) {
      codeStructure.tests = parseCodeOutput(results.TESTING.content, 'tests');
    }

    if (results.UXUI) {
      codeStructure.config = {
        readme: results.UXUI.content,
        packageJson: generatePackageJson(techStack),
        envExample: generateEnvExample(techStack),
      };
    }

    await supabase
      .from('projects')
      .update({ progress: 80 })
      .eq('id', projectId);

    const totalTokens = Object.values(results).reduce(
      (sum, result) => sum + result.tokensUsed,
      0
    );

    await supabase
      .from('projects')
      .update({
        status: 'completed',
        progress: 100,
        generated_code: codeStructure,
      })
      .eq('id', projectId);

    await supabase
      .from('generations')
      .update({
        status: 'completed',
        tokens_used: totalTokens,
        cost: calculateCost(totalTokens),
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    await supabase
      .from('profiles')
      .update({
        generations_used: (profile?.generations_used || 0) + 1,
      })
      .eq('id', userId);

    return codeStructure;
  } catch (error: any) {
    await supabase
      .from('projects')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', projectId);

    await supabase
      .from('generations')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generationId);

    throw error;
  }
}

function parseCodeOutput(content: string, type: string): any {
  const codeBlocks: Record<string, string> = {};

  const fileRegex = /```(?:typescript|javascript|tsx|jsx|css|sql|json)?\s*(?:\/\/|#)?\s*(.+?)\n([\s\S]*?)```/g;
  let match;

  let fileIndex = 0;
  while ((match = fileRegex.exec(content)) !== null) {
    const fileName = match[1]?.trim() || `file-${fileIndex++}.ts`;
    const code = match[2].trim();
    codeBlocks[fileName] = code;
  }

  if (Object.keys(codeBlocks).length === 0 && content.includes('```')) {
    const simpleRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
    let simpleMatch;
    let index = 0;
    while ((simpleMatch = simpleRegex.exec(content)) !== null) {
      codeBlocks[`${type}-${index++}.ts`] = simpleMatch[1].trim();
    }
  }

  return codeBlocks;
}

function generatePackageJson(techStack: string[]): string {
  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    next: '^13.5.1',
  };

  if (techStack.includes('tailwind')) {
    dependencies.tailwindcss = '^3.3.3';
  }

  if (techStack.includes('supabase')) {
    dependencies['@supabase/supabase-js'] = '^2.83.0';
  }

  return JSON.stringify(
    {
      name: 'generated-project',
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies,
    },
    null,
    2
  );
}

function generateEnvExample(techStack: string[]): string {
  let env = '';

  if (techStack.includes('supabase')) {
    env += 'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n';
    env += 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n';
  }

  if (techStack.includes('payments')) {
    env += '\nPESAPAL_CONSUMER_KEY=your_key\n';
    env += 'PESAPAL_CONSUMER_SECRET=your_secret\n';
  }

  return env;
}

function calculateCost(tokens: number): number {
  return (tokens / 1000) * 0.001;
}
