import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "oreo123";

export async function GET(request: NextRequest) {
  try {
    const password = request.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              snippets: {
                where: { deletedAt: null },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      user_id: u.id,
      email: u.email,
      username: u.username || u.name,
      display_name: u.name,
      avatar_url: u.image,
      created_at: u.createdAt.toISOString(),
      snippet_count: u._count.snippets,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
