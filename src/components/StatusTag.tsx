import { WatchStatus } from "@/lib/types";

const statusConfig: Record<
  WatchStatus,
  { label: string; color: string; icon: string }
> = {
  CURRENTLY_WATCHING: {
    label: "Watching",
    color:
      "bg-[#66bb6a]/10 text-[#2e7d32] border-[#66bb6a]/20 dark:bg-[#66bb6a]/20 dark:text-[#81c784] dark:border-[#66bb6a]/30",
    icon: "🟢",
  },
  PARTIALLY_WATCHED: {
    label: "Partially Watched",
    color:
      "bg-[#ffa726]/10 text-[#e65100] border-[#ffa726]/20 dark:bg-[#ffa726]/20 dark:text-[#ffb74d] dark:border-[#ffa726]/30",
    icon: "⏸️",
  },
  COMPLETED: {
    label: "Completed",
    color:
      "bg-[#42a5f5]/10 text-[#1565c0] border-[#42a5f5]/20 dark:bg-[#42a5f5]/20 dark:text-[#64b5f6] dark:border-[#42a5f5]/30",
    icon: "✅",
  },
  PLAN_TO_WATCH: {
    label: "Plan to Watch",
    color:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    icon: "🕐",
  },
};

export function StatusTag({ status }: { status: WatchStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${config.color}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
