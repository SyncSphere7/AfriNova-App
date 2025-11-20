'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink, Zap, Shield, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getIntegrationBySlug, connectIntegration, disconnectIntegration, getUserIntegration } from '@/lib/services/integrations';
import type { Integration, UserIntegration } from '@/types/integrations';

export default function IntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [integration, setIntegration] = useState<Integration | null>(null);
  const [userIntegration, setUserIntegration] = useState<UserIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    loadIntegration();
  }, [slug]);

  async function loadIntegration() {
    try {
      setLoading(true);
      const data = await getIntegrationBySlug(slug);
      setIntegration(data);

      if (data) {
        const userInt = await getUserIntegration(data.id);
        setUserIntegration(userInt);
        if (userInt?.credentials) {
          setCredentials(userInt.credentials);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error loading integration',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!integration) return;

    const requiredFields = integration.required_credentials || [];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing credentials',
        description: `Please provide: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setConnecting(true);
      await connectIntegration(integration.id, credentials);
      toast({
        title: 'Integration connected',
        description: `${integration.name} has been successfully connected`,
      });
      await loadIntegration();
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!integration || !userIntegration) return;

    try {
      setConnecting(true);
      await disconnectIntegration(userIntegration.id);
      toast({
        title: 'Integration disconnected',
        description: `${integration.name} has been disconnected`,
      });
      setUserIntegration(null);
      setCredentials({});
    } catch (error: any) {
      toast({
        title: 'Disconnection failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Integration not found</h1>
          <Button onClick={() => router.push('/dashboard/integrations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
        </div>
      </div>
    );
  }

  const isConnected = !!userIntegration;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/integrations')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Integrations
      </Button>

      <div className="mb-8">
        <div className="flex items-start gap-6">
          {integration.logo_url && (
            <img
              src={integration.logo_url}
              alt={integration.name}
              className="w-20 h-20 object-contain"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-pixel uppercase">{integration.name}</h1>
              {isConnected && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-4">{integration.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{integration.provider}</Badge>
              <Badge variant="outline">{integration.category?.name}</Badge>
              <Badge>{integration.tier_required}</Badge>
              {integration.is_popular && <Badge variant="secondary">Popular</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Setup Time</p>
                <p className="text-2xl font-bold">{integration.estimated_setup_time_minutes} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-2xl font-bold">Encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold capitalize">{integration.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {integration.features && integration.features.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integration.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            {isConnected
              ? 'Update your integration credentials'
              : 'Connect this integration by providing the required credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(integration.required_credentials || []).map(field => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>
                {field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Label>
              <Input
                id={field}
                type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('password') ? 'password' : 'text'}
                value={credentials[field] || ''}
                onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
                disabled={connecting}
              />
            </div>
          ))}

          {integration.documentation_url && (
            <div className="pt-4">
              <a
                href={integration.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline inline-flex items-center gap-1"
              >
                View documentation
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {isConnected ? (
          <>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="flex-1"
            >
              {connecting ? 'Updating...' : 'Update Credentials'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={connecting}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={connecting || integration.status === 'coming_soon'}
            className="flex-1"
          >
            {connecting ? 'Connecting...' : integration.status === 'coming_soon' ? 'Coming Soon' : 'Connect Integration'}
          </Button>
        )}
      </div>
    </div>
  );
}
