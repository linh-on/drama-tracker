"use client";
import { useState } from "react";
import { Book, ReadingStatus } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2 } from "lucide-react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

interface Category {
  id: number;
  code: string;
  label: string;
}

interface Props {
  book: Book;
  allKeywords: Keyword[];
  categories: Category[];
  onClose: () => void;
  onUpdate: (book: Book) => void;
  onDelete: (id: number) => void;
}

export function BookDetailModal({
  book,
  allKeywords,
  categories,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [edited, setEdited] = useState(book);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const toggleKeyword = (kw: Keyword) => {
    const has = edited.keywords.some((k) => k.code === kw.code);
    setEdited({
      ...edited,
      keywords: has
        ? edited.keywords.filter((k) => k.code !== kw.code)
        : [...edited.keywords, kw],
    });
  };

  const handleSave = () => {
    onUpdate(edited);
    onClose();
  };
  const handleDelete = () => {
    onDelete(book.id);
    onClose();
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
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10"
          >
            <X size={20} />
          </button>
          <div className="p-8">
            {/* Editable Title */}
            <div className="mb-4">
              {editingTitle ? (
                <input
                  type="text"
                  value={edited.title}
                  onChange={(e) =>
                    setEdited({ ...edited, title: e.target.value })
                  }
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  className="w-full text-2xl px-2 py-1 border border-[#d4a5a5] rounded-xl bg-gray-50 outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-start gap-2 group">
                  <h2 className="text-2xl leading-snug flex-1">
                    {edited.title}
                  </h2>
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-gray-600 mt-1 px-2 py-0.5 bg-gray-100 rounded-full flex-shrink-0"
                  >
                    ✏️ edit
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={edited.category}
                  onChange={(e) =>
                    setEdited({ ...edited, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.label}
                    </option>
                  ))}
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
                      status: e.target.value as ReadingStatus,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="READING">Reading</option>
                  <option value="PARTIALLY_READ">Partially Read</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PLAN_TO_READ">Plan to Read</option>
                </select>
              </div>

              {/* Current Chapter */}
              {(edited.status === "READING" ||
                edited.status === "PARTIALLY_READ") && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {edited.status === "READING"
                      ? "Current Chapter"
                      : "Stopped At"}
                  </label>
                  <input
                    type="text"
                    value={edited.current_chapter ?? ""}
                    onChange={(e) =>
                      setEdited({ ...edited, current_chapter: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="e.g. chapter 12"
                  />
                </div>
              )}

              {/* Keywords */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Keywords
                </label>
                {allKeywords.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No keywords yet. Add some on the Keywords page!
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
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${isSelected ? "border-transparent" : "bg-white hover:opacity-80"}`}
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
                <label className="block text-sm text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={edited.notes ?? ""}
                  onChange={(e) =>
                    setEdited({ ...edited, notes: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  rows={3}
                  placeholder="Add your thoughts..."
                />
              </div>

              {/* Favorite */}
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

              {/* Delete confirmation */}
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4"
                >
                  <p className="text-sm text-red-600 mb-3">
                    Delete <strong>{book.title}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
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
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595]"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
