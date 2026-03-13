"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  title: string;
  streak: number;
  progress: number;
  target: number;
  color?: string;
  emoji?: string;
}

export function HabitCard({
  title,
  streak,
  progress,
  target,
  color = "#6366F1",
  emoji = "💪",
}: HabitCardProps) {
  const pct = Math.min(Math.round((progress / target) * 100), 100);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:shadow-lg hover:border-[var(--primary)]/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
            style={{ backgroundColor: `${color}15` }}
          >
            {emoji}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {progress} / {target} days
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Flame className="w-3 h-3" />
          {streak}d
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--muted)]">Progress</span>
          <span className="font-semibold" style={{ color }}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-1 text-xs text-green-500">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>On track — keep it up!</span>
      </div>
    </motion.div>
  );
}
