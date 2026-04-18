"use client";
import { useState, useEffect } from "react";
import { Show, WatchStatus, Country, ShowType } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { StatusTag } from "./StatusTag";
import { StarRating } from "./StarRating";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

interface Props {
  show: Show;
  onClose: () => void;
  onUpdate: (show: Show) => void;
  onDelete: (id: number) => void;
}

export function DramaDetailModal({ show, onClose, onUpdate, onDelete }: Props) {
  const [edited, setEdited] = useState(show);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [editingTitle, setEditingTitle] = useState(false);

  // Fetch all available keywords
  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setAllKeywords);
  }, []);

  const handleSave = () => {
    onUpdate(edited);
    onClose();
  };

  const handleDelete = () => {
    onDelete(show.id);
    onClose();
  };

  // Toggle a keyword on the show
  const toggleKeyword = (kw: Keyword) => {
    const hasKeyword = edited.keywords.some((k) => k.code === kw.code);
    if (hasKeyword) {
      setEdited({
        ...edited,
        keywords: edited.keywords.filter((k) => k.code !== kw.code),
      });
    } else {
      setEdited({
        ...edited,
        keywords: [...edited.keywords, kw],
      });
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
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {/* Top section */}
            <div className="flex gap-6 mb-6">
              {/* Poster */}
              <div className="w-36 flex-shrink-0">
                {edited.poster_url ? (
                  <div className="relative group">
                    <img
                      src={edited.poster_url}
                      alt={edited.title}
                      className="w-full rounded-2xl shadow-md"
                    />
                    <button
                      onClick={() => setEdited({ ...edited, poster_url: null })}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-[#f5e6e8] to-[#e8d5f0] rounded-2xl flex items-center justify-center">
                    <span className="text-5xl">📺</span>
                  </div>
                )}
                {/* Manual poster URL */}
                <input
                  type="text"
                  value={edited.poster_url ?? ""}
                  onChange={(e) =>
                    setEdited({ ...edited, poster_url: e.target.value || null })
                  }
                  className="mt-2 w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  placeholder="Paste poster URL..."
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                {/* Editable title */}
                <div className="mb-3">
                  {editingTitle ? (
                    <input
                      type="text"
                      value={edited.title}
                      onChange={(e) =>
                        setEdited({ ...edited, title: e.target.value })
                      }
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingTitle(false)
                      }
                      className="w-full text-2xl px-2 py-1 border border-[#d4a5a5] rounded-xl bg-gray-50 outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-start gap-2 group">
                      <h2 className="text-2xl leading-snug">{edited.title}</h2>
                      <button
                        onClick={() => setEditingTitle(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600 mt-1 px-2 py-0.5 bg-gray-100 rounded-full flex-shrink-0"
                      >
                        ✏️ edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <CategoryBadge country={edited.country} />
                  <StatusTag status={edited.status} />
                </div>

                <div className="space-y-3">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Rating
                    </label>
                    <StarRating
                      rating={edited.rating}
                      onRate={(r) => setEdited({ ...edited, rating: r })}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Country
                    </label>
                    <select
                      value={edited.country}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          country: e.target.value as Country,
                        })
                      }
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full"
                    >
                      <option value="KOREAN">Korean</option>
                      <option value="THAI">Thai</option>
                      <option value="VIETNAMESE">Vietnamese</option>
                      <option value="CHINESE_TAIWANESE">
                        Chinese/Taiwanese
                      </option>
                      <option value="JAPANESE">Japanese</option>
                      <option value="AMERICAN">American</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Type
                    </label>
                    <select
                      value={edited.type}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          type: e.target.value as ShowType,
                        })
                      }
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full"
                    >
                      <option value="SERIES">Series</option>
                      <option value="MOVIE">Movie</option>
                      <option value="ANIME">Anime</option>
                      <option value="WEB_DRAMA">Web Drama</option>
                      <option value="VARIETY">Variety</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Status
                    </label>
                    <select
                      value={edited.status}
                      onChange={(e) =>
                        setEdited({
                          ...edited,
                          status: e.target.value as WatchStatus,
                        })
                      }
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full"
                    >
                      <option value="CURRENTLY_WATCHING">
                        Currently Watching
                      </option>
                      <option value="PARTIALLY_WATCHED">
                        Partially Watched
                      </option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PLAN_TO_WATCH">Plan to Watch</option>
                    </select>
                  </div>

                  {/* Current Episode */}
                  {edited.status === "CURRENTLY_WATCHING" && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Current Episode
                      </label>
                      <input
                        type="text"
                        value={edited.current_ep ?? ""}
                        onChange={(e) =>
                          setEdited({ ...edited, current_ep: e.target.value })
                        }
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full"
                        placeholder="e.g. ep 5"
                      />
                    </div>
                  )}

                  {/* Stopped At */}
                  {edited.status === "PARTIALLY_WATCHED" && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Stopped At
                      </label>
                      <input
                        type="text"
                        value={edited.current_ep ?? ""}
                        onChange={(e) =>
                          setEdited({ ...edited, current_ep: e.target.value })
                        }
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full"
                        placeholder="e.g. ep 8 or season 2"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Synopsis
              </label>
              <textarea
                value={edited.synopsis ?? ""}
                onChange={(e) =>
                  setEdited({ ...edited, synopsis: e.target.value || null })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                rows={3}
                placeholder="Add a synopsis..."
              />
            </div>

            <div className="space-y-4">
              {/* Keywords — toggle from all available */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Keywords
                </label>
                {allKeywords.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No keywords available. Add some in the Keywords page!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allKeywords.map((kw) => {
                      const isSelected = edited.keywords.some(
                        (k) => k.code === kw.code,
                      );
                      return (
                        <button
                          key={kw.code}
                          onClick={() => toggleKeyword(kw)}
                          style={
                            isSelected
                              ? { backgroundColor: kw.color, color: "white" }
                              : { color: kw.color, borderColor: kw.color }
                          }
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            isSelected
                              ? "border-transparent"
                              : "bg-white hover:opacity-80"
                          }`}
                        >
                          {kw.label} {isSelected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  My Notes
                </label>
                <textarea
                  value={edited.comment ?? ""}
                  onChange={(e) =>
                    setEdited({ ...edited, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  rows={3}
                  placeholder="Add your thoughts..."
                />
              </div>

              {/* Favorite */}
              <div>
                <button
                  onClick={() =>
                    setEdited({ ...edited, is_favorite: !edited.is_favorite })
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border ${
                    edited.is_favorite
                      ? "bg-[#f5e6e8] text-[#d4a5a5] border-[#d4a5a5]"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {edited.is_favorite ? "❤️ Favorited" : "🤍 Add to Favorites"}
                </button>
              </div>

              {/* Delete confirmation */}
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4"
                >
                  <p className="text-sm text-red-600 mb-3">
                    Are you sure you want to delete{" "}
                    <strong>{show.title}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
