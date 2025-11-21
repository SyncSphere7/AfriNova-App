/**
 * Currency Switcher Component
 * Allow users to manually select their preferred currency
 */

'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DollarSign } from 'lucide-react';
import { useCurrency } from '@/lib/utils/currency-context';
import { getAllCurrencies, type CurrencyCode } from '@/lib/utils/currency';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const currencies = getAllCurrencies();

  // Group currencies by region
  const eastAfrica = currencies.filter(c => 
    ['KES', 'TZS', 'UGX', 'RWF'].includes(c.code)
  );
  const africa = currencies.filter(c => 
    ['ZAR', 'NGN', 'EGP'].includes(c.code)
  );
  const international = currencies.filter(c => 
    ['USD', 'EUR', 'GBP'].includes(c.code)
  );
  const middleEast = currencies.filter(c => 
    ['AED', 'SAR'].includes(c.code)
  );
  const asia = currencies.filter(c => 
    ['INR', 'CNY', 'JPY'].includes(c.code)
  );
  const americas = currencies.filter(c => 
    ['BRL'].includes(c.code)
  );

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-foreground hover:bg-muted font-mono text-xs"
        >
          <DollarSign className="w-3 h-3 mr-1" />
          {currentCurrency?.symbol} {currency}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-2 border-foreground w-72 p-0" align="end">
        <div className="p-3 border-b-2 border-foreground bg-muted">
          <h3 className="font-pixel text-xs uppercase">Select Currency</h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {/* East Africa (Pesapal markets) */}
          <div className="p-2 border-b border-muted">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              East Africa
            </div>
            {eastAfrica.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>

          {/* International */}
          <div className="p-2 border-b border-muted">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              International
            </div>
            {international.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>

          {/* Africa */}
          <div className="p-2 border-b border-muted">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              Africa
            </div>
            {africa.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>

          {/* Middle East */}
          <div className="p-2 border-b border-muted">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              Middle East
            </div>
            {middleEast.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>

          {/* Asia */}
          <div className="p-2 border-b border-muted">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              Asia
            </div>
            {asia.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>

          {/* Americas */}
          <div className="p-2">
            <div className="text-xs text-muted-foreground uppercase font-pixel mb-2 px-2">
              Americas
            </div>
            {americas.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center justify-between text-sm ${
                  currency === curr.code ? 'bg-primary text-primary-foreground font-pixel' : ''
                }`}
              >
                <span>
                  {curr.symbol} {curr.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {curr.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
