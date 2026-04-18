"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trash2, Plus } from "lucide-react";

interface Keyword {
  id: number;
  code: string;
  label: string;
  color: string;
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#d4a5a5",
  "#6b7280",
  "#374151",
];

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#d4a5a5");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchKeywords = () => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then((data) => {
        setKeywords(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = async () => {
    if (!label.trim()) {
      setError("Label is required");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), color }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add keyword");
        return;
      }

      setKeywords((prev) => [...prev, data]);
      setLabel("");
      setColor("#d4a5a5");
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/keywords/${id}`, { method: "DELETE" });
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setError("Failed to delete keyword");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl mb-2">Keywords</h1>
          <p className="text-gray-500">
            Add and manage keywords to tag your shows
          </p>
        </motion.div>

        {/* Add Keyword Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200"
        >
          <h2 className="text-lg mb-4">Add New Keyword</h2>

          <div className="space-y-4">
            {/* Label input */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm"
                placeholder="e.g. Romance, Thriller, Slow Burn..."
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Color</label>

              {/* Preset colors */}
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-sm text-gray-500">
                  or pick a custom color
                </span>
              </div>
            </div>

            {/* Preview */}
            {label && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Preview
                </label>
                <span
                  style={{ backgroundColor: color, color: "white" }}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm"
                >
                  {label}
                </span>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors disabled:opacity-50 text-sm"
            >
              <Plus size={16} />
              {adding ? "Adding..." : "Add Keyword"}
            </button>
          </div>
        </motion.div>

        {/* Keywords List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg mb-4">Your Keywords ({keywords.length})</h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : keywords.length === 0 ? (
            <p className="text-gray-400">
              No keywords yet. Add your first one above!
            </p>
          ) : (
            <div className="space-y-2">
              {keywords.map((kw) => (
                <motion.div
                  key={kw.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: kw.color }}
                    />
                    <span
                      style={{ color: kw.color }}
                      className="text-sm font-medium"
                    >
                      {kw.label}
                    </span>
                    <span className="text-xs text-gray-400">({kw.code})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Preview badge */}
                    <span
                      style={{ backgroundColor: kw.color, color: "white" }}
                      className="px-3 py-1 rounded-full text-xs"
                    >
                      {kw.label}
                    </span>

                    {/* Delete */}
                    {confirmDeleteId === kw.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Sure?</span>
                        <button
                          onClick={() => handleDelete(kw.id)}
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(kw.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
