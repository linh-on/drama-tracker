import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM book_categories ORDER BY label",
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { label } = await req.json();
    if (!label)
      return NextResponse.json({ error: "Label is required" }, { status: 400 });

    const code = label
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "")
      .slice(0, 50);

    const existing = await pool.query(
      "SELECT id FROM book_categories WHERE code = $1",
      [code],
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "INSERT INTO book_categories (code, label) VALUES ($1, $2) RETURNING *",
      [code, label.trim()],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
