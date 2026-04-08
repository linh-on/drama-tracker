"use client";
import { useState, useMemo, useEffect } from "react";
import { useShows } from "@/lib/useShows";
import { Show, Country, WatchStatus } from "@/lib/types";
import { DramaCard } from "@/components/DramaCard";
import { DramaDetailModal } from "@/components/DramaDetailModal";
import { motion } from "motion/react";
import { Filter } from "lucide-react";

interface Keyword {
  code: string;
  label: string;
  color: string;
}

export default function MyList() {
  const { shows, loading, updateShow } = useShows();
  const [selected, setSelected] = useState<Show | null>(null);
  const [statusFilter, setStatusFilter] = useState<WatchStatus | "ALL">("ALL");
  const [countryFilter, setCountryFilter] = useState<Country | "ALL">("ALL");
  const [keywordFilter, setKeywordFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setKeywords);
  }, []);

  const filtered = useMemo(() => {
    return shows.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (countryFilter !== "ALL" && s.country !== countryFilter) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (keywordFilter && !s.keywords.some((k) => k.code === keywordFilter))
        return false;
      return true;
    });
  }, [shows, statusFilter, countryFilter, search, keywordFilter]);

  const statusFilters: { value: WatchStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "CURRENTLY_WATCHING", label: "Watching" },
    { value: "PARTIALLY_WATCHED", label: "Partially Watched" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  ];

  const countryFilters: { value: Country | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "KOREAN", label: "Korean" },
    { value: "THAI", label: "Thai" },
    { value: "VIETNAMESE", label: "Vietnamese" },
    { value: "CHINESE_TAIWANESE", label: "C/TW" },
    { value: "JAPANESE", label: "Japanese" },
    { value: "AMERICAN", label: "American" },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your list...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-3">My List</h1>
          <p className="text-gray-600">{filtered.length} shows</p>
        </motion.div>

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

          {/* Status Filter */}
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

          {/* Country Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Country</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {countryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setCountryFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  countryFilter === f.value
                    ? "bg-[#d4a5a5] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Keyword Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setKeywordFilter(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                keywordFilter === null
                  ? "bg-[#d4a5a5] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {keywords.map((kw) => (
              <button
                key={kw.code}
                onClick={() =>
                  setKeywordFilter(keywordFilter === kw.code ? null : kw.code)
                }
                style={
                  keywordFilter === kw.code
                    ? { backgroundColor: kw.color, color: "white" }
                    : {}
                }
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  keywordFilter === kw.code
                    ? ""
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {kw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <DramaCard show={show} onClick={() => setSelected(show)} />
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No shows found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <DramaDetailModal
          show={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateShow}
        />
      )}
    </div>
  );
}
