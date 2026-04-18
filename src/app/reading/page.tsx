"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Book, ReadingStatus } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Filter,
  Heart,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";
import { StarRating } from "@/components/StarRating";

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

const STATUS_CONFIG: Record<
  ReadingStatus,
  { label: string; color: string; icon: string }
> = {
  READING: {
    label: "Reading",
    color: "bg-[#66bb6a]/10 text-[#2e7d32] border-[#66bb6a]/20",
    icon: "📖",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-[#42a5f5]/10 text-[#1565c0] border-[#42a5f5]/20",
    icon: "✅",
  },
  ON_HOLD: {
    label: "On Hold",
    color: "bg-[#ffa726]/10 text-[#e65100] border-[#ffa726]/20",
    icon: "⏸️",
  },
  PLAN_TO_READ: {
    label: "Plan to Read",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "🕐",
  },
};

// ─── Manage Categories Panel ─────────────────────────────────────────────────
function ManageCategoriesPanel({
  categories,
  onAdd,
  onDelete,
}: {
  categories: Category[];
  onAdd: (label: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      setError("Label is required");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await onAdd(newLabel.trim());
      setNewLabel("");
    } catch (err: any) {
      setError(err.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Manage Categories
      </h3>

      {/* Add new */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New category name..."
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm"
        />
        <button
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#d4a5a5] text-white rounded-xl text-sm hover:bg-[#c89595] transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          {adding ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Categories list */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm"
          >
            <span className="text-gray-700">{cat.label}</span>
            {confirmDeleteId === cat.id ? (
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() =>
                    onDelete(cat.id).then(() => setConfirmDeleteId(null))
                  }
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Yes
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(cat.id)}
                className="text-gray-300 hover:text-red-400 transition-colors ml-1"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Book Detail Modal ───────────────────────────────────────────────────────
function BookDetailModal({
  book,
  allKeywords,
  categories,
  onClose,
  onUpdate,
  onDelete,
}: {
  book: Book;
  allKeywords: Keyword[];
  categories: Category[];
  onClose: () => void;
  onUpdate: (book: Book) => void;
  onDelete: (id: number) => void;
}) {
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

  const getCategoryLabel = (code: string) => {
    return categories.find((c) => c.code === code)?.label || code;
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
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="PLAN_TO_READ">Plan to Read</option>
                </select>
              </div>

              {/* Current Chapter */}
              {(edited.status === "READING" || edited.status === "ON_HOLD") && (
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

// ─── Add Book Modal ──────────────────────────────────────────────────────────
function AddBookModal({
  allKeywords,
  categories,
  onClose,
  onAdd,
}: {
  allKeywords: Keyword[];
  categories: Category[];
  onClose: () => void;
  onAdd: () => void;
}) {
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
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="PLAN_TO_READ">Plan to Read</option>
                </select>
              </div>

              {/* Current Chapter */}
              {(form.status === "READING" || form.status === "ON_HOLD") && (
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

// ─── Book Card ───────────────────────────────────────────────────────────────
function BookCard({
  book,
  categories,
  onClick,
}: {
  book: Book;
  categories: Category[];
  onClick: () => void;
}) {
  const status = STATUS_CONFIG[book.status];
  const categoryLabel =
    categories.find((c) => c.code === book.category)?.label || book.category;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 space-y-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-[#f5e6e8] text-[#8b5a6b]">
          {categoryLabel}
        </span>
        <h3 className="font-medium text-sm leading-snug">{book.title}</h3>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${status.color}`}
        >
          {status.icon} {status.label}
        </span>
        {book.current_chapter && (
          <p className="text-xs text-gray-400">
            {book.status === "READING" ? "📖 " : "⏸ "}
            {book.current_chapter}
          </p>
        )}
        {book.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.keywords.slice(0, 3).map((kw) => (
              <span
                key={kw.code}
                style={{ color: kw.color }}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200"
              >
                {kw.label}
              </span>
            ))}
          </div>
        )}
        {book.is_favorite && <span className="text-xs text-[#d4a5a5]">❤️</span>}
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [allKeywords, setAllKeywords] = useState<Keyword[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "ALL">(
    "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");

  const fetchBooks = useCallback(() => {
    setLoading(true);
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      });
  }, []);

  const fetchCategories = useCallback(() => {
    fetch("/api/book-categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setAllKeywords);
  }, []);

  const toggleKeyword = (code: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(code) ? prev.filter((k) => k !== code) : [...prev, code],
    );
  };

  const updateBook = async (book: Book) => {
    await fetch(`/api/books/${book.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });
    const res = await fetch(`/api/books/${book.id}`);
    const updated = await res.json();
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBook = async (id: number) => {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const addCategory = async (label: string) => {
    const res = await fetch("/api/book-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setCategories((prev) =>
      [...prev, data].sort((a, b) => a.label.localeCompare(b.label)),
    );
  };

  const deleteCategory = async (id: number) => {
    await fetch(`/api/book-categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && b.category !== categoryFilter)
        return false;
      if (search && !b.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (favoritesOnly && !b.is_favorite) return false;
      if (selectedKeywords.length > 0) {
        const codes = b.keywords.map((k) => k.code);
        if (!selectedKeywords.every((c) => codes.includes(c))) return false;
      }
      return true;
    });
  }, [
    books,
    statusFilter,
    categoryFilter,
    search,
    favoritesOnly,
    selectedKeywords,
  ]);

  const statusFilters: { value: ReadingStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "READING", label: "Reading" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PLAN_TO_READ", label: "Plan to Read" },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your reading list...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl mb-2">Reading List</h1>
            <p className="text-gray-500">{filtered.length} stories</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Manage Categories toggle */}
            <button
              onClick={() => setShowManageCategories(!showManageCategories)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full transition-colors text-sm ${
                showManageCategories
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Settings size={16} />
              Categories
              {showManageCategories ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {/* Add Story */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Story
            </button>
          </div>
        </motion.div>

        {/* Manage Categories Panel — collapsible */}
        <AnimatePresence>
          {showManageCategories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ManageCategoriesPanel
                categories={categories}
                onAdd={addCategory}
                onDelete={deleteCategory}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50"
          />

          {/* Status */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  statusFilter === f.value
                    ? "bg-[#d4a5a5] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                categoryFilter === "ALL"
                  ? "bg-[#d4a5a5] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setCategoryFilter(cat.code)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  categoryFilter === cat.code
                    ? "bg-[#d4a5a5] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Keywords + Favorites */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Keywords</span>
            {selectedKeywords.length > 0 && (
              <span className="text-xs text-gray-400">
                (showing stories with ALL selected)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${
                favoritesOnly
                  ? "bg-[#f5e6e8] text-[#d4a5a5] border-2 border-[#d4a5a5]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart
                size={14}
                className={favoritesOnly ? "fill-[#d4a5a5]" : ""}
              />
              Favorites
            </button>

            {allKeywords.map((kw) => {
              const isSelected = selectedKeywords.includes(kw.code);
              return (
                <button
                  key={kw.code}
                  onClick={() => toggleKeyword(kw.code)}
                  style={
                    isSelected
                      ? { backgroundColor: kw.color, color: "white" }
                      : {}
                  }
                  className={`px-4 py-2 rounded-full text-sm transition-all border-2 ${
                    isSelected
                      ? "border-transparent"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                  }`}
                >
                  {kw.label}
                  {isSelected && (
                    <span className="ml-1 text-xs opacity-80">✓</span>
                  )}
                </button>
              );
            })}

            {(selectedKeywords.length > 0 || favoritesOnly) && (
              <button
                onClick={() => {
                  setSelectedKeywords([]);
                  setFavoritesOnly(false);
                }}
                className="px-4 py-2 rounded-full text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Clear ✕
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <BookCard
                book={book}
                categories={categories}
                onClick={() => setSelected(book)}
              />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No stories found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or add a new story!
            </p>
          </div>
        )}
      </div>

      {selected && (
        <BookDetailModal
          book={selected}
          allKeywords={allKeywords}
          categories={categories}
          onClose={() => setSelected(null)}
          onUpdate={updateBook}
          onDelete={(id) => {
            deleteBook(id);
            setSelected(null);
          }}
        />
      )}

      {showAddModal && (
        <AddBookModal
          allKeywords={allKeywords}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            fetchBooks();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
