import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const keyword = searchParams.get("keyword");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "title";
    const order = searchParams.get("order") === "desc" ? "DESC" : "ASC";

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

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
        WHERE sk.show_id = s.id AND k.code = $${i++}
      )`);
      values.push(keyword);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const validSortCols: Record<string, string> = {
      title: "s.title",
      rating: "s.rating",
      country: "s.country",
      type: "s.type",
    };
    const sortCol = validSortCols[sortBy] || "s.title";

    const query = `
      SELECT
        s.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', k.id, 'code', k.code, 'label', k.label, 'color', k.color)
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) AS keywords
      FROM shows s
      LEFT JOIN show_keywords sk ON sk.show_id = s.id
      LEFT JOIN keywords k ON k.id = sk.keyword_id
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
    } = body;

    const result = await pool.query(
      `INSERT INTO shows (title, country, type, status, current_ep, rating, comment, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        country,
        type,
        status,
        current_ep || null,
        rating || null,
        comment || null,
        is_favorite || false,
      ],
    );

    const show = result.rows[0];

    // Link keywords
    if (keywords?.length > 0) {
      for (const code of keywords) {
        const kw = await pool.query("SELECT id FROM keywords WHERE code = $1", [
          code,
        ]);
        if (kw.rows.length > 0) {
          await pool.query(
            "INSERT INTO show_keywords (show_id, keyword_id) VALUES ($1, $2)",
            [show.id, kw.rows[0].id],
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
