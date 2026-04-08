"use client";
import { Show } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { StatusTag } from "./StatusTag";
import { StarRating } from "./StarRating";
import { motion } from "motion/react";

interface DramaCardProps {
  show: Show;
  onClick: () => void;
  variant?: "grid" | "horizontal";
}

export function DramaCard({ show, onClick, variant = "grid" }: DramaCardProps) {
  if (variant === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="flex-shrink-0 w-[200px] cursor-pointer"
        onClick={onClick}
      >
        <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="aspect-[2/3] bg-gradient-to-br from-[#f5e6e8] to-[#e8d5f0] flex items-center justify-center">
            <span className="text-4xl">📺</span>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 mb-2">
              {show.title}
            </h3>
            <CategoryBadge country={show.country} />
            {show.current_ep && (
              <p className="text-[10px] text-gray-500 mt-1">
                {show.status === "CURRENTLY_WATCHING" ? "▶ " : "⏸ "}
                {show.current_ep}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-[2/3] bg-gradient-to-br from-[#f5e6e8] to-[#e8d5f0] flex items-center justify-center">
          <span className="text-5xl">📺</span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium line-clamp-2 flex-1">{show.title}</h3>
            <StarRating rating={show.rating} readonly />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <CategoryBadge country={show.country} />
            <StatusTag status={show.status} />
          </div>
          {show.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {show.keywords.slice(0, 3).map((kw) => (
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
        </div>
      </div>
    </motion.div>
  );
}
