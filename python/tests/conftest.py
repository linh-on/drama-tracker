import os
import sys
from itertools import count

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def make_candidate():
    ids = count(1)

    def _make(title, features, vote_average=7.0, tmdb_keyword_ids=None, tmdb_id=None):
        return {
            "tmdb_id": tmdb_id if tmdb_id is not None else next(ids),
            "title": title,
            "features": features,
            "vote_average": vote_average,
            "tmdb_keyword_ids": set(tmdb_keyword_ids or []),
        }

    return _make


@pytest.fixture
def profile():
    return {
        "feature_text": "korean korean series series romance romance slowburn slowburn",
        "keyword_weights": {100: 5, 200: 3},
    }
