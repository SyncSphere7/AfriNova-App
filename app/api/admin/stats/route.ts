import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorStats } from '@/lib/services/error-tracking';

/**
 * GET /api/admin/stats
 * 
 * Get system-wide statistics for monitoring
 * Requires admin authentication
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you should have an admin role in your database)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // For now, allow any authenticated user (TODO: Add admin check)
    // if (profile?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Get various statistics
    const [
      usersCount,
      projectsCount,
      subscriptionsCount,
      apiKeysCount,
      generationsCount,
      errorStats,
    ] = await Promise.all([
      // Total users
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      
      // Total projects
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      
      // Active subscriptions
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Total API keys
      supabase.from('api_keys').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      
      // Generations this month
      supabase.from('generations').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      
      // Error statistics
      getErrorStats(7),
    ]);

    // Get subscription revenue (rough estimate)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('tier, billing_cycle')
      .eq('status', 'active');

    const revenueEstimate = subscriptions?.reduce((total, sub) => {
      const prices: Record<string, Record<string, number>> = {
        starter: { monthly: 15, annual: 144 },
        growth: { monthly: 35, annual: 336 },
        pro: { monthly: 75, annual: 720 },
      };
      
      const price = prices[sub.tier as keyof typeof prices]?.[sub.billing_cycle || 'monthly'] || 0;
      return total + (sub.billing_cycle === 'annual' ? price / 12 : price);
    }, 0) || 0;

    // Get recent activity
    const { data: recentProjects } = await supabase
      .from('projects')
      .select('id, name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get top users by generations
    const { data: topUsers } = await supabase
      .from('subscriptions')
      .select('user_id, generations_used, profiles(full_name, email)')
      .order('generations_used', { ascending: false })
      .limit(10);

    return NextResponse.json({
      overview: {
        totalUsers: usersCount.count || 0,
        totalProjects: projectsCount.count || 0,
        activeSubscriptions: subscriptionsCount.count || 0,
        activeApiKeys: apiKeysCount.count || 0,
        generationsThisMonth: generationsCount.count || 0,
        estimatedMRR: Math.round(revenueEstimate),
      },
      errors: errorStats,
      recentActivity: recentProjects,
      topUsers: topUsers?.map(u => ({
        userId: u.user_id,
        name: (u.profiles as any)?.full_name,
        email: (u.profiles as any)?.email,
        generationsUsed: u.generations_used,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
