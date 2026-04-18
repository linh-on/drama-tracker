import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await pool.query("DELETE FROM show_keywords WHERE keyword_id = $1", [id]);
    await pool.query("DELETE FROM keywords WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete keyword" },
      { status: 500 },
    );
  }
}
