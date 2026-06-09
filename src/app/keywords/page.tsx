"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Plus, Tag } from "lucide-react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
  tmdb_keyword_id: number;
}

interface TMDBKeyword {
  id: number;
  name: string;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#06b6d4",
  "#6366f1",
];

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [search, setSearch] = useState("");
  const [tmdbResults, setTmdbResults] = useState<TMDBKeyword[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<TMDBKeyword | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchKeywords = useCallback(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then((data) => setKeywords(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  useEffect(() => {
    if (search.length < 2) {
      setTmdbResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/tmdb-keywords?query=${encodeURIComponent(search)}`,
        );
        const data = await res.json();
        setTmdbResults(data);
        setShowDropdown(true);
      } catch {
        setTmdbResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleSelectTMDB = (kw: TMDBKeyword) => {
    setSelectedKeyword(kw);
    setSearch(kw.name);
    setShowDropdown(false);
    setError("");
  };

  const handleAdd = async () => {
    if (!selectedKeyword) {
      setError("Please select a keyword from the search results");
      return;
    }
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: selectedKeyword.name,
          color: selectedColor,
          tmdb_keyword_id: selectedKeyword.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add keyword");
        return;
      }

      fetchKeywords();
      setSearch("");
      setSelectedKeyword(null);
      setSelectedColor(COLORS[0]);
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    setConfirmDeleteId(null);
  };

  const handleColorChange = async (id: number, newColor: string) => {
    await fetch(`/api/keywords/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: newColor }),
    });
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, color: newColor } : k)),
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="text-2xl sm:text-4xl mb-2">Keywords</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Search and add keywords from TMDB to tag your shows and books.
          </p>
        </motion.div>

        {/* Add Keyword */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg mb-4">Add Keyword</h2>

          {/* Search */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <Search size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedKeyword(null);
                }}
                placeholder="Search TMDB keywords..."
                className="flex-1 text-sm outline-none bg-transparent min-w-0"
              />
              {searching && (
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  Searching...
                </span>
              )}
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedKeyword(null);
                    setShowDropdown(false);
                  }}
                >
                  <X size={14} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && tmdbResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                  {tmdbResults.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={() => handleSelectTMDB(kw)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 flex items-center gap-2 transition-colors"
                    >
                      <Tag size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="flex-1 truncate">{kw.name}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">
                        #{kw.id}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected keyword preview */}
          {selectedKeyword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center gap-2 flex-wrap"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
              <span
                className="px-3 py-1 rounded-full text-sm text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedKeyword.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                TMDB ID: {selectedKeyword.id}
              </span>
            </motion.div>
          )}

          {/* Color picker */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pick a color:</p>
            <div className="flex flex-wrap gap-2 items-center">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform ${
                    selectedColor === color
                      ? "scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 dark:ring-offset-gray-800"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* Custom color picker */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer border border-gray-200 dark:border-gray-700 p-0.5"
                  title="Pick a custom color"
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">
              Selected: <span style={{ color: selectedColor }}>■</span>{" "}
              {selectedColor}
            </p>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleAdd}
            disabled={adding || !selectedKeyword}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors disabled:opacity-50 text-sm"
          >
            <Plus size={16} />
            {adding ? "Adding..." : "Add Keyword"}
          </button>
        </motion.div>

        {/* Your Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base sm:text-lg mb-4">
            Your Keywords
            <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 font-normal">
              ({keywords.length})
            </span>
          </h2>

          {keywords.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Tag size={40} className="mx-auto mb-3 opacity-30" />
              <p>No keywords yet</p>
              <p className="text-sm mt-1">
                Search and add keywords from TMDB above!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {keywords.map((kw) => (
                <motion.div
                  key={kw.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-sm"
                  style={{ backgroundColor: kw.color }}
                >
                  <span>{kw.label}</span>

                  {/* Color change */}
                  <div className="relative w-4 h-4 flex-shrink-0">
                    <input
                      type="color"
                      value={kw.color}
                      onChange={(e) => handleColorChange(kw.id, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Change color"
                    />
                    <span className="text-white/70 hover:text-white text-xs cursor-pointer select-none">
                      🎨
                    </span>
                  </div>

                  {/* Delete */}
                  {confirmDeleteId === kw.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(kw.id)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded-full"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded-full"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(kw.id)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
