"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  X,
  ArrowUpDown,
  ThumbsDown,
  RotateCcw,
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

interface DismissedShow {
  id: number;
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  country: string;
  media_type: string;
  vote_average: number;
  genres: string;
  overview: string;
}

interface CountryRecs {
  country: string;
  country_name: string;
  emoji: string;
  shows: RecommendedShow[];
  all_shows: RecommendedShow[];
  total: number;
}

interface Recommendations {
  [key: string]: CountryRecs | any;
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

// ─── Show Card ────────────────────────────────────────────────────────────────
function ShowCard({
  show,
  index,
  country,
  compact = false,
  onDismiss,
}: {
  show: RecommendedShow;
  index: number;
  country: string;
  compact?: boolean;
  onDismiss?: (show: RecommendedShow) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [dismissing, setDismissing] = useState(false);

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
    } finally {
      setAdding(false);
    }
  };

  const handleDismiss = async () => {
    setDismissing(true);
    try {
      await fetch("/api/recommendations/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: show.tmdb_id,
          title: show.title,
          poster_url: show.poster_url,
          country,
          media_type: show.media_type,
          vote_average: show.vote_average,
          genres: show.genres,
          overview: show.overview,
        }),
      });
      onDismiss?.(show);
    } catch {
    } finally {
      setDismissing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
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
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-medium text-sm leading-snug mb-1 flex-1">
              {show.title}
            </h3>
            {/* Not for me button */}
            {onDismiss && (
              <button
                onClick={handleDismiss}
                disabled={dismissing}
                title="Not for me"
                className="flex-shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <ThumbsDown size={12} />
              </button>
            )}
          </div>

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

      {!compact && show.overview && (
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

// ─── Dismissed Card ───────────────────────────────────────────────────────────
function DismissedCard({
  show,
  onRestore,
}: {
  show: DismissedShow;
  onRestore: (id: number) => void;
}) {
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await fetch("/api/recommendations/dismiss", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id: show.tmdb_id }),
      });
      onRestore(show.tmdb_id);
    } catch {
    } finally {
      setRestoring(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
    >
      <div className="flex gap-3 p-3">
        {show.poster_url ? (
          <img
            src={show.poster_url}
            alt={show.title}
            className="w-12 h-18 object-cover rounded-xl flex-shrink-0 opacity-60"
          />
        ) : (
          <div className="w-12 h-18 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg opacity-50">📺</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-snug text-gray-400 mb-1">
            {show.title}
          </h3>
          {show.genres && (
            <p className="text-xs text-gray-300 mb-2">{show.genres}</p>
          )}

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white border border-gray-200 text-gray-500 hover:border-[#d4a5a5] hover:text-[#d4a5a5] transition-colors disabled:opacity-50"
          >
            <RotateCcw size={10} />
            {restoring ? "Restoring..." : "Add back"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── See All Modal ────────────────────────────────────────────────────────────
function SeeAllModal({
  data,
  onClose,
  dismissedIds,
  onDismiss,
}: {
  data: CountryRecs;
  onClose: () => void;
  dismissedIds: Set<number>;
  onDismiss: (show: RecommendedShow) => void;
}) {
  const [sortBy, setSortBy] = useState<"hybrid" | "similarity" | "rating">(
    "hybrid",
  );

  const sorted = [...(data.all_shows || [])]
    .filter((s) => !dismissedIds.has(s.tmdb_id))
    .sort((a, b) => {
      if (sortBy === "similarity")
        return b.similarity_score - a.similarity_score;
      if (sortBy === "rating") return b.vote_average - a.vote_average;
      return b.hybrid_score - a.hybrid_score;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl">{data.country_name} Recommendations</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {sorted.length} shows found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <ArrowUpDown size={14} className="text-gray-400 ml-2" />
              {[
                { value: "hybrid", label: "Best Match" },
                { value: "similarity", label: "Similarity" },
                { value: "rating", label: "Rating" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as any)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    sortBy === opt.value
                      ? "bg-[#d4a5a5] text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sorted.map((show, i) => (
              <ShowCard
                key={show.tmdb_id}
                show={show}
                index={i}
                country={data.country}
                compact
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Country Section ──────────────────────────────────────────────────────────
function CountrySection({
  data,
  dismissedIds,
  onDismiss,
}: {
  data: CountryRecs;
  dismissedIds: Set<number>;
  onDismiss: (show: RecommendedShow) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [localShows, setLocalShows] = useState<RecommendedShow[]>([]);

  useEffect(() => {
    // Filter dismissed from all_shows and take top 10
    const available = data.all_shows.filter(
      (s) => !dismissedIds.has(s.tmdb_id),
    );
    setLocalShows(available.slice(0, 10));
  }, [data.all_shows, dismissedIds]);

  const handleDismiss = (show: RecommendedShow) => {
    onDismiss(show);
    // Immediately refill from all_shows
    setLocalShows((prev) => {
      const remaining = prev.filter((s) => s.tmdb_id !== show.tmdb_id);
      // Find next available show not already shown and not dismissed
      const shownIds = new Set(remaining.map((s) => s.tmdb_id));
      shownIds.add(show.tmdb_id);
      const next = data.all_shows.find(
        (s) => !shownIds.has(s.tmdb_id) && !dismissedIds.has(s.tmdb_id),
      );
      return next ? [...remaining, next] : remaining;
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 group flex-1 text-left"
          >
            <h2 className="text-xl">{data.country_name}</h2>
            <span className="text-sm text-gray-400">
              {localShows.length} picks
            </span>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </button>
          {data.total > data.shows.length && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-[#d4a5a5] border border-[#d4a5a5] rounded-full hover:bg-[#f5e6e8] transition-colors"
            >
              See All ({data.total})
            </button>
          )}
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {localShows.map((show, i) => (
                    <ShowCard
                      key={show.tmdb_id}
                      show={show}
                      index={i}
                      country={data.country}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showAll && (
          <SeeAllModal
            data={data}
            onClose={() => setShowAll(false)}
            dismissedIds={dismissedIds}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Dismissed Section ────────────────────────────────────────────────────────
function DismissedSection({
  dismissed,
  onRestore,
}: {
  dismissed: DismissedShow[];
  onRestore: (tmdb_id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(true); // collapsed by default

  if (dismissed.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-12 pt-8 border-t border-gray-100"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 mb-4 group w-full text-left"
      >
        <ThumbsDown size={18} className="text-gray-400" />
        <h2 className="text-lg text-gray-500">Not For Me</h2>
        <span className="text-sm text-gray-300">{dismissed.length} shows</span>
        <div className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
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
              <AnimatePresence mode="popLayout">
                {dismissed.map((show) => (
                  <DismissedCard
                    key={show.tmdb_id}
                    show={show}
                    onRestore={onRestore}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingCache, setLoadingCache] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("");
  const [dismissed, setDismissed] = useState<DismissedShow[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadCache = async () => {
    try {
      const [recRes, dismissedRes] = await Promise.all([
        fetch("/api/recommendations"),
        fetch("/api/recommendations/dismissed"),
      ]);
      const recData = await recRes.json();
      const dismissedData = await dismissedRes.json();

      if (!recData._no_cache && !recData.error) {
        setRecs(recData);
        if (recData._cached_at) setLastUpdated(new Date(recData._cached_at));
      }

      if (Array.isArray(dismissedData)) {
        setDismissed(dismissedData);
        setDismissedIds(
          new Set(dismissedData.map((d: DismissedShow) => d.tmdb_id)),
        );
      }
    } catch {
    } finally {
      setLoadingCache(false);
    }
  };

  useEffect(() => {
    loadCache();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (jobId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/recommendations/status?jobId=${jobId}`);
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(pollRef.current!);
          setGenerating(false);
          setJobStatus("");
          await loadCache();
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setGenerating(false);
          setJobStatus("");
          setError("Recommendations failed. Please try again.");
        } else {
          setJobStatus("Analyzing your taste profile...");
        }
      } catch {}
    }, 10000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setJobStatus("Starting...");
    try {
      const res = await fetch("/api/recommendations/generate", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobStatus("Analyzing your taste profile...");
      startPolling(data.jobId);
    } catch {
      setGenerating(false);
      setJobStatus("");
      setError("Failed to start recommendations. Please try again.");
    }
  };

  const handleDismiss = (show: RecommendedShow) => {
    const dismissedShow: DismissedShow = {
      id: 0,
      tmdb_id: show.tmdb_id,
      title: show.title,
      poster_url: show.poster_url,
      country: "",
      media_type: show.media_type,
      vote_average: show.vote_average,
      genres: show.genres,
      overview: show.overview,
    };
    setDismissed((prev) => [dismissedShow, ...prev]);
    setDismissedIds((prev) => new Set([...prev, show.tmdb_id]));
  };

  const handleRestore = (tmdb_id: number) => {
    setDismissed((prev) => prev.filter((d) => d.tmdb_id !== tmdb_id));
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(tmdb_id);
      return next;
    });
  };

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
              Personalized picks based on your taste
            </p>
            {lastUpdated && !generating && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
            {generating ? "Running..." : "Get Recommendations"}
          </button>
        </motion.div>

        {/* Generating banner */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-[#f5e6e8] border border-[#d4a5a5]/30 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-5 h-5 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm text-[#8b5a6b] font-medium">
                  {jobStatus}
                </p>
                <p className="text-xs text-[#8b5a6b]/70 mt-0.5">
                  This takes a few minutes. You can browse other pages...
                  Results will appear when ready!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mb-6 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loadingCache && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        )}

        {/* No cache */}
        {!loadingCache && !recs && !generating && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <span className="text-5xl mb-4">✨</span>
            <p className="text-lg mb-2">Ready to discover new shows?</p>
            <p className="text-sm">
              Click "Get Recommendations" to generate your personalized picks!
            </p>
            <p className="text-xs mt-2 text-gray-300">
              First run takes 5-7 minutes
            </p>
          </div>
        )}

        {/* Recommendations */}
        {!loadingCache &&
          recs &&
          (orderedCountries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No recommendations found</p>
              <p className="text-sm mt-2">
                Add and rate more shows to get personalized picks!
              </p>
            </div>
          ) : (
            <>
              {orderedCountries.map((country) => (
                <CountrySection
                  key={country}
                  data={recs[country]}
                  dismissedIds={dismissedIds}
                  onDismiss={handleDismiss}
                />
              ))}

              {/* Dismissed section at bottom */}
              <DismissedSection
                dismissed={dismissed}
                onRestore={handleRestore}
              />
            </>
          ))}
      </div>
    </div>
  );
}
