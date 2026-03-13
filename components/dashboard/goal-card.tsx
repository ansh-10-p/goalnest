"use client";
 
import { Target, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
 
interface GoalCardProps {
  title: string;
  description: string;
  percentage: number;
  daysLeft: number;
  category: string;
  color: "indigo" | "violet" | "emerald" | "amber";
}
 
const colorMap = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
    bar: "from-[#6366F1] to-[#818CF8]",
    badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
    bar: "from-[#7C3AED] to-[#A78BFA]",
    badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "from-[#059669] to-[#34D399]",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    bar: "from-[#D97706] to-[#FCD34D]",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
  },
};
 
export default function GoalCard({
  title,
  description,
  percentage,
  daysLeft,
  category,
  color,
}: GoalCardProps) {
  const c = colorMap[color];
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (percentage / 100) * circumference;
 
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", c.badge)}>{category}</span>
          <h3 className="mt-2 font-semibold text-[15px] text-gray-900 dark:text-white leading-snug">{title}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>
        </div>
 
        {/* Circular progress */}
        <div className="ml-4 flex-shrink-0 relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              stroke="url(#grad)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <span className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold", c.text)}>
            {percentage}%
          </span>
        </div>
      </div>
 
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", c.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
 
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className={c.text} />
          <span>On track</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{daysLeft} days left</span>
        </div>
      </div>
    </div>
  );
}
 