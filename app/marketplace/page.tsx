/**
 * Marketplace Home Page
 * Browse and search app templates
 */

'use client';

import { useState, useEffect } from 'react';
import { getMarketplaceApps, getFeaturedApps, MarketplaceApp, AppCategory } from '@/lib/services/marketplace';
import { AppGrid } from '@/components/marketplace/app-card';
import { CategoryFilter, PriceFilter } from '@/components/marketplace/category-filter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, TrendingUp, Zap, Star } from 'lucide-react';

export default function MarketplacePage() {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [featuredApps, setFeaturedApps] = useState<MarketplaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>();
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadApps();
    loadFeaturedApps();
  }, [selectedCategory, minPrice, maxPrice, searchQuery]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const data = await getMarketplaceApps({
        category: selectedCategory,
        minPrice,
        maxPrice,
        query: searchQuery || undefined,
      });
      setApps(data);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedApps = async () => {
    try {
      const data = await getFeaturedApps(6);
      setFeaturedApps(data);
    } catch (error) {
      console.error('Error loading featured apps:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-4xl uppercase mb-4">
          🛒 App Marketplace
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse pre-built app templates powered by AI. Purchase, customize, and
          deploy in minutes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-foreground p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="font-pixel text-2xl mb-1">{apps.length}</div>
          <div className="text-xs text-muted-foreground uppercase">Templates</div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="font-pixel text-2xl mb-1">24h</div>
          <div className="text-xs text-muted-foreground uppercase">Delivery</div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="font-pixel text-2xl mb-1">4.8</div>
          <div className="text-xs text-muted-foreground uppercase">Avg Rating</div>
        </Card>
      </div>

      {/* Featured Apps */}
      {featuredApps.length > 0 && !selectedCategory && !searchQuery && (
        <div className="mb-12">
          <h2 className="font-pixel text-2xl uppercase mb-4">⭐ Featured</h2>
          <AppGrid apps={featuredApps.slice(0, 3)} />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-foreground font-mono"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-2 uppercase font-pixel"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="space-y-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
            />
          </div>
        )}

        {/* Apps Grid */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {loading ? (
            <Card className="border-2 border-foreground p-12 text-center">
              <div className="animate-pulse">
                <div className="font-pixel text-lg uppercase">Loading...</div>
              </div>
            </Card>
          ) : (
            <AppGrid
              apps={apps}
              emptyMessage="No templates found. Try adjusting your filters."
            />
          )}
        </div>
      </div>
    </div>
  );
}
