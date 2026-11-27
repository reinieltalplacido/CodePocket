import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== (process.env.ADMIN_PASSWORD || 'oreo123')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'all') {
      where.eventCategory = category;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        where.createdAt.lt = endDateTime;
      }
    }

    const [logs, count, categoryGroups] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.log.count({ where }),
      prisma.log.groupBy({
        by: ['eventCategory'],
        where,
        _count: { eventCategory: true },
      }),
    ]);

    const byCategory = categoryGroups.reduce((acc: Record<string, number>, row) => {
      acc[row.eventCategory] = row._count.eventCategory;
      return acc;
    }, {});

    const recentLogs = logs.map((l) => ({
      id: l.id,
      event_type: l.eventType,
      event_category: l.eventCategory,
      metadata: l.metadata,
      user_id: l.userId,
      ip_address: l.ipAddress,
      user_agent: l.userAgent,
      created_at: l.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalEvents: count,
      byCategory,
      recentLogs,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
