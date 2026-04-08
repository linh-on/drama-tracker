"use client";
import { useState } from "react";
import { useShows } from "@/lib/useShows";
import { Show } from "@/lib/types";
import { DramaCard } from "@/components/DramaCard";
import { DramaDetailModal } from "@/components/DramaDetailModal";
import { motion } from "motion/react";
import { TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const { shows, loading, updateShow } = useShows();
  const [selected, setSelected] = useState<Show | null>(null);

  const watching = shows.filter((s) => s.status === "PARTIALLY_WATCHED");
  const completed = shows.filter((s) => s.status === "COMPLETED");
  const planToWatch = shows.filter((s) => s.status === "PLAN_TO_WATCH");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading your dramas...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl mb-3">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's your drama journey at a glance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-gradient-to-br from-[#66bb6a]/10 to-[#66bb6a]/5 rounded-2xl p-6 border border-[#66bb6a]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#66bb6a]/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#2e7d32]" />
              </div>
              <div>
                <p className="text-2xl">{watching.length}</p>
                <p className="text-sm text-gray-600">Currently Watching</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#42a5f5]/10 to-[#42a5f5]/5 rounded-2xl p-6 border border-[#42a5f5]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#42a5f5]/20 flex items-center justify-center">
                <CheckCircle size={20} className="text-[#1565c0]" />
              </div>
              <div>
                <p className="text-2xl">{completed.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                <Clock size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-2xl">{planToWatch.length}</p>
                <p className="text-sm text-gray-600">Plan to Watch</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl mb-6">Currently Watching</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
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
            {watching.length === 0 && (
              <p className="text-gray-400">Nothing currently watching!</p>
            )}
          </div>
        </motion.div>
      </div>

      {selected && (
        <DramaDetailModal
          show={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateShow}
        />
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
