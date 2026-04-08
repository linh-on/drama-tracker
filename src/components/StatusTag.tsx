import { WatchStatus } from "@/lib/types";

const statusConfig: Record<
  WatchStatus,
  { label: string; color: string; icon: string }
> = {
  CURRENTLY_WATCHING: {
    label: "Watching",
    color: "bg-[#66bb6a]/10 text-[#2e7d32] border-[#66bb6a]/20",
    icon: "🟢",
  },
  PARTIALLY_WATCHED: {
    label: "Partially Watched",
    color: "bg-[#ffa726]/10 text-[#e65100] border-[#ffa726]/20",
    icon: "⏸️",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-[#42a5f5]/10 text-[#1565c0] border-[#42a5f5]/20",
    icon: "✅",
  },
  PLAN_TO_WATCH: {
    label: "Plan to Watch",
    color: "bg-gray-100 text-gray-600 border-gray-200",
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
