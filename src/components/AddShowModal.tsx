"use client";
import { useState, useEffect } from "react";
import { Country, ShowType, WatchStatus } from "@/lib/types";
import { StarRating } from "./StarRating";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

interface Props {
  onClose: () => void;
  onAdd: () => void; // refresh the list after adding
}

export function AddShowModal({ onClose, onAdd }: Props) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  });

  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setKeywords);
  }, []);

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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            <h2 className="text-2xl mb-6">Add New Show</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  placeholder="e.g. Crash Landing on You"
                  autoFocus
                />
              </div>

              {/* Country + Type row */}
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

              {/* Current Episode — only for Currently Watching */}
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

              {/* Stopped At — only for Partially Watched */}
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

              {/* Error */}
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Action buttons */}
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
