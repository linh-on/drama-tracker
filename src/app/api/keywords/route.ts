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

    const { label, color } = await req.json();
    if (!label || !color) {
      return NextResponse.json(
        { error: "Label and color are required" },
        { status: 400 },
      );
    }

    const code = label.trim().toUpperCase().replace(/\s+/g, "_").slice(0, 10);

    const existing = await pool.query(
      "SELECT id FROM keywords WHERE code = $1 AND user_id = $2",
      [code, userId],
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "A keyword with this name already exists" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "INSERT INTO keywords (code, label, color, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [code, label.trim(), color, userId],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create keyword" },
      { status: 500 },
    );
  }
}
