import { NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { exec } from "child_process";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
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

    const jobId = randomUUID();
    await pool.query(
      "INSERT INTO recommendation_jobs (id, user_id, status) VALUES ($1, $2, 'pending')",
      [jobId, userId],
    );

    const scriptPath = path.join(
      process.cwd(),
      "recommendation",
      "recommend.py",
    );
    exec(
      `python "${scriptPath}" --user_id ${userId} --json`,
      {
        cwd: path.join(process.cwd(), "recommendation"),
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        timeout: 600000,
      },
      async (error, stdout) => {
        if (error) {
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'failed', finished_at = NOW() WHERE id = $1",
            [jobId],
          );
          return;
        }
        try {
          const lines = stdout.trim().split("\n");
          const jsonLine = lines.find((line) => line.trim().startsWith("{"));
          if (!jsonLine) throw new Error("No JSON output from Python");
          const recommendations = JSON.parse(jsonLine);
          await pool.query(
            `INSERT INTO recommendation_cache (user_id, data)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET data = $2, created_at = NOW()`,
            [userId, JSON.stringify(recommendations)],
          );
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'done', finished_at = NOW() WHERE id = $1",
            [jobId],
          );
        } catch {
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'failed', finished_at = NOW() WHERE id = $1",
            [jobId],
          );
        }
      },
    );

    return NextResponse.json({ jobId, status: "pending" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to start job" }, { status: 500 });
  }
}
