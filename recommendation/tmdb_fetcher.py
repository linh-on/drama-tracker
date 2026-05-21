import requests
import os
from dotenv import load_dotenv

load_dotenv("../.env.local")

TMDB_TOKEN = os.getenv("TMDB_TOKEN")
HEADERS = {"Authorization": f"Bearer {TMDB_TOKEN}"}

COUNTRY_TO_TMDB = {
    "KOREAN": "KR",
    "THAI": "TH",
    "VIETNAMESE": "VN",
    "CHINESE_TAIWANESE": "CN",
    "JAPANESE": "JP",
    "AMERICAN": "US",
}

TYPE_TO_TMDB = {
    "SERIES": "tv",
    "MOVIE": "movie",
    "ANIME": "tv",
    "WEB_DRAMA": "tv",
    "VARIETY": "tv",
}

def search_tmdb_id(title, media_type="tv"):
    url = f"https://api.themoviedb.org/3/search/{media_type}"
    res = requests.get(
        url,
        headers=HEADERS,
        params={"query": title}
    )

    results = res.json().get("results", [])
    return results[0]["id"] if results else None

def fetch_similar_shows(tmdb_id, media_type="tv", pages=2):
    results = []

    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}/recommendations"

        res = requests.get(
            url,
            headers=HEADERS,
            params={"page": page}
        )

        results.extend(res.json().get("results", []))

    return results

def fetch_keyword_shows(keyword_tmdb_ids, origin_country, media_type="tv"):
    if not keyword_tmdb_ids:
        return []

    kw_ids = list(keyword_tmdb_ids.values())[:3]
    kw_string = "|".join(str(k) for k in kw_ids)

    url = f"https://api.themoviedb.org/3/discover/{media_type}"

    params = {
        "with_keywords": kw_string,
        "with_origin_country": origin_country,
        "sort_by": "vote_average.desc",
        "vote_count.gte": 100,
        "page": 1,
    }

    res = requests.get(
        url,
        headers=HEADERS,
        params=params
    )

    return res.json().get("results", [])

def parse_show(show, media_type, country):
    title = show.get("name") or show.get("title", "")

    genre_map = {
        18: "Drama",
        35: "Comedy",
        28: "Action",
        10749: "Romance",
        27: "Horror",
        9648: "Mystery",
        16: "Animation",
        10759: "Adventure",
        80: "Crime",
        99: "Documentary",
        14: "Fantasy",
        878: "SciFi",
        10765: "SciFi Fantasy",
        10766: "Soap",
        37: "Western"
    }

    genre_ids = show.get("genre_ids", [])
    genres = " ".join(
        [genre_map.get(g, "") for g in genre_ids if g in genre_map]
    )

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
        "features": (
            f"{country} {country} "
            f"{media_type} {media_type} "
            f"{genres} {genres} "
            f"{show.get('overview', '')}"
        ),
    }

def fetch_candidates(profile, existing_titles):
    country = profile["country"]
    origin_country = COUNTRY_TO_TMDB.get(country, "")
    candidates = []

    for seed in profile["seed_shows"]:
        media_type = TYPE_TO_TMDB.get(seed["type"], "tv")
        tmdb_id = search_tmdb_id(seed["title"], media_type)

        if not tmdb_id:
            continue

        similar = fetch_similar_shows(tmdb_id, media_type)

        for show in similar:
            candidates.append(
                parse_show(show, media_type, country)
            )

    fav_type = TYPE_TO_TMDB.get(
        profile["favorite_type"],
        "tv"
    )

    kw_shows = fetch_keyword_shows(
        profile["keyword_tmdb_ids"],
        origin_country,
        fav_type
    )

    for show in kw_shows:
        candidates.append(
            parse_show(show, fav_type, country)
        )

    seen = set()
    unique = []

    for c in candidates:
        if c["tmdb_id"] and c["tmdb_id"] not in seen:
            seen.add(c["tmdb_id"])
            unique.append(c)

    filtered = [
        c for c in unique
        if c["title"].lower().strip() not in existing_titles
        and c["vote_count"] >= 100
        and c["vote_average"] >= 6.5
    ]

    return filtered