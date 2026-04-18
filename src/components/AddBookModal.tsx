"use client";
import { useState } from "react";
import { ReadingStatus } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

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
  allKeywords: Keyword[];
  categories: Category[];
  onClose: () => void;
  onAdd: () => void;
}

export function AddBookModal({
  allKeywords,
  categories,
  onClose,
  onAdd,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    category: categories[0]?.code || "STANDALONE",
    status: "PLAN_TO_READ" as ReadingStatus,
    current_chapter: "",
    notes: "",
    is_favorite: false,
    selectedKeywords: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          status: form.status,
          current_chapter: form.current_chapter || null,
          notes: form.notes || null,
          is_favorite: form.is_favorite,
          keywords: form.selectedKeywords,
        }),
      });
      if (!res.ok) throw new Error();
      onAdd();
      onClose();
    } catch {
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
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10"
          >
            <X size={20} />
          </button>
          <div className="p-8">
            <h2 className="text-2xl mb-6">Add New Story</h2>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  placeholder="Story title..."
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
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
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as ReadingStatus,
                      current_chapter: "",
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
              {(form.status === "READING" ||
                form.status === "PARTIALLY_READ") && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {form.status === "READING"
                      ? "Current Chapter"
                      : "Stopped At"}
                  </label>
                  <input
                    type="text"
                    value={form.current_chapter}
                    onChange={(e) =>
                      setForm({ ...form, current_chapter: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                    placeholder="e.g. chapter 12"
                  />
                </div>
              )}

              {/* Keywords */}
              {allKeywords.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allKeywords.map((kw) => {
                      const isSelected = form.selectedKeywords.includes(
                        kw.code,
                      );
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
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                  rows={2}
                  placeholder="Add your thoughts..."
                />
              </div>

              {/* Favorite */}
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

              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Story"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
