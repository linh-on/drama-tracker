import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv('../.env.local')

def get_engine():
    return create_engine(os.getenv("DATABASE_URL"))

def load_user_data(user_id=1):
    engine = get_engine()

    shows_query = f"""
        SELECT 
            s.id, s.title, s.country, s.type,
            s.rating, s.status, s.is_favorite,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'label', k.label,
                        'tmdb_id', k.tmdb_keyword_id
                    )
                ) FILTER (WHERE k.id IS NOT NULL),
                '[]'
            ) as keywords
        FROM shows s
        LEFT JOIN show_keywords sk ON sk.show_id = s.id
        LEFT JOIN keywords k ON k.id = sk.keyword_id
        WHERE s.user_id = {user_id}
        GROUP BY s.id, s.title, s.country, s.type,
                 s.rating, s.status, s.is_favorite
    """
    shows_df = pd.read_sql(shows_query, engine)

    # Fetch user's personal keywords with TMDB IDs
    keywords_query = f"""
        SELECT label, tmdb_keyword_id, color
        FROM keywords
        WHERE user_id = {user_id}
        AND tmdb_keyword_id IS NOT NULL
        ORDER BY label
    """
    keywords_df = pd.read_sql(keywords_query, engine)

    return shows_df, keywords_df

def build_taste_profile(df, keywords_df, country):
    country_df = df[
        (df['country'] == country) &
        (df['status'] == 'COMPLETED')
    ].copy()

    if len(country_df) == 0:
        return None

    profile = {
        'country': country,
        'total_shows': len(country_df),
    }

    rated = country_df[country_df['rating'].notna()]
    profile['avg_rating'] = rated['rating'].mean() if len(rated) > 0 else 3.0
    profile['favorite_type'] = country_df['type'].value_counts().index[0]

    # Count keyword frequency on completed shows for this country
    keyword_counts = {}
    keyword_tmdb_ids = {}

    for _, row in country_df.iterrows():
        kws = row['keywords']
        if isinstance(kws, list):
            for kw in kws:
                if isinstance(kw, dict):
                    label = kw.get('label', '')
                    tmdb_id = kw.get('tmdb_id')
                    if label:
                        keyword_counts[label] = keyword_counts.get(label, 0) + 1
                        if tmdb_id:
                            keyword_tmdb_ids[label] = tmdb_id

    sorted_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)
    profile['top_keywords'] = sorted_keywords[:5]
    profile['keyword_tmdb_ids'] = keyword_tmdb_ids

    # All user keyword IDs (for ranking)
    profile['all_user_keyword_ids'] = set(
        keywords_df['tmdb_keyword_id'].dropna().astype(int).tolist()
    )

    # Keywords used more often on your completed shows get higher weight
    profile['keyword_weights'] = {}
    for label, count in keyword_counts.items():
        tmdb_id = keyword_tmdb_ids.get(label)
        if tmdb_id:
            profile['keyword_weights'][int(tmdb_id)] = count

    # Top rated seed shows for this country
    seeds = country_df[country_df['rating'] >= 4.0].nlargest(3, 'rating')
    profile['seed_shows'] = seeds[['id', 'title', 'type', 'rating']].to_dict('records')

    # Feature string for TF-IDF
    kw_text = ' '.join([kw[0] for kw in sorted_keywords[:5]])
    profile['feature_text'] = (
        f"{country} {country} "
        f"{profile['favorite_type']} {profile['favorite_type']} "
        f"{kw_text} {kw_text}"
    )

    return profile

def build_all_profiles(user_id=1):
    df, keywords_df = load_user_data(user_id)

    print(f"Loaded {len(keywords_df)} personal keywords from database:")
    for _, kw in keywords_df.iterrows():
        print(f"   - {kw['label']} (TMDB ID: {kw['tmdb_keyword_id']})")

    countries = ['KOREAN', 'THAI', 'VIETNAMESE', 'CHINESE_TAIWANESE', 'JAPANESE', 'AMERICAN']
    profiles = {}

    for country in countries:
        profile = build_taste_profile(df, keywords_df, country)
        if profile:
            profiles[country] = profile
            print(f"\n{country} Profile:")
            print(f"   Total completed: {profile['total_shows']}")
            print(f"   Avg rating: {profile['avg_rating']:.1f}")
            print(f"   Favorite type: {profile['favorite_type']}")
            print(f"   Top keywords (by frequency):")
            for label, count in profile['top_keywords']:
                tmdb_id = profile['keyword_tmdb_ids'].get(label, 'N/A')
                weight = profile['keyword_weights'].get(int(tmdb_id) if tmdb_id != 'N/A' else 0, 0)
                print(f"      {label}: used {count}x (weight: {weight})")
            print(f"   Seeds: {[s['title'] for s in profile['seed_shows']]}")

    return df, profiles

if __name__ == "__main__":
    print("Building taste profiles...\n")
    df, profiles = build_all_profiles()
    print(f"\nBuilt profiles for {len(profiles)} countries")