import { createClient } from '@/lib/supabase/client';
import { scanForSecrets, formatScanResults, type SecretScanResult } from '@/lib/utils/secret-scanner';
import type { Project } from '@/types';

export interface GenerationResult {
  success: boolean;
  code?: {
    files: Array<{ path: string; content: string }>;
    instructions: string;
  };
  tokensUsed?: number;
  model?: string;
  error?: string;
  securityScan?: {
    hasSecrets: boolean;
    warnings: SecretScanResult['warnings'];
    score: SecretScanResult['score'];
    message: string;
  };
}

export async function generateCode(
  projectId: string,
  prompt: string,
  techStack: Record<string, any>
): Promise<GenerationResult> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-code`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'Apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({
      projectId,
      prompt,
      techStack,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate code');
  }

  const result = await response.json();

  // 🔒 SECURITY: Scan generated code for potential secrets
  if (result.success && result.code?.files) {
    let allCode = '';
    result.code.files.forEach((file: { path: string; content: string }) => {
      allCode += `\n// File: ${file.path}\n${file.content}\n`;
    });

    const scanResult = scanForSecrets(allCode);
    
    if (scanResult.hasSecrets) {
      console.warn('⚠️ Security scan detected potential secrets in generated code:', scanResult);
      
      // Add security warnings to result
      result.securityScan = {
        hasSecrets: true,
        warnings: scanResult.warnings,
        score: scanResult.score,
        message: formatScanResults(scanResult),
      };

      // Log to Supabase for monitoring
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log security alert (optional - table may not exist yet)
        const { error: alertError } = await supabase.from('security_alerts').insert({
          user_id: user.id,
          project_id: projectId,
          alert_type: 'potential_secret_detected',
          severity: scanResult.score,
          details: {
            warnings_count: scanResult.warnings.length,
            patterns: scanResult.warnings.map(w => w.pattern),
          },
        });
        
        if (alertError) {
          console.error('Failed to log security alert:', alertError);
        }
      }
    } else {
      result.securityScan = {
        hasSecrets: false,
        warnings: [],
        score: 'safe',
        message: '✅ No secrets detected. Code is safe!',
      };
    }
  }

  return result;
}

export async function updateProjectWithGeneration(
  projectId: string,
  generatedCode: any,
  tokensUsed: number
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('projects')
    .update({
      status: 'completed',
      generated_code: generatedCode,
      progress: 100,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('generations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        prompt: '',
        status: 'completed',
        tokens_used: tokensUsed,
        model_used: 'anthropic/claude-3.5-sonnet',
        completed_at: new Date().toISOString(),
      });

    const { data: profile } = await supabase
      .from('profiles')
      .select('generations_used')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          generations_used: (profile.generations_used || 0) + 1,
        })
        .eq('id', user.id);
    }
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: 'draft' | 'generating' | 'completed' | 'failed',
  progress: number,
  errorMessage?: string
): Promise<void> {
  const supabase = createClient();

  const updateData: any = {
    status,
    progress,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId);

  if (error) throw error;
}
