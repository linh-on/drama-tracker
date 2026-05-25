import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def rank_candidates(candidates, profile, n=10):
    """
    Rank candidates using:
    - TF-IDF cosine similarity (50%)
    - TMDB rating (30%)
    - Weighted personal keyword match (20%)
      Keywords used more often on your shows = higher weight
    """
    if not candidates:
        return [], []

    # Keyword weights: tmdb_keyword_id → frequency count
    keyword_weights = profile.get('keyword_weights', {})
    max_possible_weight = sum(keyword_weights.values()) if keyword_weights else 1

    candidate_features = [c['features'] for c in candidates]
    taste_feature = profile['feature_text']
    all_features = [taste_feature] + candidate_features

    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    try:
        tfidf_matrix = tfidf.fit_transform(all_features)
    except Exception:
        return candidates[:n], candidates

    taste_vector = tfidf_matrix[0]
    candidate_matrix = tfidf_matrix[1:]
    similarities = cosine_similarity(taste_vector, candidate_matrix)[0]

    # Normalize TMDB ratings to 0-1
    votes = np.array([c['vote_average'] for c in candidates])
    max_vote = votes.max() if votes.max() > 0 else 10
    normalized_votes = votes / max_vote

    # Weighted keyword boost
    keyword_boosts = []
    for c in candidates:
        show_kw_ids = c.get('tmdb_keyword_ids', set())
        if keyword_weights and show_kw_ids:
            # Sum weights of matching keywords
            weighted_score = sum(
                keyword_weights.get(kw_id, 0)
                for kw_id in show_kw_ids
                if kw_id in keyword_weights
            )
            # Normalize to 0-1
            boost = min(weighted_score / max_possible_weight, 1.0)
        else:
            boost = 0.0
        keyword_boosts.append(boost)

    keyword_boosts = np.array(keyword_boosts)

    # Hybrid score: 50% similarity + 30% rating + 20% weighted keyword match
    hybrid_scores = (
        (similarities * 0.5) +
        (normalized_votes * 0.3) +
        (keyword_boosts * 0.2)
    )

    scored = []
    for i, candidate in enumerate(candidates):
        scored.append({
            **candidate,
            'tmdb_keyword_ids': list(candidate.get('tmdb_keyword_ids', set())),
            'similarity_score': round(float(similarities[i]), 3),
            'keyword_boost': round(float(keyword_boosts[i]), 3),
            'hybrid_score': round(float(hybrid_scores[i]), 3),
        })

    # Sort ALL by hybrid score
    scored.sort(key=lambda x: x['hybrid_score'], reverse=True)

    return scored[:n], scored

if __name__ == "__main__":
    print("ranker_v4 loaded")