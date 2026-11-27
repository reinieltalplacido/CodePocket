import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "oreo123";

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalLogs, totalUsers, totalSnippets, oldestLog] = await Promise.all([
      prisma.log.count(),
      prisma.user.count(),
      prisma.snippet.count({ where: { deletedAt: null } }),
      prisma.log.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    const uptime = oldestLog
      ? Math.floor((Date.now() - new Date(oldestLog.createdAt).getTime()) / 1000 / 60 / 60 / 24)
      : 0;

    return NextResponse.json({
      system: {
        appVersion: "1.0.0",
        databaseStatus: "healthy",
        uptime: `${uptime} days`,
        totalLogs: totalLogs || 0,
        totalUsers: totalUsers || 0,
        totalSnippets: totalSnippets || 0,
      },
      security: {
        adminPasswordSet: !!process.env.ADMIN_PASSWORD,
        sessionTimeout: "24 hours",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    switch (action) {
      case "clear_old_logs": {
        await prisma.log.deleteMany({
          where: { createdAt: { lt: thirtyDaysAgo } },
        });
        return NextResponse.json({ success: true, message: "Old logs cleared" });
      }

      case "clear_deleted_snippets": {
        await prisma.snippet.deleteMany({
          where: {
            deletedAt: {
              not: null,
              lt: thirtyDaysAgo,
            },
          },
        });
        return NextResponse.json({ success: true, message: "Deleted snippets cleared" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Settings action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform action" },
      { status: 500 },
    );
  }
}
