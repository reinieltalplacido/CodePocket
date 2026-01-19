// app/api/logs/analytics/route.ts
// API endpoint for fetching analytics data from logs

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    // Simple password check
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabaseAdmin
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('event_category', category);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Failed to fetch logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Get analytics summary
    const { data: summary } = await supabaseAdmin
      .from('logs')
      .select('event_category, event_type')
      .limit(10000);

    const analytics = {
      totalEvents: summary?.length || 0,
      byCategory: summary?.reduce((acc: any, log: any) => {
        acc[log.event_category] = (acc[log.event_category] || 0) + 1;
        return acc;
      }, {}),
      recentLogs: logs,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
