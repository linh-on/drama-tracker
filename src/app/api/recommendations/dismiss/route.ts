import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

async function getUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const result = await pool.query("SELECT id FROM users WHERE email = $1", [
    session.user.email,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
}

// POST — dismiss a show
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      tmdb_id,
      title,
      poster_url,
      country,
      media_type,
      vote_average,
      genres,
      overview,
    } = await req.json();

    await pool.query(
      `INSERT INTO recommendation_dismissed 
        (user_id, tmdb_id, title, poster_url, country, media_type, vote_average, genres, overview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, tmdb_id) DO NOTHING`,
      [
        userId,
        tmdb_id,
        title,
        poster_url,
        country,
        media_type,
        vote_average,
        genres,
        overview,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}

// DELETE — restore a dismissed show
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tmdb_id } = await req.json();

    await pool.query(
      "DELETE FROM recommendation_dismissed WHERE user_id = $1 AND tmdb_id = $2",
      [userId, tmdb_id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to restore" }, { status: 500 });
  }
}
