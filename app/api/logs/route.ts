// app/api/logs/route.ts
// API endpoint for creating log entries

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for bypassing RLS
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_category, metadata, user_id } = body;

    // Validate required fields
    if (!event_type || !event_category) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, event_category' },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // Insert log entry
    const { data, error } = await supabaseAdmin
      .from('logs')
      .insert({
        event_type,
        event_category,
        metadata: metadata || {},
        user_id: user_id || null,
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create log:', error);
      return NextResponse.json(
        { error: 'Failed to create log entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, log: data }, { status: 201 });
  } catch (error) {
    console.error('Error in logs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
