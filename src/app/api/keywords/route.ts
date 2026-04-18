import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM keywords ORDER BY label");
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
    const { label, color } = await req.json();
    if (!label || !color) {
      return NextResponse.json(
        { error: "Label and color are required" },
        { status: 400 },
      );
    }

    // Auto-generate code from label
    const code = label.trim().toUpperCase().replace(/\s+/g, "_").slice(0, 10);

    // Check if code already exists
    const existing = await pool.query(
      "SELECT id FROM keywords WHERE code = $1",
      [code],
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "A keyword with this name already exists" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "INSERT INTO keywords (code, label, color) VALUES ($1, $2, $3) RETURNING *",
      [code, label.trim(), color],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create keyword" },
      { status: 500 },
    );
  }
}
