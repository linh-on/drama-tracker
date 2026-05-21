import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def rank_candidates(candidates, profile, n=10):
    if not candidates:
        return []

    candidate_features = [c["features"] for c in candidates]
    taste_feature = profile["feature_text"]
    all_features = [taste_feature] + candidate_features

    tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))

    try:
        tfidf_matrix = tfidf.fit_transform(all_features)
    except Exception:
        return candidates[:n]

    taste_vector = tfidf_matrix[0]
    candidate_matrix = tfidf_matrix[1:]
    similarities = cosine_similarity(taste_vector, candidate_matrix)[0]

    votes = np.array([c["vote_average"] for c in candidates])
    max_vote = votes.max() if votes.max() > 0 else 10
    normalized_votes = votes / max_vote

    hybrid_scores = (similarities * 0.6) + (normalized_votes * 0.4)

    scored = []

    for i, candidate in enumerate(candidates):
        scored.append({
            **candidate,
            "similarity_score": round(float(similarities[i]), 3),
            "hybrid_score": round(float(hybrid_scores[i]), 3),
        })

    scored.sort(key=lambda x: x["hybrid_score"], reverse=True)
    return scored[:n]