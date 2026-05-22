import { NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export const dynamic = "force-dynamic"; // ← add this

async function getUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const result = await pool.query("SELECT id FROM users WHERE email = $1", [
    session.user.email,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await pool.query(
      "SELECT * FROM recommendation_dismissed WHERE user_id = $1 ORDER BY dismissed_at DESC",
      [userId],
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch dismissed" },
      { status: 500 },
    );
  }
}
