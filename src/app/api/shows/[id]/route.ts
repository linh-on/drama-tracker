import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await pool.query(
      `SELECT s.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', k.id, 'code', k.code, 'label', k.label, 'color', k.color)
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'
        ) AS keywords
       FROM shows s
       LEFT JOIN show_keywords sk ON sk.show_id = s.id
       LEFT JOIN keywords k ON k.id = sk.keyword_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch show" },
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

    const result = await pool.query(
      `UPDATE shows
       SET title=$1, country=$2, type=$3, status=$4, current_ep=$5,
           rating=$6, comment=$7, is_favorite=$8, poster_url=$9, synopsis=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [
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
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }

    if (keywords !== undefined) {
      await pool.query("DELETE FROM show_keywords WHERE show_id = $1", [id]);

      for (const kw of keywords) {
        // Handle both formats: {code: 'S'} objects OR plain code strings 'S'
        const code = typeof kw === "string" ? kw : kw.code;
        const kwResult = await pool.query(
          "SELECT id FROM keywords WHERE code = $1",
          [code],
        );
        if (kwResult.rows.length > 0) {
          await pool.query(
            "INSERT INTO show_keywords (show_id, keyword_id) VALUES ($1, $2)",
            [id, kwResult.rows[0].id],
          );
        }
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update show" },
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
    const result = await pool.query(
      "DELETE FROM shows WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete show" },
      { status: 500 },
    );
  }
}
