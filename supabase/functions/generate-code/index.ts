import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerationRequest {
  projectId: string;
  prompt: string;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    styling: string;
    payments: string[];
    integrations: string[];
  };
}

interface FileStructure {
  path: string;
  content: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { projectId, prompt, techStack }: GenerationRequest = await req.json();

    await supabase
      .from('projects')
      .update({ status: 'generating', progress: 5 })
      .eq('id', projectId);

    const techStackString = `
Frontend: ${techStack.frontend}
Backend: ${techStack.backend}
Database: ${techStack.database}
Styling: ${techStack.styling}
Payments: ${techStack.payments.join(', ')}
Integrations: ${techStack.integrations.join(', ')}
`;

    const systemPrompt = `You are an expert full-stack developer. Generate production-ready code based on the user's requirements.

IMPORTANT RULES:
1. Generate a complete, working application
2. Use modern best practices and security standards
3. Include proper error handling and validation
4. Generate modular, maintainable code
5. Follow the specified tech stack exactly
6. Include README with setup instructions
7. Respond ONLY with valid JSON in this exact format:
{
  "files": [
    {
      "path": "relative/path/to/file.ext",
      "content": "file contents here",
      "description": "What this file does"
    }
  ],
  "instructions": "Setup and deployment instructions"
}

Do not include any text before or after the JSON.`;

    const userPrompt = `${techStackString}\n\nProject Requirements:\n${prompt}\n\nGenerate a complete, production-ready application with all necessary files.`;

    await supabase
      .from('projects')
      .update({ progress: 20 })
      .eq('id', projectId);

    const openrouterResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'AfriNova AI Code Generator',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 16000, // IMPROVED: Increased from 8000 to 16000 for larger projects
        temperature: 0.7,
      }),
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.json();
      throw new Error(errorData.error?.message || 'OpenRouter API failed');
    }

    const openrouterData = await openrouterResponse.json();
    const generatedContent = openrouterData.choices[0].message.content;
    const tokensUsed = openrouterData.usage?.total_tokens || 0;

    await supabase
      .from('projects')
      .update({ progress: 70 })
      .eq('id', projectId);

    let parsedCode;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      parsedCode = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      parsedCode = {
        files: [
          {
            path: 'README.md',
            content: generatedContent,
            description: 'Generated code output',
          },
        ],
        instructions: 'Review the generated code and extract files manually.',
      };
    }

    await supabase
      .from('projects')
      .update({
        status: 'completed',
        progress: 100,
        generated_code: parsedCode,
      })
      .eq('id', projectId);

    await supabase.from('generations').insert({
      project_id: projectId,
      user_id: user.id,
      prompt,
      status: 'completed',
      tokens_used: tokensUsed,
      model_used: 'anthropic/claude-3.5-sonnet',
      completed_at: new Date().toISOString(),
    });

    const { data: profile } = await supabase
      .from('profiles')
      .select('generations_used')
      .eq('id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ generations_used: (profile.generations_used || 0) + 1 })
        .eq('id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        code: parsedCode,
        tokensUsed,
        model: 'anthropic/claude-3.5-sonnet',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Code generation failed',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});