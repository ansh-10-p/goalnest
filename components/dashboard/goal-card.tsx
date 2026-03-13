"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  title: string;
  description: string;
  completion: number;
  milestones: { label: string; done: boolean }[];
  color?: string;
  dueDate?: string;
}

export function GoalCard({
  title,
  description,
  completion,
  milestones,
  color = "#6366F1",
  dueDate,
}: GoalCardProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:shadow-lg hover:border-[var(--primary)]/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">{title}</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{description}</p>
          {dueDate && (
            <span className="inline-block mt-1.5 text-xs text-[var(--muted)] bg-[var(--border)]/60 px-2 py-0.5 rounded-md">
              📅 Due {dueDate}
            </span>
          )}
        </div>

        {/* Ring Progress */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              strokeWidth="6"
              stroke="var(--border)"
            />
            <motion.circle
              cx="40" cy="40" r={radius}
              fill="none"
              strokeWidth="6"
              stroke={color}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[var(--foreground)]">{completion}%</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2 mb-4">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {m.done ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />
            ) : (
              <Circle className="w-3.5 h-3.5 shrink-0 text-[var(--border)]" />
            )}
            <span className={cn("text-xs", m.done ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]")}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/30 transition-all group/btn"
        style={{ borderColor: `${color}30` }}
      >
        View details
        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
