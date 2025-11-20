'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Download, Code2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { generateCode, updateProjectWithGeneration, updateProjectStatus } from '@/lib/services/ai-generation';
import { downloadProjectAsZip, downloadSingleFile } from '@/lib/utils/code-downloader';
import type { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project?.status === 'generating') {
      const interval = setInterval(() => {
        loadProject();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [project?.status]);

  const loadProject = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Project not found');

      setProject(data as Project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!project) return;

    setGenerating(true);
    setError('');

    try {
      await updateProjectStatus(project.id, 'generating', 10);
      setProject({ ...project, status: 'generating', progress: 10 });

      await updateProjectStatus(project.id, 'generating', 30);
      setProject({ ...project, status: 'generating', progress: 30 });

      const result = await generateCode(
        project.id,
        project.prompt,
        project.tech_stack
      );

      if (!result.success || !result.code) {
        throw new Error(result.error || 'Failed to generate code');
      }

      await updateProjectStatus(project.id, 'generating', 80);
      setProject({ ...project, status: 'generating', progress: 80 });

      await updateProjectWithGeneration(
        project.id,
        result.code,
        result.tokensUsed || 0
      );

      await loadProject();
    } catch (err: any) {
      setError(err.message);
      await updateProjectStatus(project.id, 'failed', 0, err.message);
      setProject({ ...project, status: 'failed', error_message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!project?.generated_code) return;

    try {
      await downloadProjectAsZip(project.name, project.generated_code);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download project files');
    }
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    try {
      downloadSingleFile(fileName, content);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="LOADING PROJECT..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-pixel uppercase mb-4">Project Not Found</h2>
          <Button onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-pixel uppercase mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground font-sans">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-pixel uppercase px-3 py-2 border-2 border-foreground ${
              project.status === 'completed'
                ? 'bg-success text-white'
                : project.status === 'generating'
                ? 'bg-warning text-black'
                : project.status === 'failed'
                ? 'bg-destructive text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm font-sans">
          {error}
        </div>
      )}

      {(generating || project.status === 'generating') && (
        <Card className="border-accent">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-pixel uppercase">
                  {project.progress < 20 ? 'Initializing...' :
                   project.progress < 40 ? 'Analyzing requirements...' :
                   project.progress < 70 ? 'Generating code...' :
                   project.progress < 90 ? 'Finalizing...' :
                   'Almost done!'}
                </span>
                <span className="text-sm font-pixel text-accent">{project.progress}%</span>
              </div>
              <div className="w-full h-4 border-2 border-foreground bg-secondary overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>AI is analyzing your requirements and generating production-ready code</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans">
                  This may take 2-5 minutes. The page will update automatically when complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="border-2 border-foreground">
          <TabsTrigger value="details" className="font-pixel text-xs uppercase">
            Details
          </TabsTrigger>
          <TabsTrigger value="code" className="font-pixel text-xs uppercase" disabled={!project.generated_code}>
            Generated Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-sans whitespace-pre-wrap">{project.prompt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-pixel uppercase text-muted-foreground mb-1">Frontend</p>
                  <p className="text-sm font-sans">{project.tech_stack.frontend || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-pixel uppercase text-muted-foreground mb-1">Backend</p>
                  <p className="text-sm font-sans">{project.tech_stack.backend || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-pixel uppercase text-muted-foreground mb-1">Database</p>
                  <p className="text-sm font-sans">{project.tech_stack.database || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-pixel uppercase text-muted-foreground mb-1">Styling</p>
                  <p className="text-sm font-sans">{project.tech_stack.styling || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.status === 'draft' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div>
                    <Code2 className="h-12 w-12 text-accent mx-auto mb-4" />
                    <h3 className="text-lg font-pixel uppercase mb-2">Ready to Generate</h3>
                    <p className="text-sm text-muted-foreground font-sans mb-4">
                      Click the button below to start generating your production-ready code
                    </p>
                  </div>
                  <Button size="lg" onClick={handleGenerate} disabled={generating}>
                    <Play className="mr-2 h-5 w-5" />
                    Generate Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {project.status === 'failed' && project.error_message && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Generation Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans mb-4">{project.error_message}</p>
                <Button onClick={handleGenerate} disabled={generating}>
                  <Play className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          {project.generated_code && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground font-sans">
                  {project.generated_code.files?.length || 0} files generated
                </p>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All Files (ZIP)
                </Button>
              </div>

              {project.generated_code.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Setup Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm font-sans whitespace-pre-wrap bg-secondary p-4 overflow-x-auto border-2 border-border">
                      {project.generated_code.instructions}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {project.generated_code.files && project.generated_code.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Generated Files</CardTitle>
                    <CardDescription>All files ready for download and deployment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.generated_code.files.map((file: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-mono text-foreground">{file.path}</span>
                            {file.description && (
                              <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadFile(file.path, file.content)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                        <pre className="text-xs font-mono bg-secondary p-4 overflow-x-auto border-2 border-border max-h-96">
                          <code>{file.content}</code>
                        </pre>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
