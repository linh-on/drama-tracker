"use client";
import { useState, useEffect, useRef } from "react";
import { Country, ShowType, WatchStatus } from "@/lib/types";
import { StarRating } from "./StarRating";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

interface TMDBResult {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  synopsis: string | null;
  media_type: string;
  year: string;
}

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

export function AddShowModal({ onClose, onAdd }: Props) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // TMDB search state
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState({
    title: "",
    country: "KOREAN" as Country,
    type: "SERIES" as ShowType,
    status: "COMPLETED" as WatchStatus,
    current_ep: "",
    rating: null as number | null,
    comment: "",
    is_favorite: false,
    selectedKeywords: [] as string[],
    poster_url: null as string | null,
    synopsis: null as string | null,
  });

  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setKeywords);
  }, []);

  // Search TMDB as user types
  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      poster_url: null,
      synopsis: null,
    }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tmdb?query=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  // When user picks a result from dropdown
  const handleSelectResult = (result: TMDBResult) => {
    setForm((prev) => ({
      ...prev,
      title: result.title,
      poster_url: result.poster_url,
      synopsis: result.synopsis,
      type: result.media_type === "movie" ? "MOVIE" : "SERIES",
    }));
    setShowDropdown(false);
    setSearchResults([]);
  };

  const toggleKeyword = (code: string) => {
    setForm((prev) => ({
      ...prev,
      selectedKeywords: prev.selectedKeywords.includes(code)
        ? prev.selectedKeywords.filter((k) => k !== code)
        : [...prev.selectedKeywords, code],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          country: form.country,
          type: form.type,
          status: form.status,
          current_ep: form.current_ep || null,
          rating: form.rating,
          comment: form.comment || null,
          is_favorite: form.is_favorite,
          keywords: form.selectedKeywords,
          poster_url: form.poster_url,
          synopsis: form.synopsis,
        }),
      });

      if (!res.ok) throw new Error("Failed to add show");
      onAdd();
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <h2 className="text-2xl mb-6">Add New Show</h2>

            <div className="space-y-4">
              {/* Title with TMDB search */}
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-10"
                    placeholder="e.g. Crash Landing on You"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-[#d4a5a5] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* TMDB Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                    {searchResults.map((result) => (
                      <button
                        key={result.tmdb_id}
                        onClick={() => handleSelectResult(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        {/* Mini poster */}
                        {result.poster_url ? (
                          <img
                            src={result.poster_url}
                            alt={result.title}
                            className="w-8 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📺</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {result.media_type === "movie"
                              ? "🎬 Movie"
                              : "📺 Series"}{" "}
                            {result.year && `· ${result.year}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Poster preview if selected from TMDB */}
              {form.poster_url && (
                <div className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <img
                    src={form.poster_url}
                    alt={form.title}
                    className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      ✅ Matched from TMDB
                    </p>
                    {form.synopsis && (
                      <p className="text-xs text-gray-500 line-clamp-3">
                        {form.synopsis}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        poster_url: null,
                        synopsis: null,
                      }))
                    }
                    className="text-gray-400 hover:text-gray-600 self-start"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Country + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value as Country })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="KOREAN">Korean</option>
                    <option value="THAI">Thai</option>
                    <option value="VIETNAMESE">Vietnamese</option>
                    <option value="CHINESE_TAIWANESE">Chinese/Taiwanese</option>
                    <option value="JAPANESE">Japanese</option>
                    <option value="AMERICAN">American</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as ShowType })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="SERIES">Series</option>
                    <option value="MOVIE">Movie</option>
                    <option value="ANIME">Anime</option>
                    <option value="WEB_DRAMA">Web Drama</option>
                    <option value="VARIETY">Variety</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as WatchStatus,
                      current_ep: "",
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="CURRENTLY_WATCHING">Currently Watching</option>
                  <option value="PARTIALLY_WATCHED">Partially Watched</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PLAN_TO_WATCH">Plan to Watch</option>
                </select>
              </div>

              {/* Current Episode */}
              {form.status === "CURRENTLY_WATCHING" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Current Episode
                  </label>
                  <input
                    type="text"
                    value={form.current_ep}
                    onChange={(e) =>
                      setForm({ ...form, current_ep: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="e.g. ep 5"
                  />
                </div>
              )}

              {/* Stopped At */}
              {form.status === "PARTIALLY_WATCHED" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Stopped At
                  </label>
                  <input
                    type="text"
                    value={form.current_ep}
                    onChange={(e) =>
                      setForm({ ...form, current_ep: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="e.g. ep 8 or season 2"
                  />
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Rating
                </label>
                <StarRating
                  rating={form.rating}
                  onRate={(r) => setForm({ ...form, rating: r })}
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Keywords
                </label>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => {
                    const isSelected = form.selectedKeywords.includes(kw.code);
                    return (
                      <button
                        key={kw.code}
                        type="button"
                        onClick={() => toggleKeyword(kw.code)}
                        style={
                          isSelected
                            ? { backgroundColor: kw.color, color: "white" }
                            : {}
                        }
                        className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                          isSelected
                            ? "border-transparent"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {kw.label} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  rows={3}
                  placeholder="Add your thoughts..."
                />
              </div>

              {/* Favorite */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, is_favorite: !form.is_favorite })
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
                    form.is_favorite
                      ? "bg-[#f5e6e8] text-[#d4a5a5] border-[#d4a5a5]"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {form.is_favorite ? "❤️ Favorited" : "🤍 Add to Favorites"}
                </button>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Show"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
