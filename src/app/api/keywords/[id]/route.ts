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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { color } = await req.json();
    await pool.query(
      "UPDATE keywords SET color = $1 WHERE id = $2 AND user_id = $3",
      [color, id, userId],
    );
    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update keyword" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await pool.query("DELETE FROM show_keywords WHERE keyword_id = $1", [id]);
    await pool.query("DELETE FROM book_keywords WHERE keyword_id = $1", [id]);
    await pool.query("DELETE FROM keywords WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete keyword" },
      { status: 500 },
    );
  }
}
