import Link from 'next/link';
import { Plus, Folder } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Project } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-pixel uppercase mb-2">Your Projects</h1>
          <p className="text-muted-foreground font-sans">
            Manage and view all your generated projects.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-pixel uppercase mb-2">No Projects Found</h3>
            <p className="text-sm text-muted-foreground font-sans mb-4">
              Get started by creating your first project
            </p>
            <Link href="/dashboard/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:shadow-pixel-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <span
                      className={`text-xs font-pixel uppercase px-2 py-1 border-2 border-foreground ${
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
                  <p className="text-sm text-muted-foreground font-sans line-clamp-3">
                    {project.description || 'No description'}
                  </p>
                  <div className="pt-4 text-xs text-muted-foreground font-sans">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
