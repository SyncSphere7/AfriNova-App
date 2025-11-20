'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TechStackSelector } from '@/components/projects/tech-stack-selector';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { TechStack } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get('template');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(!!templateSlug);
  const [error, setError] = useState('');
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<TechStack>({
    frontend: 'React',
    backend: 'Node.js (Express)',
    database: 'PostgreSQL',
    styling: 'Tailwind CSS',
    payments: ['Pesapal', 'PayPal', 'Stripe'],
    integrations: [],
  });
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (templateSlug) {
      loadTemplate(templateSlug);
    }
  }, [templateSlug]);

  async function loadTemplate(slug: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Template not found');

      setTemplateId(data.id);
      setName(data.name);
      setDescription(data.description);
      setTechStack(data.tech_stack);
      setPrompt(data.default_prompt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTemplate(false);
    }
  }

  const handleCreateProject = async () => {
    if (!name || !prompt) {
      setError('Please fill in all required fields');
      return;
    }

    if (prompt.length < 50) {
      setError('Prompt must be at least 50 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const projectData: any = {
        user_id: user.id,
        name,
        description,
        tech_stack: techStack,
        prompt,
        status: 'draft',
      };

      if (templateId) {
        projectData.template_id = templateId;

        const { data: template } = await supabase
          .from('project_templates')
          .select('usage_count')
          .eq('id', templateId)
          .single();

        if (template) {
          await supabase
            .from('project_templates')
            .update({ usage_count: (template.usage_count || 0) + 1 })
            .eq('id', templateId);
        }
      }

      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/dashboard/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return name.length > 0;
    if (step === 2) return true;
    if (step === 3) return prompt.length >= 50;
    return false;
  };

  if (loading || loadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text={loadingTemplate ? "LOADING TEMPLATE..." : "CREATING PROJECT..."} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-pixel uppercase mb-2">
          {templateSlug ? 'Create from Template' : 'Create New Project'}
        </h1>
        <p className="text-muted-foreground font-sans">
          {templateSlug
            ? 'Customize your template and generate production-ready code'
            : 'Follow the steps to generate your production-ready application'}
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 border-2 border-foreground font-pixel text-sm ${
                s === step
                  ? 'bg-accent text-accent-foreground'
                  : s < step
                  ? 'bg-success text-white'
                  : 'bg-muted'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className="w-12 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm font-sans">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Project Info</CardTitle>
            <CardDescription>Give your project a name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-pixel text-xs uppercase">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground font-sans">
                {name.length}/50 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-pixel text-xs uppercase">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project..."
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground font-sans">
                {description.length}/200 characters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Tech Stack</CardTitle>
            <CardDescription>Choose your preferred technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <TechStackSelector techStack={techStack} onChange={setTechStack} />
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Describe Your App</CardTitle>
            <CardDescription>
              Tell us what you want to build. Be as detailed as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="font-pixel text-xs uppercase">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Build a task management app with user authentication, project boards, drag-and-drop tasks, real-time collaboration, and email notifications..."
                rows={10}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground font-sans">
                {prompt.length}/2000 characters (minimum 50)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else router.push('/dashboard');
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreateProject} disabled={!canGoNext()}>
            Create Project
          </Button>
        )}
      </div>
    </div>
  );
}
