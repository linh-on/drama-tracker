"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
} from "lucide-react";

interface RecommendedShow {
  tmdb_id: number;
  title: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  genres: string;
  poster_url: string | null;
  media_type: string;
  similarity_score: number;
  hybrid_score: number;
}

interface CountryRecs {
  country: string;
  country_name: string;
  emoji: string;
  shows: RecommendedShow[];
}

interface Recommendations {
  [key: string]: CountryRecs;
  _cached_at?: any;
}

const COUNTRY_ORDER = [
  "KOREAN",
  "THAI",
  "VIETNAMESE",
  "CHINESE_TAIWANESE",
  "JAPANESE",
  "AMERICAN",
];

const COUNTRY_TO_APP: Record<string, string> = {
  KOREAN: "KOREAN",
  THAI: "THAI",
  VIETNAMESE: "VIETNAMESE",
  CHINESE_TAIWANESE: "CHINESE_TAIWANESE",
  JAPANESE: "JAPANESE",
  AMERICAN: "AMERICAN",
};

function ShowCard({
  show,
  index,
  country,
}: {
  show: RecommendedShow;
  index: number;
  country: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToList = async () => {
    setAdding(true);
    try {
      const res = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: show.title,
          country: COUNTRY_TO_APP[country] || "KOREAN",
          type: show.media_type === "movie" ? "MOVIE" : "SERIES",
          status: "PLAN_TO_WATCH",
          poster_url: show.poster_url,
          synopsis: show.overview,
          is_favorite: false,
          keywords: [],
        }),
      });
      if (res.ok) setAdded(true);
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex gap-3 p-3">
        {show.poster_url ? (
          <img
            src={show.poster_url}
            alt={show.title}
            className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📺</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-snug mb-1">
            {show.title}
          </h3>

          <div className="flex items-center gap-1 mb-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">
              {show.vote_average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({show.vote_count.toLocaleString()})
            </span>
          </div>

          {show.genres && (
            <p className="text-xs text-gray-400 mb-1">{show.genres}</p>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
            {show.media_type === "movie" ? "🎬 Movie" : "📺 Series"}
          </span>

          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4a5a5] rounded-full"
                style={{ width: `${Math.min(show.hybrid_score * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {Math.round(show.hybrid_score * 100)}% match
            </span>
          </div>

          <button
            onClick={handleAddToList}
            disabled={adding || added}
            className={`mt-2 flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
              added
                ? "bg-green-100 text-green-600"
                : "bg-[#f5e6e8] text-[#d4a5a5] hover:bg-[#d4a5a5] hover:text-white"
            } disabled:opacity-50`}
          >
            {added ? <Check size={10} /> : <Plus size={10} />}
            {added ? "Added!" : adding ? "Adding..." : "Plan to Watch"}
          </button>
        </div>
      </div>

      {show.overview && (
        <div className="px-3 pb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Less" : "More info"}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-gray-500 mt-1 leading-relaxed overflow-hidden"
              >
                {show.overview}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function CountrySection({ data }: { data: CountryRecs }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 mb-4 group w-full text-left"
      >
        <h2 className="text-xl">{data.country_name}</h2>
        <span className="text-sm text-gray-400">{data.shows.length} picks</span>
        <div className="ml-auto text-gray-400 group-hover:text-gray-600 transition-colors">
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {data.shows.map((show, i) => (
                <ShowCard
                  key={show.tmdb_id}
                  show={show}
                  index={i}
                  country={data.country}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchRecs = async (forceRefresh = false) => {
    setLoading(true);
    setError("");
    try {
      const url = forceRefresh
        ? "/api/recommendations?refresh=true"
        : "/api/recommendations";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = await res.json();
      setRecs(data);
      if (data._cached_at) {
        setLastUpdated(new Date(data._cached_at));
        setFromCache(true);
      } else {
        setLastUpdated(new Date());
        setFromCache(false);
      }
    } catch {
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load from cache on page visit
  useEffect(() => {
    fetchRecs(false);
  }, []);

  const orderedCountries = COUNTRY_ORDER.filter((c) => recs && recs[c]);

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-4xl mb-2">For You</h1>
            <p className="text-gray-500">
              Personalized picks based on your taste — powered by AI
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                {fromCache ? "Cached from" : "Updated"}:{" "}
                {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchRecs(true)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </motion.div>

        {/* Initial state */}
        {!loading && !recs && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <span className="text-5xl mb-4">✨</span>
            <p className="text-lg mb-2">Ready to discover new shows?</p>
            <p className="text-sm">
              Click "Get Recommendations" to generate your personalized picks!
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-[#d4a5a5] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Analyzing your taste profile...</p>
            <p className="text-gray-400 text-sm mt-1">
              This may take 30-60 seconds
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchRecs(true)}
              className="px-5 py-2 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recommendations */}
        {!loading &&
          !error &&
          recs &&
          (orderedCountries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No recommendations found</p>
              <p className="text-sm mt-2">
                Add and rate more shows to get personalized picks!
              </p>
            </div>
          ) : (
            orderedCountries.map((country) => (
              <CountrySection key={country} data={recs[country]} />
            ))
          ))}
      </div>
    </div>
  );
}
