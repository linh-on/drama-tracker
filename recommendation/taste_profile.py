import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv("../.env.local")

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

    return pd.read_sql(shows_query, engine)

def build_taste_profile(df, country):
    country_df = df[
        (df["country"] == country) &
        (df["status"] == "COMPLETED")
    ].copy()

    if len(country_df) == 0:
        return None

    profile = {
        "country": country,
        "total_shows": len(country_df)
    }

    rated = country_df[country_df["rating"].notna()]
    profile["avg_rating"] = rated["rating"].mean() if len(rated) > 0 else 3.0
    profile["favorite_type"] = country_df["type"].value_counts().index[0]

    keyword_counts = {}
    keyword_tmdb_ids = {}

    for _, row in country_df.iterrows():
        kws = row["keywords"]

        if isinstance(kws, list):
            for kw in kws:
                if isinstance(kw, dict):
                    label = kw.get("label", "")
                    tmdb_id = kw.get("tmdb_id")

                    if label:
                        keyword_counts[label] = keyword_counts.get(label, 0) + 1

                    if tmdb_id:
                        keyword_tmdb_ids[label] = tmdb_id

    sorted_keywords = sorted(
        keyword_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )

    profile["top_keywords"] = sorted_keywords[:5]
    profile["keyword_tmdb_ids"] = keyword_tmdb_ids

    seeds = country_df[country_df["rating"] >= 4.0].nlargest(3, "rating")
    profile["seed_shows"] = seeds[
        ["id", "title", "type", "rating"]
    ].to_dict("records")

    kw_text = " ".join([kw[0] for kw in sorted_keywords[:5]])

    profile["feature_text"] = (
        f"{country} {country} "
        f"{profile['favorite_type']} {profile['favorite_type']} "
        f"{kw_text} {kw_text}"
    )

    return profile

def build_all_profiles(user_id=1):
    df = load_user_data(user_id)

    countries = [
        "KOREAN",
        "THAI",
        "VIETNAMESE",
        "CHINESE_TAIWANESE",
        "JAPANESE",
        "AMERICAN"
    ]

    profiles = {}

    for country in countries:
        profile = build_taste_profile(df, country)
        if profile:
            profiles[country] = profile

    return df, profiles