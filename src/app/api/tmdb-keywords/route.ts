import { NextRequest, NextResponse } from "next/server";

const TMDB_HEADERS = {
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(query)}&page=1`,
      { headers: TMDB_HEADERS },
    );
    const data = await res.json();
    const results = (data.results || []).slice(0, 20).map((kw: any) => ({
      id: kw.id,
      name: kw.name,
    }));
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 },
    );
  }
}
