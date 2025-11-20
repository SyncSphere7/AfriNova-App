/**
 * Review Card Component
 * Display user review with rating and helpful votes
 */

import { AppReview } from '@/lib/services/marketplace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

interface ReviewCardProps {
  review: AppReview;
  onMarkHelpful?: (reviewId: string) => void;
  showSellerResponse?: boolean;
}

export function ReviewCard({
  review,
  onMarkHelpful,
  showSellerResponse = true,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(review.id);
      setIsHelpful(!isHelpful);
    }
  };

  return (
    <Card className="border-2 border-foreground p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-foreground">
            <AvatarImage src={review.user?.avatar_url} />
            <AvatarFallback className="font-pixel text-xs">
              {review.user?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {review.user?.full_name || 'Anonymous'}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          {review.is_verified_purchase && (
            <Badge
              variant="outline"
              className="border uppercase font-pixel text-xs"
            >
              ✓ Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-3">
        <h4 className="font-pixel text-sm uppercase mb-2">{review.title}</h4>
        <p className="text-sm text-muted-foreground">{review.content}</p>
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((image, i) => (
            <img
              key={i}
              src={image}
              alt={`Review image ${i + 1}`}
              className="w-20 h-20 object-cover border-2 border-foreground"
            />
          ))}
        </div>
      )}

      {/* Seller Response */}
      {showSellerResponse && review.seller_response && (
        <Card className="border-2 border-primary bg-primary/10 p-3 mb-3">
          <div className="flex items-start gap-2">
            <Badge
              variant="outline"
              className="border-2 border-primary uppercase font-pixel text-xs"
            >
              Seller
            </Badge>
            <div className="flex-1">
              <p className="text-sm">{review.seller_response}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(review.seller_response_at!).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t-2 border-foreground">
        <Button
          variant="outline"
          size="sm"
          className={`border-2 uppercase font-pixel text-xs ${
            isHelpful ? 'bg-primary' : ''
          }`}
          onClick={handleMarkHelpful}
        >
          <ThumbsUp className="w-3 h-3 mr-1" />
          Helpful ({review.helpful_count + (isHelpful ? 1 : 0)})
        </Button>
      </div>
    </Card>
  );
}

/**
 * Review Summary Component
 */
interface ReviewSummaryProps {
  ratingAverage: number;
  ratingCount: number;
  ratingBreakdown?: number[]; // [5-star count, 4-star, 3-star, 2-star, 1-star]
}

export function ReviewSummary({
  ratingAverage,
  ratingCount,
  ratingBreakdown = [0, 0, 0, 0, 0],
}: ReviewSummaryProps) {
  return (
    <Card className="border-2 border-foreground p-6">
      <div className="flex items-start gap-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="font-pixel text-4xl mb-2">
            {ratingAverage > 0 ? ratingAverage.toFixed(1) : 'N/A'}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(ratingAverage)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingBreakdown[5 - stars] || 0;
            const percentage =
              ratingCount > 0 ? (count / ratingCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-mono">{stars}</span>
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1 h-3 bg-muted border border-foreground">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
