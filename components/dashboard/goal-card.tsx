"use client";

import { useState } from "react";
import { CheckCircle2, Circle, CalendarDays, Flag, Clock, Trophy, AlertTriangle, Layers, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  text: string;
  done: boolean;
}

interface GoalCardProps {
  id: string;
  title: string;
  description?: string;
  percentage?: number;   // legacy prop from old dashboard shape
  progress?: number;     // new API shape
  daysLeft: number;
  category: string;
  // New API props
  priority?: "critical" | "high" | "medium" | "low";
  milestones?: Milestone[];
  deadline?: string;
  // Legacy prop — old dashboard passed color like "indigo"
  color?: "indigo" | "violet" | "emerald" | "amber" | string;
  onToggleMilestone?: (milestoneId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_META = {
  critical: { label: "Critical", color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       dot: "bg-red-500"     },
  high:     { label: "High",     color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20", dot: "bg-orange-500"  },
  medium:   { label: "Medium",   color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-900/20",   dot: "bg-amber-400"   },
  low:      { label: "Low",      color: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-900/20",dot:"bg-emerald-500" },
};

// Legacy color → accent mapping so old dashboard data doesn't crash
const LEGACY_COLOR_MAP: Record<string, string> = {
  indigo:  "bg-indigo-500",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-400",
};

function deadlineLabel(days: number) {
  if (days < 0)   return { text: `${Math.abs(days)}d overdue`, color: "text-red-500" };
  if (days === 0) return { text: "Due today",                  color: "text-red-500" };
  if (days <= 3)  return { text: `${days}d left`,              color: "text-orange-500" };
  if (days <= 7)  return { text: `${days}d left`,              color: "text-amber-500" };
  return           { text: `${days}d left`,                    color: "text-gray-400" };
}

function formatDeadline(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────

export default function GoalCard({
  id, title, description,
  percentage, progress,
  daysLeft, category,
  priority, milestones = [],
  deadline, color,
  onToggleMilestone,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Support both old `percentage` prop and new `progress` prop
  const pct = progress ?? percentage ?? 0;

  // Derive status
  const status: "active" | "completed" | "overdue" =
    pct >= 100 ? "completed" : daysLeft < 0 ? "overdue" : "active";

  const dl = deadlineLabel(daysLeft);

  // Accent bar color — use priority dot if available, else fall back to legacy color prop
  const accentBar = priority
    ? PRIORITY_META[priority]?.dot ?? "bg-indigo-500"
    : LEGACY_COLOR_MAP[color ?? "indigo"] ?? "bg-indigo-500";

  // Progress bar color
  const progressColor =
    status === "completed" ? "bg-emerald-500" :
    status === "overdue"   ? "bg-red-400" :
    pct >= 70              ? "bg-indigo-500" :
    pct >= 40              ? "bg-amber-400" : "bg-gray-300 dark:bg-gray-600";

  const statusConfig = {
    active:    { icon: <Clock size={12} />,          label: "Active",    cls: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"          },
    completed: { icon: <Trophy size={12} />,         label: "Completed", cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    overdue:   { icon: <AlertTriangle size={12} />,  label: "Overdue",   cls: "text-red-500 bg-red-50 dark:bg-red-900/20"             },
  }[status];

  return (
    <article className="bg-white dark:bg-[#1a2235] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Priority / color accent bar */}
      <div className={`h-1 w-full ${accentBar}`} aria-hidden="true" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusConfig.cls}`}>
                {statusConfig.icon}{statusConfig.label}
              </span>
              {/* Category badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {category}
              </span>
              {/* Priority badge (only if present) */}
              {priority && PRIORITY_META[priority] && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${PRIORITY_META[priority].bg} ${PRIORITY_META[priority].color}`}>
                  <Flag size={10} />{PRIORITY_META[priority].label}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{title}</h3>
            {description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{description}</p>
            )}
          </div>

          {/* Progress ring */}
          <div className="shrink-0 relative w-12 h-12" aria-label={`${pct}% complete`}>
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                stroke={status === "completed" ? "#10b981" : status === "overdue" ? "#ef4444" : "#6366f1"}
                strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
              {pct}%
            </span>
          </div>
        </div>

        {/* Deadline row */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <CalendarDays size={12} aria-hidden="true" />
            {deadline && <span>{formatDeadline(deadline)}</span>}
            <span className={`font-semibold ${dl.color}`}>{deadline ? "· " : ""}{dl.text}</span>
          </div>
          {milestones.length > 0 && (
            <span className="text-gray-400">
              {milestones.filter(m => m.done).length}/{milestones.length} milestones
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3"
          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
        </div>

        {/* Milestones toggle */}
        {milestones.length > 0 && (
          <button type="button" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#6366F1] transition font-medium w-full text-left">
            <Layers size={12} aria-hidden="true" />
            {expanded ? "Hide" : "Show"} milestones
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {/* Milestone list */}
        {expanded && (
          <ul className="mt-3 space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2.5">
                <button type="button" aria-pressed={m.done}
                  onClick={() => onToggleMilestone?.(m.id)}
                  className="shrink-0 transition-transform active:scale-90">
                  {m.done
                    ? <CheckCircle2 size={16} className="text-[#6366F1]" />
                    : <Circle size={16} className="text-gray-300 dark:text-gray-600 hover:text-[#6366F1] transition-colors" />}
                </button>
                <span className={`text-xs ${m.done ? "line-through text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"}`}>
                  {m.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}