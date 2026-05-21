import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [session.user.email],
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";

    // If not refreshing, return cached data
    if (!refresh) {
      const cached = await pool.query(
        "SELECT data, created_at FROM recommendation_cache WHERE user_id = $1",
        [userId],
      );
      if (cached.rows.length > 0) {
        return NextResponse.json({
          ...cached.rows[0].data,
          _cached_at: cached.rows[0].created_at,
        });
      }
    }

    // Run Python script
    const scriptPath = path.join(
      process.cwd(),
      "recommendation",
      "recommend.py",
    );
    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" --user_id ${userId} --json`,
      {
        cwd: path.join(process.cwd(), "recommendation"),
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      },
    );

    if (stderr) console.error("Python stderr:", stderr);

    const lines = stdout.trim().split("\n");
    const jsonLine = lines.find((line) => line.trim().startsWith("{"));
    if (!jsonLine) throw new Error("No JSON output from Python script");
    const recommendations = JSON.parse(jsonLine);

    // Save to cache
    await pool.query(
      `INSERT INTO recommendation_cache (user_id, data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET data = $2, created_at = NOW()`,
      [userId, JSON.stringify(recommendations)],
    );

    return NextResponse.json(recommendations);
  } catch (err: any) {
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
