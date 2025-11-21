/**
 * App Card Component
 * Display marketplace app with pricing, rating, and stats
 */

import { MarketplaceApp } from '@/lib/services/marketplace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, Download, ShoppingCart, ExternalLink } from 'lucide-react';
import { PriceDisplay } from './price-display';

interface AppCardProps {
  app: MarketplaceApp;
  showPurchaseButton?: boolean;
}

export function AppCard({ app, showPurchaseButton = true }: AppCardProps) {
  const categoryColors: Record<string, string> = {
    saas: 'bg-blue-500',
    ecommerce: 'bg-green-500',
    blog: 'bg-purple-500',
    portfolio: 'bg-pink-500',
    social: 'bg-orange-500',
    dashboard: 'bg-cyan-500',
    landing: 'bg-yellow-500',
    mobile: 'bg-indigo-500',
    ai: 'bg-red-500',
    other: 'bg-gray-500',
  };

  return (
    <Card className="border-2 border-foreground hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative border-b-2 border-foreground bg-muted h-48 flex items-center justify-center">
        {app.thumbnail_url ? (
          <img
            src={app.thumbnail_url}
            alt={app.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">{app.icon}</div>
        )}
        {app.is_free && (
          <Badge className="absolute top-2 right-2 bg-green-500 border-2 border-foreground uppercase font-pixel text-xs">
            Free
          </Badge>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Category & Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            variant="outline"
            className={`border-2 ${categoryColors[app.category]} text-white uppercase font-pixel text-xs`}
          >
            {app.category}
          </Badge>
          {app.tech_stack.slice(0, 2).map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="border uppercase font-pixel text-xs"
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Title & Tagline */}
        <Link href={`/marketplace/${app.slug}`}>
          <h3 className="font-pixel text-base uppercase mb-2 hover:text-primary transition-colors">
            {app.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {app.tagline}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-mono">
              {app.rating_average > 0 ? app.rating_average.toFixed(1) : 'New'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Download className="w-4 h-4" />
            <span className="font-mono">{app.downloads_count}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-foreground">
          <PriceDisplay 
            priceUSD={app.price}
            isFree={app.is_free}
            className="font-pixel text-lg"
          />

          {showPurchaseButton && (
            <Link href={`/marketplace/${app.slug}`}>
              <Button
                size="sm"
                className="border-2 uppercase font-pixel text-xs"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                View
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * App Grid Component
 */
interface AppGridProps {
  apps: MarketplaceApp[];
  emptyMessage?: string;
}

export function AppGrid({ apps, emptyMessage = 'No apps found' }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <Card className="border-2 border-foreground p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
