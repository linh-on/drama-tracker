import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";

async function getUserId(): Promise<number | null> {
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
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions: string[] = ["b.user_id = $1"];
    const values: any[] = [userId];
    let i = 2;

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

    const where = `WHERE ${conditions.join(" AND ")}`;

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
      LEFT JOIN keywords k ON k.id = bk.keyword_id AND k.user_id = $1
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
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      `INSERT INTO books (user_id, title, category, status, current_chapter, notes, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
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
          "SELECT id FROM keywords WHERE code = $1 AND user_id = $2",
          [code, userId],
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
