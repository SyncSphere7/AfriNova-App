import Link from 'next/link';
import { Plus, Folder, TrendingUp, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle();

  const { data: projects, count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: templates } = await supabase
    .from('project_templates')
    .select('*')
    .eq('is_featured', true)
    .limit(3);

  const profileData = profile as Profile;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-pixel uppercase mb-2">
          Welcome Back, {profileData?.full_name || 'User'}
        </h1>
        <p className="text-muted-foreground font-sans">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-pixel uppercase text-muted-foreground mb-2">
                  Generations Used
                </p>
                <p className="text-2xl font-pixel">
                  {profileData?.generations_used || 0}/{profileData?.generations_limit || 5}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-pixel uppercase text-muted-foreground mb-2">
                  Projects
                </p>
                <p className="text-2xl font-pixel">{projectCount || 0}</p>
              </div>
              <Folder className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-pixel uppercase text-muted-foreground mb-2">
                  Plan
                </p>
                <p className="text-2xl font-pixel uppercase">{profileData?.subscription_tier || 'free'}</p>
              </div>
              <div className="h-8 w-8 bg-accent border-2 border-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-pixel uppercase mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/new">
            <Button size="lg" className="w-full">
              <Plus className="mr-2 h-5 w-5" />
              Create Project
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button size="lg" variant="outline" className="w-full">
              <Sparkles className="mr-2 h-5 w-5" />
              Browse Templates
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button size="lg" variant="outline" className="w-full">
              <Folder className="mr-2 h-5 w-5" />
              All Projects
            </Button>
          </Link>
        </div>
      </div>

      {templates && templates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-pixel uppercase flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Featured Templates
            </h2>
            <Link href="/dashboard/templates">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template: any) => (
              <Link key={template.id} href={`/dashboard/new?template=${template.slug}`}>
                <Card className="hover:shadow-pixel-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-pixel uppercase">Recent Projects</h2>
          {projectCount && projectCount > 0 && (
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>

        {!projects || projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-pixel uppercase mb-2">No Projects Yet</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
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
                    <p className="text-sm text-muted-foreground font-sans line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
