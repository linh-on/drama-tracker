from taste_profile import build_all_profiles
from tmdb_fetcher import fetch_candidates
from ranker import rank_candidates

COUNTRIES = [
    "KOREAN",
    "THAI",
    "VIETNAMESE",
    "CHINESE_TAIWANESE",
    "JAPANESE",
    "AMERICAN"
]

TOP_N = 10
USER_ID = 1

def build_recommendations():
    df, profiles = build_all_profiles(USER_ID)
    existing_titles = set(df["title"].str.lower().str.strip())

    all_recommendations = {}

    for country in COUNTRIES:
        if country not in profiles:
            continue

        profile = profiles[country]
        candidates = fetch_candidates(profile, existing_titles)

        if not candidates:
            continue

        ranked = rank_candidates(candidates, profile, n=TOP_N)
        all_recommendations[country] = ranked

    return all_recommendations

if __name__ == "__main__":
    results = build_recommendations()