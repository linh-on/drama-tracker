import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM keywords ORDER BY code");
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch keywords" }, { status: 500 });
  }
}