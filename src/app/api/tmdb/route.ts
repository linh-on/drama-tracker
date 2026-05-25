import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const tmdbUrl = searchParams.get("url");

  if (!query && !tmdbUrl) return NextResponse.json([]);

  try {
    if (tmdbUrl) {
      const match = tmdbUrl.match(
        /themoviedb\.org\/(tv|movie)\/([\d]+)(?:[^/]*)?(?:\/season\/(\d+))?/,
      );
      if (!match) return NextResponse.json([]);

      const [, mediaType, id, seasonNumber] = match;

      // Fetch base show
      const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
            accept: "application/json",
          },
        },
      );
      const data = await res.json();

      // Fetch season data if a season number is present
      let seasonData = null;
      if (seasonNumber && mediaType === "tv") {
        const seasonRes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
              accept: "application/json",
            },
          },
        );
        seasonData = await seasonRes.json();
      }

      return NextResponse.json([
        {
          tmdb_id: data.id,
          title: seasonData?.name || data.title || data.name,
          poster_url:
            seasonData?.poster_path || data.poster_path
              ? `https://image.tmdb.org/t/p/w500${seasonData?.poster_path || data.poster_path}`
              : null,
          synopsis: seasonData?.overview || data.overview || null,
          media_type: mediaType,
          year:
            seasonData?.air_date?.slice(0, 4) ||
            data.release_date?.slice(0, 4) ||
            data.first_air_date?.slice(0, 4) ||
            "",
          season_number: seasonNumber ? parseInt(seasonNumber) : null,
        },
      ]);
    }

    // Normal search
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query!)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          accept: "application/json",
        },
      },
    );

    const data = await res.json();
    const results = data.results
      ?.slice(0, 6)
      .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
      .map((r: any) => ({
        tmdb_id: r.id,
        title: r.title || r.name,
        poster_url: r.poster_path
          ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
          : null,
        synopsis: r.overview || null,
        media_type: r.media_type,
        year:
          r.release_date?.slice(0, 4) || r.first_air_date?.slice(0, 4) || "",
        season_number: null,
      }));

    return NextResponse.json(results || []);
  } catch (err) {
    return NextResponse.json([]);
  }
}
