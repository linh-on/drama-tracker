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

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await pool.query(
      `SELECT b.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', k.id, 'code', k.code, 'label', k.label, 'color', k.color)
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) AS keywords
       FROM books b
       LEFT JOIN book_keywords bk ON bk.book_id = b.id
       LEFT JOIN keywords k ON k.id = bk.keyword_id AND k.user_id = $2
       WHERE b.id = $1 AND b.user_id = $2
       GROUP BY b.id`,
      [id, userId],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

    const result = await pool.query(
      `UPDATE books
       SET title=$1, category=$2, status=$3, current_chapter=$4,
           notes=$5, is_favorite=$6, updated_at=NOW()
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [
        title,
        category,
        status,
        current_chapter || null,
        notes || null,
        is_favorite || false,
        id,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (keywords !== undefined) {
      await pool.query("DELETE FROM book_keywords WHERE book_id = $1", [id]);
      for (const kw of keywords) {
        const code = typeof kw === "string" ? kw : kw.code;
        const kwResult = await pool.query(
          "SELECT id FROM keywords WHERE code = $1 AND user_id = $2",
          [code, userId],
        );
        if (kwResult.rows.length > 0) {
          await pool.query(
            "INSERT INTO book_keywords (book_id, keyword_id) VALUES ($1, $2)",
            [id, kwResult.rows[0].id],
          );
        }
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 },
    );
  }
}
