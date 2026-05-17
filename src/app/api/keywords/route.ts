import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";

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
      "SELECT * FROM keywords WHERE user_id = $1 ORDER BY label",
      [userId],
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { label, color, tmdb_keyword_id } = await req.json();

    if (!label || !color || !tmdb_keyword_id) {
      return NextResponse.json(
        { error: "Label, color and TMDB keyword ID are required" },
        { status: 400 },
      );
    }

    const code = label.trim().toUpperCase().replace(/\s+/g, "_").slice(0, 50);

    // Check if already exists for this user
    const existing = await pool.query(
      "SELECT id FROM keywords WHERE tmdb_keyword_id = $1 AND user_id = $2",
      [tmdb_keyword_id, userId],
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "You already have this keyword" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "INSERT INTO keywords (code, label, color, user_id, tmdb_keyword_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [code, label.trim(), color, userId, tmdb_keyword_id],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create keyword" },
      { status: 500 },
    );
  }
}
