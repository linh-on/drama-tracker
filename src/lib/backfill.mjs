import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString:
    "postgresql://postgres:password@localhost:5432/drama_tracker",
});

const TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWYzYmVlYjhjMzkyODEzZmMzNzQwZTgxYjI5ZTM0NyIsIm5iZiI6MTc3NTcxNDI2MS4yMzgwMDAyLCJzdWIiOiI2OWQ3M2ZkNTJiYTA3YTU2M2JkNzcyN2YiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.5IwwBCIJdYGtmWOg6xZcWSBrk-AvHZ5xj7Y08IIa4nU";

async function searchTMDB(title) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          accept: "application/json",
        },
      },
    );
    const data = await res.json();
    const result = data.results?.find(
      (r) => r.media_type === "movie" || r.media_type === "tv",
    );
    if (!result) return null;
    return {
      poster_url: result.poster_path
        ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
        : null,
      synopsis: result.overview || null,
    };
  } catch {
    return null;
  }
}

async function backfill() {
  const client = await pool.connect();

  try {
    // Get all shows without a poster
    const { rows: shows } = await client.query(
      "SELECT id, title FROM shows WHERE poster_url IS NULL ORDER BY id",
    );

    console.log(
      `Found ${shows.length} shows without a poster. Starting backfill...`,
    );

    let matched = 0;
    let notFound = 0;

    for (const show of shows) {
      const result = await searchTMDB(show.title);

      if (result && result.poster_url) {
        await client.query(
          "UPDATE shows SET poster_url = $1, synopsis = $2 WHERE id = $3",
          [result.poster_url, result.synopsis, show.id],
        );
        console.log(`✅ ${show.title}`);
        matched++;
      } else {
        console.log(`❌ ${show.title} — not found`);
        notFound++;
      }

      // Small delay to avoid hitting TMDB rate limits
      await new Promise((r) => setTimeout(r, 250));
    }

    console.log(`\n🎉 Done! ${matched} matched, ${notFound} not found.`);
  } finally {
    client.release();
    await pool.end();
  }
}

backfill().catch(console.error);
