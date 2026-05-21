import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const result = await pool.query(
      "SELECT status, finished_at FROM recommendation_jobs WHERE id = $1",
      [jobId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 },
    );
  }
}
