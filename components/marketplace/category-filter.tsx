/**
 * Category Filter Component
 * Filter marketplace apps by category
 */

'use client';

import { AppCategory } from '@/lib/services/marketplace';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface CategoryFilterProps {
  selectedCategory?: AppCategory;
  onSelectCategory: (category?: AppCategory) => void;
}

const categories: { value: AppCategory; label: string; icon: string }[] = [
  { value: 'saas', label: 'SaaS', icon: '💼' },
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { value: 'blog', label: 'Blog', icon: '📝' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'dashboard', label: 'Dashboard', icon: '📊' },
  { value: 'landing', label: 'Landing Page', icon: '🚀' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'ai', label: 'AI/ML', icon: '🤖' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <Card className="border-2 border-foreground p-4">
      <h3 className="font-pixel text-sm uppercase mb-3">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`w-full text-left px-3 py-2 border-2 transition-all ${
            !selectedCategory
              ? 'border-primary bg-primary font-pixel'
              : 'border-foreground hover:bg-muted'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>🌟</span>
            <span className="text-sm">All Apps</span>
          </div>
        </button>

        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onSelectCategory(category.value)}
            className={`w-full text-left px-3 py-2 border-2 transition-all ${
              selectedCategory === category.value
                ? 'border-primary bg-primary font-pixel'
                : 'border-foreground hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span className="text-sm">{category.label}</span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

/**
 * Price Filter Component
 */
interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
}

export function PriceFilter({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceFilterProps) {
  const priceRanges = [
    { label: 'Free', min: 0, max: 0 },
    { label: 'Under KES 5,000', min: 0, max: 5000 },
    { label: 'KES 5,000 - 10,000', min: 5000, max: 10000 },
    { label: 'KES 10,000 - 20,000', min: 10000, max: 20000 },
    { label: 'Over KES 20,000', min: 20000, max: undefined },
  ];

  return (
    <Card className="border-2 border-foreground p-4">
      <h3 className="font-pixel text-sm uppercase mb-3">Price Range</h3>
      <div className="space-y-2">
        <button
          onClick={() => onPriceChange(undefined, undefined)}
          className={`w-full text-left px-3 py-2 border-2 transition-all ${
            minPrice === undefined && maxPrice === undefined
              ? 'border-primary bg-primary font-pixel'
              : 'border-foreground hover:bg-muted'
          }`}
        >
          <span className="text-sm">Any Price</span>
        </button>

        {priceRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => onPriceChange(range.min, range.max)}
            className={`w-full text-left px-3 py-2 border-2 transition-all ${
              minPrice === range.min && maxPrice === range.max
                ? 'border-primary bg-primary font-pixel'
                : 'border-foreground hover:bg-muted'
            }`}
          >
            <span className="text-sm">{range.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
