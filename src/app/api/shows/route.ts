import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";

async function getUserId(req: NextRequest): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const result = await pool.query("SELECT id FROM users WHERE email = $1", [
    session.user.email,
  ]);
  if (result.rows.length === 0) return null;
  return result.rows[0].id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const keyword = searchParams.get("keyword");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "title";
    const order = searchParams.get("order") === "desc" ? "DESC" : "ASC";

    const conditions: string[] = ["s.user_id = $1"];
    const values: any[] = [userId];
    let i = 2;

    if (country) {
      conditions.push(`s.country = $${i++}`);
      values.push(country);
    }
    if (status) {
      conditions.push(`s.status = $${i++}`);
      values.push(status);
    }
    if (type) {
      conditions.push(`s.type = $${i++}`);
      values.push(type);
    }
    if (search) {
      conditions.push(`s.title ILIKE $${i++}`);
      values.push(`%${search}%`);
    }
    if (keyword) {
      conditions.push(`EXISTS (
        SELECT 1 FROM show_keywords sk
        JOIN keywords k ON k.id = sk.keyword_id
        WHERE sk.show_id = s.id AND k.code = $${i++} AND k.user_id = $1
      )`);
      values.push(keyword);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const validSortCols: Record<string, string> = {
      title: "s.title",
      rating: "s.rating",
      country: "s.country",
      type: "s.type",
    };
    const sortCol = validSortCols[sortBy] || "s.title";

    const query = `
      SELECT s.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', k.id, 'code', k.code, 'label', k.label, 'color', k.color)
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) AS keywords
      FROM shows s
      LEFT JOIN show_keywords sk ON sk.show_id = s.id
      LEFT JOIN keywords k ON k.id = sk.keyword_id AND k.user_id = $1
      ${where}
      GROUP BY s.id
      ORDER BY ${sortCol} ${order}
    `;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch shows" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      title,
      country,
      type,
      status,
      current_ep,
      rating,
      comment,
      is_favorite,
      keywords,
      poster_url,
      synopsis,
    } = body;

    const existing = await pool.query(
      "SELECT id FROM shows WHERE LOWER(title) = LOWER($1) AND user_id = $2",
      [title, userId],
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: `"${title}" is already in your list!` },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO shows (user_id, title, country, type, status, current_ep, rating, comment, is_favorite, poster_url, synopsis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId,
        title,
        country,
        type,
        status,
        current_ep || null,
        rating || null,
        comment || null,
        is_favorite || false,
        poster_url || null,
        synopsis || null,
      ],
    );

    const show = result.rows[0];

    if (keywords?.length > 0) {
      for (const kw of keywords) {
        const code = typeof kw === "string" ? kw : kw.code;
        const kwResult = await pool.query(
          "SELECT id FROM keywords WHERE code = $1 AND user_id = $2",
          [code, userId],
        );
        if (kwResult.rows.length > 0) {
          await pool.query(
            "INSERT INTO show_keywords (show_id, keyword_id) VALUES ($1, $2)",
            [show.id, kwResult.rows[0].id],
          );
        }
      }
    }

    return NextResponse.json(show, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create show" },
      { status: 500 },
    );
  }
}
