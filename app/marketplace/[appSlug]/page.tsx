/**
 * App Detail Page
 * View app details, reviews, and purchase
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getApp,
  getAppReviews,
  hasPurchased,
  MarketplaceApp,
  AppReview,
} from '@/lib/services/marketplace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewCard, ReviewSummary } from '@/components/marketplace/review-card';
import { PurchaseModal } from '@/components/marketplace/purchase-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Download,
  ExternalLink,
  ShoppingCart,
  CheckCircle2,
  Package,
  Code,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface AppPageProps {
  params: {
    appSlug: string;
  };
}

export default function AppPage({ params }: AppPageProps) {
  const router = useRouter();
  const [app, setApp] = useState<MarketplaceApp | null>(null);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadApp();
  }, [params.appSlug]);

  const loadApp = async () => {
    try {
      setLoading(true);
      const appData = await getApp(params.appSlug);
      setApp(appData);

      const reviewsData = await getAppReviews(appData.id);
      setReviews(reviewsData);

      const isPurchased = await hasPurchased(appData.id);
      setPurchased(isPurchased);
    } catch (error) {
      console.error('Error loading app:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-2 border-foreground p-12 text-center">
          <div className="animate-pulse">
            <div className="font-pixel text-lg uppercase">Loading...</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:text-foreground">
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-foreground">{app.name}</span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-foreground p-6">
            <div className="flex items-start gap-6">
              <div className="text-6xl">{app.icon}</div>
              <div className="flex-1">
                <h1 className="font-pixel text-3xl uppercase mb-2">{app.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{app.tagline}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-mono text-lg">
                      {app.rating_average > 0 ? app.rating_average.toFixed(1) : 'New'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({app.rating_count})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="w-5 h-5" />
                    <span className="font-mono">{app.downloads_count} downloads</span>
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-2 p-3 border-2 border-foreground bg-muted">
                  <Avatar className="w-8 h-8 border-2 border-foreground">
                    <AvatarImage src={app.seller?.avatar_url} />
                    <AvatarFallback className="font-pixel text-xs">
                      {app.seller?.full_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs text-muted-foreground">Created by</div>
                    <div className="font-medium">{app.seller?.full_name || 'Seller'}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Purchase Card */}
        <div>
          <Card className="border-2 border-foreground p-6 sticky top-4">
            {purchased ? (
              <>
                <div className="text-center mb-4">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <div className="font-pixel text-lg uppercase text-green-500">
                    Purchased
                  </div>
                </div>
                <Link href="/marketplace/my-purchases">
                  <Button className="w-full border-2 uppercase font-pixel mb-2">
                    <Package className="w-4 h-4 mr-2" />
                    View in Library
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-2 uppercase font-pixel"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Download Code
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  {app.is_free ? (
                    <div className="font-pixel text-3xl text-green-500 text-center">
                      FREE
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="font-pixel text-3xl">
                        {app.currency} {app.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        One-time payment
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full border-2 uppercase font-pixel mb-2"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {app.is_free ? 'Get Free' : 'Purchase'}
                </Button>

                {app.demo_url && (
                  <Button
                    variant="outline"
                    className="w-full border-2 uppercase font-pixel"
                    asChild
                  >
                    <a href={app.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </>
            )}

            {/* What's Included */}
            <div className="mt-6 pt-6 border-t-2 border-foreground">
              <h4 className="font-pixel text-xs uppercase mb-3">What's Included</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Full source code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Lifetime updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Documentation</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="border-2 border-foreground">
          <TabsTrigger value="overview" className="font-pixel text-xs uppercase">
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="font-pixel text-xs uppercase">
            Features
          </TabsTrigger>
          <TabsTrigger value="reviews" className="font-pixel text-xs uppercase">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-2 border-foreground p-6">
            <h3 className="font-pixel text-xl uppercase mb-4">Description</h3>
            <div className="prose prose-invert max-w-none">
              <p>{app.description}</p>
            </div>

            {/* Tech Stack */}
            <div className="mt-6 pt-6 border-t-2 border-foreground">
              <h4 className="font-pixel text-sm uppercase mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {app.tech_stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="border-2 uppercase font-pixel text-xs"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="border-2 border-foreground p-6">
            <h3 className="font-pixel text-xl uppercase mb-4">Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {app.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            <ReviewSummary
              ratingAverage={app.rating_average}
              ratingCount={app.rating_count}
            />

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-foreground p-12 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <p className="text-muted-foreground">No reviews yet</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Modal */}
      <PurchaseModal
        app={app}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => {
          setPurchased(true);
          router.push('/marketplace/my-purchases');
        }}
      />
    </div>
  );
}
