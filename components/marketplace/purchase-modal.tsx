/**
 * Purchase Modal Component
 * Handle app purchase and payment
 */

'use client';

import { useState } from 'react';
import { MarketplaceApp } from '@/lib/services/marketplace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/lib/utils/currency-context';
import { convertToUSD } from '@/lib/utils/currency';
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface PurchaseModalProps {
  app: MarketplaceApp;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PurchaseModal({
  app,
  isOpen,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const { toast } = useToast();
  const { currency, convertPrice, formatPrice } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Convert app price to user's currency
  const localPrice = app.is_free ? 0 : convertPrice(app.price);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      if (app.is_free) {
        // Free app - instant purchase
        // Call API to create purchase
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: '✅ Success!',
          description: `${app.name} has been added to your library.`,
        });

        onSuccess?.();
        onClose();
      } else {
        // Paid app - initiate Pesapal payment
        // In production: Call Pesapal API with user's currency
        const amountInUserCurrency = localPrice;
        
        toast({
          title: '💳 Redirecting to Payment',
          description: 'Please complete payment through Pesapal...',
        });

        // Simulate Pesapal redirect
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In production:
        // const response = await fetch('/api/marketplace/purchase', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     appId: app.id,
        //     amount: amountInUserCurrency,
        //     currency: currency,
        //     paymentMethod,
        //     phoneNumber: paymentMethod === 'mobile' ? phoneNumber : undefined
        //   })
        // });
        // const { redirectUrl } = await response.json();
        // window.location.href = redirectUrl;

        // Simulate success for demo
        setTimeout(() => {
          toast({
            title: '🎉 Payment Successful!',
            description: `${app.name} is now available in your library.`,
          });
          onSuccess?.();
          onClose();
        }, 3000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xl uppercase">
            Purchase App
          </DialogTitle>
          <DialogDescription>
            Complete your purchase to download and customize this template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* App Preview */}
          <div className="flex items-center gap-3 p-3 border-2 border-foreground bg-muted">
            <div className="text-3xl">{app.icon}</div>
            <div className="flex-1">
              <h4 className="font-pixel text-sm uppercase">{app.name}</h4>
              <p className="text-xs text-muted-foreground">{app.tagline}</p>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 border-2 border-foreground bg-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Price</span>
              {app.is_free ? (
                <span className="font-pixel text-2xl text-green-500">FREE</span>
              ) : (
                <span className="font-pixel text-2xl">
                  {formatPrice(localPrice, true)}
                </span>
              )}
            </div>
            {!app.is_free && (
              <div className="text-xs text-muted-foreground">
                One-time payment • Lifetime access • Powered by Pesapal
              </div>
            )}
          </div>

          {/* Payment Method */}
          {!app.is_free && (
            <div className="space-y-2">
              <label className="font-pixel text-xs uppercase">
                Payment Method
              </label>

              <button
                onClick={() => setPaymentMethod('mobile')}
                className={`w-full p-3 border-2 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-primary bg-primary'
                    : 'border-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Mobile Money</span>
                  <Badge
                    variant="outline"
                    className="ml-auto border uppercase font-pixel text-xs"
                  >
                    Recommended
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  M-Pesa, Airtel Money, Tigo Pesa
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3 border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary'
                    : 'border-foreground hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Visa, Mastercard, Amex
                </div>
              </button>

              {/* Phone Number Input for Mobile Money */}
              {paymentMethod === 'mobile' && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder={currency === 'KES' ? '254712345678' : 'Your phone number'}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-foreground bg-background font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive a payment prompt on your phone
                  </p>
                </div>
              )}
            </div>
          )}

          {/* What's Included */}
          <Alert className="border-2 border-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>
              <ul className="text-sm space-y-1 mt-2">
                <li>✓ Full source code</li>
                <li>✓ Lifetime updates</li>
                <li>✓ AI customization</li>
                <li>✓ Documentation</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 border-2 uppercase font-pixel"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || (!app.is_free && paymentMethod === 'mobile' && !phoneNumber)}
              className="flex-1 border-2 uppercase font-pixel"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {app.is_free ? 'Get Free' : 'Purchase'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
