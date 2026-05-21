import { NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { exec } from "child_process";
import path from "path";
import { randomUUID } from "crypto";

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

    // Create a job
    const jobId = randomUUID();
    await pool.query(
      "INSERT INTO recommendation_jobs (id, user_id, status) VALUES ($1, $2, 'pending')",
      [jobId, userId],
    );

    // Run Python in background — don't await!
    const scriptPath = path.join(
      process.cwd(),
      "recommendation",
      "recommend.py",
    );
    const child = exec(
      `python "${scriptPath}" --user_id ${userId} --json`,
      {
        cwd: path.join(process.cwd(), "recommendation"),
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
        timeout: 600000, // 10 min max
      },
      async (error, stdout, stderr) => {
        if (error) {
          console.error("Python error:", error.message);
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'failed', finished_at = NOW() WHERE id = $1",
            [jobId],
          );
          return;
        }

        try {
          // Find JSON line in stdout
          const lines = stdout.trim().split("\n");
          const jsonLine = lines.find((line) => line.trim().startsWith("{"));
          if (!jsonLine) throw new Error("No JSON output from Python");

          const recommendations = JSON.parse(jsonLine);

          // Save to cache
          await pool.query(
            `INSERT INTO recommendation_cache (user_id, data)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET data = $2, created_at = NOW()`,
            [userId, JSON.stringify(recommendations)],
          );

          // Mark job as done
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'done', finished_at = NOW() WHERE id = $1",
            [jobId],
          );

          console.log(
            `Recommendations job ${jobId} completed for user ${userId}`,
          );
        } catch (parseErr) {
          console.error("Parse error:", parseErr);
          await pool.query(
            "UPDATE recommendation_jobs SET status = 'failed', finished_at = NOW() WHERE id = $1",
            [jobId],
          );
        }
      },
    );

    // Return job ID immediately — don't wait for Python to finish
    return NextResponse.json({ jobId, status: "pending" });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Failed to start job" }, { status: 500 });
  }
}
