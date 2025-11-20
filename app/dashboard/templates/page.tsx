'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, TrendingUp, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

interface ProjectTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  preview_image_url: string | null;
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    styling: string;
    payments: string[];
    integrations: string[];
  };
  features: string[];
  complexity: string;
  estimated_time: number;
  default_prompt: string;
  is_popular: boolean;
  is_featured: boolean;
  usage_count: number;
  tags: string[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedCategory, templates]);

  async function loadTemplates() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('is_popular', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      setFilteredTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterTemplates() {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }

  function getComplexityColor(complexity: string) {
    switch (complexity) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="LOADING TEMPLATES..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-pixel uppercase mb-2">Project Templates</h1>
        <p className="text-muted-foreground font-sans">
          Start with a pre-built template to speed up your development
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm">
          {templates.length} Templates
        </Badge>
        <Badge variant="outline" className="text-sm">
          {templates.filter(t => t.is_popular).length} Popular
        </Badge>
        <Badge variant="outline" className="text-sm">
          {templates.filter(t => t.is_featured).length} Featured
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="flex-wrap h-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {cat === 'all' ? 'All' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredTemplates.filter(t => t.is_featured).length > 0 && (
        <div>
          <h2 className="text-xl font-pixel uppercase mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.is_featured).map(template => (
              <Card key={template.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <div className="flex gap-1">
                      {template.is_popular && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>~{template.estimated_time} min generation</span>
                    </div>
                    {template.features.length > 0 && (
                      <div className="space-y-1">
                        {template.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {template.features.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{template.features.length - 3} more features
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/dashboard/new?template=${template.slug}`)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-pixel uppercase mb-4">
          {selectedCategory === 'all' ? 'All Templates' : `${selectedCategory} Templates`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.filter(t => !t.is_featured || selectedCategory !== 'all').map(template => (
            <Card key={template.id} className="hover:border-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  {template.is_popular && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~{template.estimated_time} min generation</span>
                  </div>
                  {template.features.length > 0 && (
                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{template.features.length - 3} more features
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/new?template=${template.slug}`)}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No templates found matching your criteria</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
