"use client";
import { useState, useMemo, useEffect } from "react";
import { useShows } from "@/lib/useShows";
import { Show, Country, WatchStatus } from "@/lib/types";
import { DramaCard } from "@/components/DramaCard";
import { DramaDetailModal } from "@/components/DramaDetailModal";
import { AddShowModal } from "@/components/AddShowModal";
import { motion } from "motion/react";
import { Filter, Heart, Plus } from "lucide-react";

interface Keyword {
  code: string;
  label: string;
  color: string;
}

type SortOrder =
  | "NONE"
  | "RATING_ASC"
  | "RATING_DESC"
  | "TITLE_ASC"
  | "TITLE_DESC";

// ─── Mobile Filter Accordion ─────────────────────────────────────────────────
function MobileFilterSection({
  label,
  activeLabel,
  children,
}: {
  label: string;
  activeLabel: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700">{label}</span>
          {activeLabel && (
            <span className="text-xs bg-[#d4a5a5] text-white px-2 py-0.5 rounded-full">
              {activeLabel}
            </span>
          )}
        </div>
        <span
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-2 pb-2 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MoviePage() {
  const { shows, loading, updateShow, deleteShow, refreshShows } = useShows();
  const [selected, setSelected] = useState<Show | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<WatchStatus | "ALL">("ALL");
  const [countryFilter, setCountryFilter] = useState<Country | "ALL">("ALL");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("NONE");

  useEffect(() => {
    fetch("/api/keywords")
      .then((res) => res.json())
      .then(setKeywords);
  }, []);

  const toggleKeyword = (code: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(code) ? prev.filter((k) => k !== code) : [...prev, code],
    );
  };

  const filtered = useMemo(() => {
    const list = shows.filter((s) => {
      if (s.status === "PLAN_TO_WATCH") return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (countryFilter !== "ALL" && s.country !== countryFilter) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (favoritesOnly && !s.is_favorite) return false;
      if (selectedKeywords.length > 0) {
        const showKeywordCodes = s.keywords.map((k) => k.code);
        if (!selectedKeywords.every((code) => showKeywordCodes.includes(code)))
          return false;
      }
      return true;
    });

    if (sortOrder === "RATING_DESC")
      return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortOrder === "RATING_ASC")
      return [...list].sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
    if (sortOrder === "TITLE_ASC")
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "TITLE_DESC")
      return [...list].sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [
    shows,
    statusFilter,
    countryFilter,
    search,
    selectedKeywords,
    favoritesOnly,
    sortOrder,
  ]);

  const statusFilters: { value: WatchStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "CURRENTLY_WATCHING", label: "Watching" },
    { value: "PARTIALLY_WATCHED", label: "Partially Watched" },
    { value: "COMPLETED", label: "Completed" },
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
        <p className="text-gray-400">Loading your shows...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl mb-1 sm:mb-3">My Shows</h1>
            <p className="text-gray-600 text-sm">{filtered.length} shows</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#d4a5a5] text-white rounded-full hover:bg-[#c89595] transition-colors shadow-sm text-sm shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Show</span>
            <span className="sm:hidden">Add</span>
          </button>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* Search + Sort — always visible */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="px-3 py-2 rounded-xl text-sm border bg-gray-50 text-gray-600 border-gray-200"
            >
              <option value="NONE">Sort</option>
              <option value="RATING_DESC">Rating ↓</option>
              <option value="RATING_ASC">Rating ↑</option>
              <option value="TITLE_ASC">A → Z</option>
              <option value="TITLE_DESC">Z → A</option>
            </select>
          </div>

          {/* ── Desktop filters ── */}
          <div className="hidden sm:block space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
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
              <Filter size={14} className="text-gray-400" />
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

            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">Keywords</span>
              {selectedKeywords.length > 0 && (
                <span className="text-xs text-gray-400">
                  (showing shows with ALL selected)
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
                  size={12}
                  className={favoritesOnly ? "fill-[#d4a5a5]" : ""}
                />
                Favorites
              </button>
              {keywords.map((kw) => {
                const isSelected = selectedKeywords.includes(kw.code);
                return (
                  <button
                    key={kw.code}
                    onClick={() => toggleKeyword(kw.code)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: kw.color,
                            color: "white",
                            borderColor: kw.color,
                          }
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
                  className="px-4 py-2 rounded-full text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
                >
                  Clear ✕
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile filters: collapsible accordions ── */}
          <div className="sm:hidden space-y-2">
            {/* Status */}
            <MobileFilterSection
              label="Status"
              activeLabel={
                statusFilter === "ALL"
                  ? null
                  : (statusFilters.find((f) => f.value === statusFilter)
                      ?.label ?? null)
              }
            >
              <div className="flex flex-col gap-1 pt-1">
                {statusFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                      statusFilter === f.value
                        ? "bg-[#d4a5a5]/15 text-[#d4a5a5] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                    {statusFilter === f.value && (
                      <span className="text-[#d4a5a5]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </MobileFilterSection>

            {/* Country */}
            <MobileFilterSection
              label="Country"
              activeLabel={
                countryFilter === "ALL"
                  ? null
                  : (countryFilters.find((f) => f.value === countryFilter)
                      ?.label ?? null)
              }
            >
              <div className="flex flex-col gap-1 pt-1">
                {countryFilters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setCountryFilter(f.value)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                      countryFilter === f.value
                        ? "bg-[#d4a5a5]/15 text-[#d4a5a5] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                    {countryFilter === f.value && (
                      <span className="text-[#d4a5a5]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </MobileFilterSection>

            {/* Keywords */}
            <MobileFilterSection
              label="Keywords"
              activeLabel={
                selectedKeywords.length > 0 || favoritesOnly
                  ? `${(favoritesOnly ? 1 : 0) + selectedKeywords.length} selected`
                  : null
              }
            >
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                    favoritesOnly
                      ? "bg-[#d4a5a5]/15 text-[#d4a5a5] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart
                      size={13}
                      className={favoritesOnly ? "fill-[#d4a5a5]" : ""}
                    />
                    Favorites
                  </span>
                  {favoritesOnly && <span className="text-[#d4a5a5]">✓</span>}
                </button>
                {keywords.map((kw) => {
                  const isSelected = selectedKeywords.includes(kw.code);
                  return (
                    <button
                      key={kw.code}
                      onClick={() => toggleKeyword(kw.code)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                        isSelected
                          ? "bg-[#d4a5a5]/15 text-[#d4a5a5] font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {kw.label}
                      {isSelected && <span className="text-[#d4a5a5]">✓</span>}
                    </button>
                  );
                })}
                {(selectedKeywords.length > 0 || favoritesOnly) && (
                  <button
                    onClick={() => {
                      setSelectedKeywords([]);
                      setFavoritesOnly(false);
                    }}
                    className="mt-1 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all text-left"
                  >
                    Clear all ✕
                  </button>
                )}
              </div>
            </MobileFilterSection>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
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

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No shows found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {selected && (
        <DramaDetailModal
          show={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateShow}
          onDelete={(id) => {
            deleteShow(id);
            setSelected(null);
          }}
        />
      )}

      {showAddModal && (
        <AddShowModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            refreshShows();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
