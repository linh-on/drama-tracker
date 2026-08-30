"use client";
import { useState } from "react";
import { useShows } from "@/lib/useShows";
import { Show } from "@/lib/types";
import { DramaCard } from "@/components/DramaCard";
import { DramaDetailModal } from "@/components/DramaDetailModal";
import { motion } from "motion/react";
import { TrendingUp, CheckCircle, Clock, BookmarkPlus } from "lucide-react";

export default function Dashboard() {
  const { shows, loading, updateShow, deleteShow } = useShows();
  const [selected, setSelected] = useState<Show | null>(null);

  const watching = shows.filter((s) => s.status === "CURRENTLY_WATCHING");
  const completed = shows.filter((s) => s.status === "COMPLETED");
  const planToWatch = shows.filter((s) => s.status === "PLAN_TO_WATCH");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your dramas...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl mb-2">Welcome back!</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Here's your drama journey at a glance
          </p>
        </motion.div>

        {/* Stats — 2 cols on mobile, 4 on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          <div className="bg-gradient-to-br from-[#66bb6a]/10 to-[#66bb6a]/5 rounded-2xl p-4 sm:p-6 border border-[#66bb6a]/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#66bb6a]/20 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-[#2e7d32] dark:text-[#81c784]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl">{watching.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Watching</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl">{planToWatch.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Plan to Watch
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#42a5f5]/10 to-[#42a5f5]/5 rounded-2xl p-4 sm:p-6 border border-[#42a5f5]/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#42a5f5]/20 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-[#1565c0] dark:text-[#64b5f6]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl">{completed.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#d4a5a5]/10 to-[#d4a5a5]/5 rounded-2xl p-4 sm:p-6 border border-[#d4a5a5]/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d4a5a5]/20 flex items-center justify-center shrink-0">
                <BookmarkPlus size={18} className="text-[#d4a5a5]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl">{shows.length}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Shows</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Currently Watching */}
        {watching.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-lg sm:text-xl mb-4 sm:mb-6">
              Currently Watching
            </h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
              {watching.map((show, i) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <DramaCard
                    show={show}
                    onClick={() => setSelected(show)}
                    variant="horizontal"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan to Watch */}
        {planToWatch.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-lg sm:text-xl mb-4 sm:mb-6">Plan to Watch</h2>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
              {planToWatch.map((show, i) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <DramaCard
                    show={show}
                    onClick={() => setSelected(show)}
                    variant="horizontal"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {watching.length === 0 && planToWatch.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p>Nothing to show here yet — add some shows to get started!</p>
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

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
