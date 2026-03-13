"use client";
 
import { Flame, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
 
interface HabitCardProps {
  name: string;
  emoji: string;
  streak: number;
  progress: number; // 0–100
  completed: boolean;
  color: string; // tailwind gradient classes
  onToggle?: () => void;
}
 
export default function HabitCard({
  name,
  emoji,
  streak,
  progress,
  completed,
  color,
  onToggle,
}: HabitCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800",
        "shadow-sm hover:shadow-md transition-all duration-200 group"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", color)}>
            {emoji}
          </div>
          <div>
            <p className="font-semibold text-[15px] text-gray-900 dark:text-white">{name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Flame size={13} className="text-orange-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{streak} day streak</span>
            </div>
          </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400">
          <MoreHorizontal size={16} />
        </button>
      </div>
 
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400">Today's progress</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
 
      {/* Complete button */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-150",
          completed
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
            : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-[#6366F1]"
        )}
      >
        <CheckCircle2 size={15} />
        {completed ? "Completed!" : "Mark complete"}
      </button>
    </div>
  );
}
 