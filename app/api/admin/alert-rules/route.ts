import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AlertRule } from '@/lib/services/alert-system';

/**
 * GET /api/admin/alert-rules
 * 
 * Get all alert rules
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

    const { data: rules, error } = await supabase
      .from('alert_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      rules: rules || [],
    });
  } catch (error: any) {
    console.error('Get alert rules error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alert rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/alert-rules
 * 
 * Create a new alert rule
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

    const body: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'> = await request.json();

    // Validate required fields
    if (!body.name || !body.alert_type || !body.severity || !body.conditions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .insert(body)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('Create alert rule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create alert rule' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/alert-rules
 * 
 * Update an alert rule
 * Body: { ruleId: string, updates: Partial<AlertRule> }
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

    const { ruleId, updates } = await request.json();

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabase
      .from('alert_rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('Update alert rule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update alert rule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/alert-rules
 * 
 * Delete an alert rule
 * Body: { ruleId: string }
 */
export async function DELETE(request: Request) {
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

    const { ruleId } = await request.json();

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Alert rule deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete alert rule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete alert rule' },
      { status: 500 }
    );
  }
}
