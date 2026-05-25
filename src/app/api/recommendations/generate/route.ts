import { NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;
const API_SECRET = process.env.API_SECRET;

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

    if (!PYTHON_SERVICE_URL) {
      return NextResponse.json(
        { error: "Recommendation service not configured" },
        { status: 500 },
      );
    }

    const jobId = randomUUID();
    await pool.query(
      "INSERT INTO recommendation_jobs (id, user_id, status) VALUES ($1, $2, 'pending')",
      [jobId, userId],
    );

    // Call Render service in the background, don't await so we return jobId immediately
    (async () => {
      try {
        const pyRes = await fetch(
          `${PYTHON_SERVICE_URL}/recommend?user_id=${userId}`,
          {
            method: "GET",
            headers: { "x-api-secret": API_SECRET ?? "" },
          },
        );

        if (!pyRes.ok) {
          throw new Error(`Python service returned ${pyRes.status}`);
        }

        const recommendations = await pyRes.json();


        await pool.query(
          `INSERT INTO recommendation_cache (user_id, data, created_at)
           VALUES ($1, $2, NOW() AT TIME ZONE 'UTC')
           ON CONFLICT (user_id) DO UPDATE SET data = $2, created_at = NOW() AT TIME ZONE 'UTC'`,
          [userId, JSON.stringify(recommendations)],
        );
        await pool.query(
          "UPDATE recommendation_jobs SET status = 'done', finished_at = NOW() WHERE id = $1",
          [jobId],
        );
      } catch (err) {
        console.error("Recommendation job failed:", err);
        await pool.query(
          "UPDATE recommendation_jobs SET status = 'failed', finished_at = NOW() WHERE id = $1",
          [jobId],
        );
      }
    })();

    return NextResponse.json({ jobId, status: "pending" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to start job" }, { status: 500 });
  }
}
