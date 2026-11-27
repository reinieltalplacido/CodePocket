import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, event_category, metadata, user_id } = body;

    if (!event_type || !event_category) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, event_category' },
        { status: 400 }
      );
    }

    let resolvedUserId = user_id;
    if (!resolvedUserId) {
      const authUser = await getAuthenticatedUser();
      resolvedUserId = authUser?.id || null;
    }

    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    const log = await prisma.log.create({
      data: {
        eventType: event_type,
        eventCategory: event_category,
        metadata: metadata || {},
        userId: resolvedUserId,
        ipAddress: ip_address,
        userAgent: user_agent,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error logging event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
