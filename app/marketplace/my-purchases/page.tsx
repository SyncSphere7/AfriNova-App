/**
 * My Purchases Page
 * View purchased apps and download templates
 */

import { getUserPurchases } from '@/lib/services/marketplace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Download, ExternalLink, Code, Package } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyPurchasesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/marketplace/my-purchases');
  }

  const purchases = await getUserPurchases();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-4xl uppercase mb-4">
          📦 My Purchases
        </h1>
        <p className="text-lg text-muted-foreground">
          Access your purchased templates and download source code anytime.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-foreground p-4 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="font-pixel text-2xl mb-1">{purchases.length}</div>
          <div className="text-xs text-muted-foreground uppercase">
            Total Apps
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="font-pixel text-2xl mb-1">
            {purchases.reduce((sum, p) => sum + p.download_count, 0)}
          </div>
          <div className="text-xs text-muted-foreground uppercase">
            Downloads
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Code className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="font-pixel text-2xl mb-1">Unlimited</div>
          <div className="text-xs text-muted-foreground uppercase">Access</div>
        </Card>
      </div>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <Card className="border-2 border-foreground p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="font-pixel text-lg uppercase mb-2">
            No Purchases Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse the marketplace to find templates for your next project.
          </p>
          <Link href="/marketplace">
            <Button className="border-2 uppercase font-pixel">
              Browse Marketplace
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card
              key={purchase.id}
              className="border-2 border-foreground overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* App Icon */}
                  <div className="text-5xl">{purchase.app?.icon}</div>

                  {/* App Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-pixel text-xl uppercase mb-1">
                          {purchase.app?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {purchase.app?.tagline}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-2 border-green-500 bg-green-500/20 uppercase font-pixel text-xs"
                      >
                        Purchased
                      </Badge>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {purchase.app?.tech_stack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="border uppercase font-pixel text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        Purchased:{' '}
                        {new Date(purchase.purchased_at).toLocaleDateString()}
                      </div>
                      <div>Downloads: {purchase.download_count}</div>
                      {purchase.last_downloaded_at && (
                        <div>
                          Last download:{' '}
                          {new Date(
                            purchase.last_downloaded_at
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="border-2 uppercase font-pixel text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Download Code
                      </Button>
                      <Link href={`/marketplace/${purchase.app?.slug}`}>
                        <Button
                          variant="outline"
                          className="border-2 uppercase font-pixel text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      {purchase.app?.demo_url && (
                        <Button
                          variant="outline"
                          className="border-2 uppercase font-pixel text-xs"
                          asChild
                        >
                          <a
                            href={purchase.app.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="border-2 border-foreground p-6 mt-8">
        <h3 className="font-pixel text-lg uppercase mb-3">Need Help?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Download Limit:</strong> Unlimited downloads for all
              purchased apps
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Updates:</strong> Get free lifetime updates when we improve
              the template
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Support:</strong> Email support@afrinova.com for assistance
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Customization:</strong> Use our AI assistant to customize
              templates in 20+ languages
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
