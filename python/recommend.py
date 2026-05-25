import sys
import json
import argparse
from sqlalchemy import text
from taste_profile import build_all_profiles, get_engine
from tmdb_fetcher import fetch_candidates, COUNTRY_EMOJI
from ranker import rank_candidates
from dotenv import load_dotenv

load_dotenv()

COUNTRIES = ['KOREAN', 'THAI', 'VIETNAMESE', 'CHINESE_TAIWANESE', 'JAPANESE', 'AMERICAN']
TOP_N = 10

COUNTRY_NAMES = {
    'KOREAN':            'Korean',
    'THAI':              'Thai',
    'VIETNAMESE':        'Vietnamese',
    'CHINESE_TAIWANESE': 'Chinese/Taiwanese',
    'JAPANESE':          'Japanese',
    'AMERICAN':          'American',
}

def get_dismissed(user_id):
    try:
        engine = get_engine()
        with engine.connect() as conn:
            rows = conn.execute(
                text(f"SELECT tmdb_id, title FROM recommendation_dismissed WHERE user_id = {user_id}")
            ).fetchall()
            dismissed_ids = set(row[0] for row in rows)
            dismissed_titles = set(row[1].lower().strip() for row in rows if row[1])
            print(f"Excluding {len(dismissed_ids)} dismissed shows from recommendations")
            return dismissed_ids, dismissed_titles
    except Exception as e:
        print(f"Warning: Could not fetch dismissed shows: {e}")
        return set(), set()

def format_show(r):
    return {
        'tmdb_id': r['tmdb_id'],
        'title': r['title'],
        'overview': r['overview'],
        'vote_average': r['vote_average'],
        'vote_count': r['vote_count'],
        'genres': r['genres'],
        'poster_url': f"https://image.tmdb.org/t/p/w500{r['poster_path']}" if r['poster_path'] else None,
        'media_type': r['media_type'],
        'similarity_score': r['similarity_score'],
        'hybrid_score': r['hybrid_score'],
    }

def main_logic(user_id: int) -> dict:
    """Core recommendation logic — callable from Flask or CLI."""
    df, profiles = build_all_profiles(user_id)

    existing_titles = set(df['title'].str.lower().str.strip())
    dismissed_ids, dismissed_titles = get_dismissed(user_id)
    existing_titles = existing_titles | dismissed_titles

    all_recommendations = {}

    for country in COUNTRIES:
        if country not in profiles:
            continue

        profile = profiles[country]
        candidates = fetch_candidates(profile, existing_titles, dismissed_ids)

        if not candidates:
            continue

        top_shows, all_shows = rank_candidates(candidates, profile, n=TOP_N)

        all_recommendations[country] = {
            'country': country,
            'country_name': COUNTRY_NAMES.get(country, country),
            'emoji': COUNTRY_EMOJI.get(country, ''),
            'shows': [format_show(r) for r in top_shows],
            'all_shows': [format_show(r) for r in all_shows],
            'total': len(all_shows),
        }

    return all_recommendations

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--user_id', type=int, default=1)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()

    result = main_logic(args.user_id)

    if args.json:
        print(json.dumps(result))
    else:
        for country, data in result.items():
            print(f"\n{data['country_name']} -- {data['total']} total candidates")
            for i, show in enumerate(data['shows'], 1):
                print(f"  {i}. {show['title']} ({show['vote_average']})")

if __name__ == "__main__":
    main()