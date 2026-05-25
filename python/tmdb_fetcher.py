import requests
import os
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv('../.env.local')

TMDB_TOKEN = os.getenv("TMDB_TOKEN")
HEADERS = {"Authorization": f"Bearer {TMDB_TOKEN}"}
DATABASE_URL = os.getenv("DATABASE_URL")

COUNTRY_TO_TMDB = {
    'KOREAN':            'KR',
    'THAI':              'TH',
    'VIETNAMESE':        'VN',
    'CHINESE_TAIWANESE': 'CN',
    'JAPANESE':          'JP',
    'AMERICAN':          'US',
}

COUNTRY_EMOJI = {
    'KOREAN':            'KR',
    'THAI':              'TH',
    'VIETNAMESE':        'VN',
    'CHINESE_TAIWANESE': 'CN',
    'JAPANESE':          'JP',
    'AMERICAN':          'US',
}

DISCOVER_ONLY_COUNTRIES = {'VIETNAMESE', 'CHINESE_TAIWANESE'}

TYPE_TO_TMDB = {
    'SERIES':     'tv',
    'MOVIE':      'movie',
    'ANIME':      'tv',
    'WEB_DRAMA':  'tv',
    'VARIETY':    'tv',
}

GENRE_MAP = {
    18: "Drama", 35: "Comedy", 28: "Action", 10749: "Romance",
    27: "Horror", 9648: "Mystery", 16: "Animation", 10759: "Adventure",
    80: "Crime", 99: "Documentary", 14: "Fantasy", 878: "SciFi",
    10765: "SciFi Fantasy", 10766: "Soap", 37: "Western"
}

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def get_cached_keywords(tmdb_ids):
    if not tmdb_ids:
        return {}
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT tmdb_id, keyword_ids FROM tmdb_show_keywords_cache WHERE tmdb_id = ANY(%s)",
            (list(tmdb_ids),)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {row[0]: set(row[1]) if row[1] else set() for row in rows}
    except Exception as e:
        print(f"     Cache read error: {e}")
        return {}

def save_keywords_to_cache(keyword_data):
    if not keyword_data:
        return
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        execute_values(
            cur,
            """INSERT INTO tmdb_show_keywords_cache (tmdb_id, media_type, keyword_ids)
               VALUES %s
               ON CONFLICT (tmdb_id) DO UPDATE
               SET keyword_ids = EXCLUDED.keyword_ids, fetched_at = NOW()""",
            keyword_data
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"     Cache write error: {e}")

def fetch_show_keywords_from_tmdb(tmdb_id, media_type="tv"):
    try:
        url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}/keywords"
        res = requests.get(url, headers=HEADERS)
        data = res.json()
        kws = data.get("results", data.get("keywords", []))
        return set(kw["id"] for kw in kws)
    except Exception:
        return set()

def fetch_keywords_batch(candidates):
    tmdb_ids = [c['tmdb_id'] for c in candidates if c['tmdb_id']]
    cached = get_cached_keywords(tmdb_ids)
    cache_hits = len(cached)
    missing = [c for c in candidates if c['tmdb_id'] and c['tmdb_id'] not in cached]
    print(f"     Keywords: {cache_hits} from cache, {len(missing)} need API calls")

    new_cache_data = []
    for c in missing:
        kw_ids = fetch_show_keywords_from_tmdb(c['tmdb_id'], c['media_type'])
        cached[c['tmdb_id']] = kw_ids
        new_cache_data.append((c['tmdb_id'], c['media_type'], list(kw_ids)))

    if new_cache_data:
        save_keywords_to_cache(new_cache_data)
        print(f"     Saved {len(new_cache_data)} new keyword sets to cache")

    for c in candidates:
        c['tmdb_keyword_ids'] = cached.get(c['tmdb_id'], set())

    return candidates

def search_tmdb_id(title, media_type="tv"):
    url = f"https://api.themoviedb.org/3/search/{media_type}"
    res = requests.get(url, headers=HEADERS, params={"query": title})
    results = res.json().get("results", [])
    if results:
        return results[0]["id"]
    return None

def fetch_similar_shows(tmdb_id, media_type="tv", pages=3):
    results = []
    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}/recommendations"
        res = requests.get(url, headers=HEADERS, params={"page": page})
        results.extend(res.json().get("results", []))
    return results

def fetch_keyword_shows(keyword_tmdb_ids, origin_country, media_type="tv", pages=3):
    if not keyword_tmdb_ids:
        return []
    kw_ids = list(keyword_tmdb_ids.values())[:5]
    kw_string = "|".join(str(k) for k in kw_ids)
    all_results = []
    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/discover/{media_type}"
        params = {
            "with_keywords": kw_string,
            "with_origin_country": origin_country,
            "sort_by": "popularity.desc",
            "page": page,
        }
        res = requests.get(url, headers=HEADERS, params=params)
        results = res.json().get("results", [])
        if not results:
            break
        all_results.extend(results)
    return all_results

