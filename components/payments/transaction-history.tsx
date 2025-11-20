'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_gateway: string;
  gateway_reference: string;
  created_at: string;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-500 border-blue-500';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner text="Loading transactions..." />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-sans">
            No transactions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border-2 border-foreground/10 hover:border-foreground/20 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-pixel uppercase">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </span>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-pixel">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
                <p className="text-xs text-muted-foreground font-pixel">
                  Ref: {transaction.gateway_reference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-pixel uppercase text-muted-foreground">
                  {transaction.payment_gateway}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
