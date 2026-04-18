"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Book, ReadingStatus } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Filter,
  Heart,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";
import { BookDetailModal } from "@/components/BookDetailModal";
import { AddBookModal } from "@/components/AddBookModal";

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
  string,
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
  PARTIALLY_READ: {
    label: "Partially Read",
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
  const status = STATUS_CONFIG[book.status] || {
    label: book.status,
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "📖",
  };
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

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  const statusFilters = [
    { value: "ALL", label: "All" },
    { value: "READING", label: "Reading" },
    { value: "PARTIALLY_READ", label: "Partially Read" },
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
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Story
            </button>
          </div>
        </motion.div>

        {/* Manage Categories Panel */}
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
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50"
          />

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