def fetch_discover_by_country(origin_country, media_type="tv", pages=5):
    all_results = []
    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/discover/{media_type}"
        params = {
            "with_origin_country": origin_country,
            "sort_by": "popularity.desc",
            "page": page,
        }
        res = requests.get(url, headers=HEADERS, params=params)
        results = res.json().get("results", [])
        if not results:
            break
        all_results.extend(results)
    return all_results

def is_correct_country(show, origin_country_code):
    origin = show.get("origin_country", [])
    if not origin:
        return True
    if origin_country_code in origin:
        return True
    prod = show.get("production_countries", [])
    for c in prod:
        if c.get("iso_3166_1") == origin_country_code:
            return True
    return False

def parse_show(show, media_type, country):
    title = show.get("name") or show.get("title", "")
    genre_ids = show.get("genre_ids", [])
    genres = " ".join([GENRE_MAP.get(g, "") for g in genre_ids if g in GENRE_MAP])
    origin = show.get("origin_country", [])
    return {
        "tmdb_id": show.get("id"),
        "title": title,
        "media_type": media_type,
        "overview": show.get("overview", ""),
        "vote_average": show.get("vote_average", 0),
        "vote_count": show.get("vote_count", 0),
        "popularity": show.get("popularity", 0),
        "poster_path": show.get("poster_path", ""),
        "genres": genres,
        "country": country,
        "origin_country": origin,
        "tmdb_keyword_ids": set(),
        "features": f"{country} {country} {media_type} {media_type} {genres} {genres} {show.get('overview', '')}",
    }

def fetch_candidates(profile, existing_titles, dismissed_ids=None):
    dismissed_ids = dismissed_ids or set()
    country = profile['country']
    origin_country = COUNTRY_TO_TMDB.get(country, '')
    candidates = []

    if country in DISCOVER_ONLY_COUNTRIES:
        print(f"\n  Discover-only mode for {country}...")
        fav_type = TYPE_TO_TMDB.get(profile['favorite_type'], 'tv')

        country_shows = fetch_discover_by_country(origin_country, fav_type, pages=5)
        print(f"     Found {len(country_shows)} shows from {country}")
        for show in country_shows:
            candidates.append(parse_show(show, fav_type, country))

        if fav_type != 'movie':
            movie_shows = fetch_discover_by_country(origin_country, 'movie', pages=3)
            print(f"     Found {len(movie_shows)} movies from {country}")
            for show in movie_shows:
                candidates.append(parse_show(show, 'movie', country))

        if profile['keyword_tmdb_ids']:
            kw_shows = fetch_keyword_shows(
                profile['keyword_tmdb_ids'], origin_country, fav_type, pages=3
            )
            print(f"     Found {len(kw_shows)} keyword-matched shows")
            for show in kw_shows:
                candidates.append(parse_show(show, fav_type, country))

    else:
        print(f"\n  Fetching seed-based recommendations for {country}...")
        for seed in profile['seed_shows']:
            media_type = TYPE_TO_TMDB.get(seed['type'], 'tv')
            tmdb_id = search_tmdb_id(seed['title'], media_type)
            if not tmdb_id:
                print(f"     WARNING: '{seed['title']}' not found on TMDB")
                continue
            print(f"     FOUND: '{seed['title']}' -> TMDB ID {tmdb_id}")
            similar = fetch_similar_shows(tmdb_id, media_type, pages=3)
            filtered_similar = [
                s for s in similar if is_correct_country(s, origin_country)
            ]
            print(f"        {len(filtered_similar)}/{len(similar)} are from {country}")
            for show in filtered_similar:
                candidates.append(parse_show(show, media_type, country))

        print(f"\n  Fetching keyword-based discoveries for {country}...")
        fav_type = TYPE_TO_TMDB.get(profile['favorite_type'], 'tv')
        kw_shows = fetch_keyword_shows(
            profile['keyword_tmdb_ids'], origin_country, fav_type, pages=3
        )
        print(f"     Found {len(kw_shows)} keyword-matched shows")
        for show in kw_shows:
            candidates.append(parse_show(show, fav_type, country))

    # Deduplicate
    seen = set()
    unique = []
    for c in candidates:
        if c['tmdb_id'] and c['tmdb_id'] not in seen:
            seen.add(c['tmdb_id'])
            unique.append(c)

    # Filter out:
    # 1. Shows already in user's list (by title)
    # 2. Dismissed shows (by TMDB ID)
    filtered = [
        c for c in unique
        if c['title'].lower().strip() not in existing_titles
        and c['tmdb_id'] not in dismissed_ids
    ]

    print(f"     Fetching keywords for {len(filtered)} candidates (with cache)...")
    filtered = fetch_keywords_batch(filtered)

    print(f"     {len(filtered)} total candidates ready for {country}")
    return filtered

if __name__ == "__main__":
    from taste_profile import build_all_profiles
    df, profiles = build_all_profiles()
    existing = set(df['title'].str.lower().str.strip())
    if 'KOREAN' in profiles:
        candidates = fetch_candidates(profiles['KOREAN'], existing)
        print(f"\nFound {len(candidates)} Korean candidates")