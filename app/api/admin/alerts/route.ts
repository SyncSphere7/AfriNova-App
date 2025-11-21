import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getUnresolvedAlerts, 
  resolveAlert, 
  createAlert,
  type Alert 
} from '@/lib/services/alert-system';

/**
 * GET /api/admin/alerts
 * 
 * Get alerts with filtering
 * Query params: resolved (true/false), severity, limit
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get('resolved');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error } = await query;

    if (error) {
      throw error;
    }

    // Get stats
    const { data: stats } = await supabase
      .from('alerts')
      .select('severity, resolved')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const alertStats = {
      total: stats?.length || 0,
      unresolved: stats?.filter(a => !a.resolved).length || 0,
      critical: stats?.filter(a => a.severity === 'critical').length || 0,
      warning: stats?.filter(a => a.severity === 'warning').length || 0,
      info: stats?.filter(a => a.severity === 'info').length || 0,
    };

    return NextResponse.json({
      alerts: alerts || [],
      stats: alertStats,
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/alerts
 * 
 * Create a custom alert
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const { title, message, severity = 'info', metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const alert = await createAlert({
      alert_type: 'custom',
      severity,
      title,
      message,
      metadata,
      resolved: false,
    });

    if (!alert) {
      throw new Error('Failed to create alert');
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create alert' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/alerts
 * 
 * Resolve an alert
 * Body: { alertId: string }
 */
export async function PATCH(request: Request) {
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

    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const success = await resolveAlert(alertId);

    if (!success) {
      throw new Error('Failed to resolve alert');
    }

    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
    });
  } catch (error: any) {
    console.error('Resolve alert error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}
