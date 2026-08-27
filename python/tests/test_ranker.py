import pytest

from ranker import rank_candidates

def test_text_overlap_ranks_first(profile, make_candidate):
    candidates = [
        make_candidate("Show D", "american action war zombie apocalypse", vote_average=8.0),
        make_candidate("Show C", "korean romance slowburn drama", vote_average=8.0),
    ]
    top, _ = rank_candidates(candidates, profile)
    assert top[0]["title"] == "Show C"


@pytest.mark.parametrize("feature_text,expected_top", [
    ("korean romance romance slowburn", "Romance Show"),
    ("korean action action war", "Action Show"),
])
def test_ranks_by_dominant_signal(make_candidate, feature_text, expected_top):
    prof = {"feature_text": feature_text, "keyword_weights": {}}
    candidates = [
        make_candidate("Romance Show", "korean romance slowburn drama", vote_average=7.0),
        make_candidate("Action Show", "korean action war fight", vote_average=7.0),
    ]
    top, _ = rank_candidates(candidates, prof)
    assert top[0]["title"] == expected_top

def test_higher_rating_breaks_a_tie(profile, make_candidate):
    candidates = [
        make_candidate("Low Rated", "korean romance slowburn", vote_average=5.0),
        make_candidate("High Rated", "korean romance slowburn", vote_average=9.0),
    ]

    top, _ = rank_candidates(candidates, profile)

    assert top[0]["title"] == "High Rated"


def test_more_keyword_overlap_breaks_a_tie(profile, make_candidate):
    candidates = [
        make_candidate("Fewer Keywords", "korean romance slowburn",
                       vote_average=7.0, tmdb_keyword_ids=[200]),
        make_candidate("More Keywords", "korean romance slowburn",
                       vote_average=7.0, tmdb_keyword_ids=[100, 200]),
    ]

    top, _ = rank_candidates(candidates, profile)

    assert top[0]["title"] == "More Keywords"
    assert top[0]["keyword_boost"] > top[1]["keyword_boost"]

def test_empty_candidates_returns_two_empty_lists(profile):
    top, all_ranked = rank_candidates([], profile)

    assert top == []
    assert all_ranked == []


def test_single_candidate_is_returned_and_scored(profile, make_candidate):
    candidates = [make_candidate("Only Show", "korean romance slowburn", vote_average=8.0)]

    top, all_ranked = rank_candidates(candidates, profile)

    assert len(top) == 1
    assert len(all_ranked) == 1
    assert "hybrid_score" in top[0]


def test_candidate_without_keywords_gets_zero_boost(profile, make_candidate):
    candidate = make_candidate("No Keywords", "korean romance slowburn", vote_average=7.0)
    del candidate["tmdb_keyword_ids"]  

    top, _ = rank_candidates([candidate], profile)

    assert top[0]["keyword_boost"] == 0.0


def test_empty_keyword_weights_gives_zero_boost(make_candidate):
    prof = {"feature_text": "korean romance slowburn", "keyword_weights": {}}
    candidates = [make_candidate("Show", "korean romance slowburn",
                                 vote_average=7.0, tmdb_keyword_ids=[100, 200])]
    
    top, _ = rank_candidates(candidates, prof)

    assert top[0]["keyword_boost"] == 0.0


def test_falls_back_to_unscored_when_tfidf_has_empty_vocabulary(profile, make_candidate):
    prof = {"feature_text": "", "keyword_weights": {}}
    candidates = [
        make_candidate("A", "", vote_average=7.0),
        make_candidate("B", "", vote_average=7.0),
    ]

    top, all_ranked = rank_candidates(candidates, prof, n=1)

    assert len(top) == 1
    assert len(all_ranked) == 2

def test_n_limits_top_list_but_all_list_is_complete(profile, make_candidate):
    candidates = [
        make_candidate(f"Show {i}", "korean romance slowburn", vote_average=float(i))
        for i in range(1, 6)
    ]

    top, all_ranked = rank_candidates(candidates, profile, n=2)

    assert len(top) == 2
    assert len(all_ranked) == 5


def test_all_ranked_is_sorted_descending_by_hybrid_score(profile, make_candidate):
    candidates = [
        make_candidate("A", "korean romance slowburn", vote_average=9.0),
        make_candidate("B", "american action war", vote_average=3.0),
        make_candidate("C", "korean romance drama", vote_average=6.0),
    ]

    _, all_ranked = rank_candidates(candidates, profile)

    scores = [s["hybrid_score"] for s in all_ranked]
    assert scores == sorted(scores, reverse=True)


def test_scored_items_expose_expected_fields(profile, make_candidate):
    candidates = [make_candidate("Show", "korean romance slowburn",
                                 vote_average=8.0, tmdb_keyword_ids=[100])]

    top, _ = rank_candidates(candidates, profile)
    item = top[0]

    assert 0.0 <= item["similarity_score"] <= 1.0
    assert 0.0 <= item["keyword_boost"] <= 1.0
    assert 0.0 <= item["hybrid_score"] <= 1.0
    assert isinstance(item["tmdb_keyword_ids"], list)

def test_same_input_produces_same_order(profile, make_candidate):
    def build():
        return [
            make_candidate("A", "korean romance slowburn", vote_average=8.0, tmdb_keyword_ids=[100]),
            make_candidate("B", "korean action war", vote_average=6.0),
            make_candidate("C", "korean romance drama", vote_average=7.0, tmdb_keyword_ids=[200]),
        ]

    first, _ = rank_candidates(build(), profile)
    second, _ = rank_candidates(build(), profile)

    assert [s["title"] for s in first] == [s["title"] for s in second]
