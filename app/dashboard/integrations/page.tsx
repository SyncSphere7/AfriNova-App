'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Zap, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  getIntegrations,
  getIntegrationCategories,
  getUserIntegrations,
  getIntegrationsByCategory,
} from '@/lib/services/integrations';
import type { Integration, IntegrationCategory, UserIntegration } from '@/types/integrations';
import Link from 'next/link';

export default function IntegrationsMarketplace() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [categories, setCategories] = useState<IntegrationCategory[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [viewMode, setViewMode] = useState<'all' | 'connected'>('all');

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  async function loadData() {
    try {
      setLoading(true);
      const [integrationsData, categoriesData, userIntegrationsData] = await Promise.all([
        getIntegrations({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus === 'active' ? 'active' : undefined,
        }),
        getIntegrationCategories(),
        getUserIntegrations(),
      ]);

      setIntegrations(integrationsData);
      setCategories(categoriesData);
      setUserIntegrations(userIntegrationsData);
    } catch (error: any) {
      toast({
        title: 'Error loading integrations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (viewMode === 'connected') {
      const isConnected = userIntegrations.some(ui => ui.integration_id === integration.id);
      return matchesSearch && isConnected;
    }

    return matchesSearch;
  });

  const integrationsByCategory = getIntegrationsByCategory(filteredIntegrations);
  const connectedIntegrationIds = new Set(userIntegrations.map(ui => ui.integration_id));

  function isConnected(integrationId: string): boolean {
    return connectedIntegrationIds.has(integrationId);
  }

  function getStatusBadge(integration: Integration) {
    switch (integration.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'beta':
        return <Badge variant="secondary">Beta</Badge>;
      case 'coming_soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return null;
    }
  }

  function getTierBadge(tier: string) {
    const colors: Record<string, string> = {
      free: 'bg-blue-500',
      starter: 'bg-purple-500',
      growth: 'bg-orange-500',
      pro: 'bg-red-500',
      enterprise: 'bg-gray-800',
    };

    return (
      <Badge className={colors[tier] || 'bg-gray-500'}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-pixel uppercase mb-2">Integration Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Browse 160+ integrations to supercharge your applications
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline" className="text-sm">
            {integrations.length} Total Integrations
          </Badge>
          <Badge variant="outline" className="text-sm">
            {userIntegrations.length} Connected
          </Badge>
          <Badge variant="outline" className="text-sm">
            {categories.length} Categories
          </Badge>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="connected">Connected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {Object.entries(integrationsByCategory).map(([categoryName, categoryIntegrations]) => (
        <div key={categoryName} className="mb-12">
          <h2 className="text-2xl font-pixel uppercase mb-4 flex items-center gap-2">
            {categoryIntegrations[0]?.category?.icon} {categoryName}
            <span className="text-sm text-muted-foreground font-sans normal-case">
              ({categoryIntegrations.length})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryIntegrations.map(integration => (
              <Card key={integration.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {integration.logo_url && (
                        <img
                          src={integration.logo_url}
                          alt={integration.name}
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    {isConnected(integration.id) && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getStatusBadge(integration)}
                    {getTierBadge(integration.tier_required)}
                    {integration.is_popular && <Badge variant="secondary">Popular</Badge>}
                    {integration.is_recommended && <Badge variant="secondary">Recommended</Badge>}
                  </div>

                  {integration.features && integration.features.length > 0 && (
                    <div className="space-y-1">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{integration.estimated_setup_time_minutes} min setup</span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Link href={`/dashboard/integrations/${integration.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  {isConnected(integration.id) ? (
                    <Button size="sm" variant="secondary" className="flex-1">
                      Manage
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1">
                      Connect
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No integrations found matching your criteria</p>
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
