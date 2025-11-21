/**
 * Price Display Component
 * Client component for displaying prices with currency conversion
 */

'use client';

import { useCurrency } from '@/lib/utils/currency-context';

interface PriceDisplayProps {
  priceUSD: number;
  isFree: boolean;
  showCode?: boolean;
  className?: string;
}

export function PriceDisplay({ priceUSD, isFree, showCode = false, className = '' }: PriceDisplayProps) {
  const { convertPrice, formatPrice } = useCurrency();
  
  if (isFree) {
    return (
      <span className={`font-pixel text-green-500 ${className}`}>
        FREE
      </span>
    );
  }
  
  const localPrice = convertPrice(priceUSD);
  
  return (
    <span className={className}>
      {formatPrice(localPrice, showCode)}
    </span>
  );
}
