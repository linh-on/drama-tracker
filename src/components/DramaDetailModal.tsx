"use client";
import { useState } from "react";
import { Show, WatchStatus } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { StatusTag } from "./StatusTag";
import { StarRating } from "./StarRating";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  show: Show;
  onClose: () => void;
  onUpdate: (show: Show) => void;
}

export function DramaDetailModal({ show, onClose, onUpdate }: Props) {
  const [edited, setEdited] = useState(show);

  const handleSave = () => {
    onUpdate(edited);
    onClose();
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {/* Top section — poster + info */}
            <div className="flex gap-6 mb-6">
              {/* Poster placeholder */}
              <div className="w-32 h-48 flex-shrink-0 bg-gradient-to-br from-[#f5e6e8] to-[#e8d5f0] rounded-2xl flex items-center justify-center">
                <span className="text-5xl">📺</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl mb-3">{edited.title}</h2>
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

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Type
                    </label>
                    <p className="text-sm text-gray-700 capitalize">
                      {edited.type.toLowerCase().replace("_", " ")}
                    </p>
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

                  {/* Current Episode — only for Currently Watching */}
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

                  {/* Stopped At — only for Partially Watched */}
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

            {/* Bottom section */}
            <div className="space-y-4">
              {/* Keywords */}
              {edited.keywords.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {edited.keywords.map((kw) => (
                      <span
                        key={kw.code}
                        style={{ color: kw.color, borderColor: kw.color }}
                        className="px-3 py-1 rounded-full text-xs border bg-gray-50"
                      >
                        {kw.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Favorite toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setEdited({ ...edited, is_favorite: !edited.is_favorite })
                  }
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    edited.is_favorite
                      ? "bg-[#f5e6e8] text-[#d4a5a5] border-[#d4a5a5]"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {edited.is_favorite ? "❤️ Favorited" : "🤍 Add to Favorites"}
                </button>
              </div>
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
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors"
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
