import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

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

    // Return cached data
    const cached = await pool.query(
      "SELECT data, created_at FROM recommendation_cache WHERE user_id = $1",
      [userId],
    );

    if (cached.rows.length === 0) {
      return NextResponse.json({ _no_cache: true });
    }

    return NextResponse.json({
      ...cached.rows[0].data,
      _cached_at: cached.rows[0].created_at,
    });
  } catch (err) {
    console.error("Recommendations GET error:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
