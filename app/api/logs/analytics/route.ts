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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query for logs with pagination
    let logsQuery = supabaseAdmin
      .from('logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category && category !== 'all') {
      logsQuery = logsQuery.eq('event_category', category);
    }

    if (startDate) {
      logsQuery = logsQuery.gte('created_at', startDate);
    }

    if (endDate) {
      // Add one day to endDate to include the entire day
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      logsQuery = logsQuery.lt('created_at', endDateTime.toISOString());
    }

    const { data: logs, error, count } = await logsQuery;

    if (error) {
      console.error('Failed to fetch logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Get analytics summary (with same filters but no pagination)
    let summaryQuery = supabaseAdmin
      .from('logs')
      .select('event_category, event_type');

    if (category && category !== 'all') {
      summaryQuery = summaryQuery.eq('event_category', category);
    }

    if (startDate) {
      summaryQuery = summaryQuery.gte('created_at', startDate);
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      summaryQuery = summaryQuery.lt('created_at', endDateTime.toISOString());
    }

    const { data: summary } = await summaryQuery;

    const analytics = {
      totalEvents: count || 0,
      byCategory: summary?.reduce((acc: any, log: any) => {
        acc[log.event_category] = (acc[log.event_category] || 0) + 1;
        return acc;
      }, {}) || {},
      recentLogs: logs || [],
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
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
