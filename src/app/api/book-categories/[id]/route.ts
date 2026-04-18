import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await pool.query("DELETE FROM book_categories WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
