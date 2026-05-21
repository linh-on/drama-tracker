import sys
import json
import argparse
import pandas as pd
from taste_profile import build_all_profiles
from tmdb_fetcher import fetch_candidates, COUNTRY_EMOJI
from ranker import rank_candidates
from dotenv import load_dotenv

load_dotenv('../.env.local')

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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--user_id', type=int, default=1)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()

    user_id = args.user_id
    output_json = args.json

    df, profiles = build_all_profiles(user_id)
    existing_titles = set(df['title'].str.lower().str.strip())

    all_recommendations = {}

    for country in COUNTRIES:
        if country not in profiles:
            continue

        profile = profiles[country]
        candidates = fetch_candidates(profile, existing_titles)

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

    if output_json:
        print(json.dumps(all_recommendations))
    else:
        for country, data in all_recommendations.items():
            print(f"\n{data['country_name']} — {data['total']} total candidates")
            for i, show in enumerate(data['shows'], 1):
                print(f"  {i}. {show['title']} ({show['vote_average']})")

if __name__ == "__main__":
    main()