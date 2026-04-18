import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (category) {
      conditions.push(`b.category = $${i++}`);
      values.push(category);
    }
    if (status) {
      conditions.push(`b.status = $${i++}`);
      values.push(status);
    }
    if (search) {
      conditions.push(`b.title ILIKE $${i++}`);
      values.push(`%${search}%`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT b.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', k.id, 'code', k.code, 'label', k.label, 'color', k.color)
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) AS keywords
      FROM books b
      LEFT JOIN book_keywords bk ON bk.book_id = b.id
      LEFT JOIN keywords k ON k.id = bk.keyword_id
      ${where}
      GROUP BY b.id
      ORDER BY b.title ASC
    `;

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      status,
      current_chapter,
      notes,
      is_favorite,
      keywords,
    } = body;

    if (!title)
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const result = await pool.query(
      `INSERT INTO books (title, category, status, current_chapter, notes, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        title,
        category || "STANDALONE",
        status || "PLAN_TO_READ",
        current_chapter || null,
        notes || null,
        is_favorite || false,
      ],
    );

    const book = result.rows[0];

    if (keywords?.length > 0) {
      for (const kw of keywords) {
        const code = typeof kw === "string" ? kw : kw.code;
        const kwResult = await pool.query(
          "SELECT id FROM keywords WHERE code = $1",
          [code],
        );
        if (kwResult.rows.length > 0) {
          await pool.query(
            "INSERT INTO book_keywords (book_id, keyword_id) VALUES ($1, $2)",
            [book.id, kwResult.rows[0].id],
          );
        }
      }
    }

    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 },
    );
  }
}
