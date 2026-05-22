import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export const dynamic = "force-dynamic"; // ← add this

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [session.user.email],
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const cached = await pool.query(
      "SELECT data, created_at FROM recommendation_cache WHERE user_id = $1",
      [userId],
    );

    if (cached.rows.length === 0) {
      return NextResponse.json({ _no_cache: true });
    }

    const dismissed = await pool.query(
      "SELECT tmdb_id FROM recommendation_dismissed WHERE user_id = $1",
      [userId],
    );
    const dismissedIds = new Set<number>(
      dismissed.rows.map((r: any) => Number(r.tmdb_id)),
    );

    const data = cached.rows[0].data;
    for (const country of Object.keys(data)) {
      const section = data[country];
      section.shows =
        section.shows?.filter(
          (s: any) => !dismissedIds.has(Number(s.tmdb_id)),
        ) ?? [];
      section.all_shows =
        section.all_shows?.filter(
          (s: any) => !dismissedIds.has(Number(s.tmdb_id)),
        ) ?? [];
      section.total = section.all_shows.length;
    }

    return NextResponse.json(
      { ...data, _cached_at: cached.rows[0].created_at },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (err) {
    console.error("Recommendations GET error:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
