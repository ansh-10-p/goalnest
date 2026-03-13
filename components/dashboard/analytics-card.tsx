"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface WeeklyData {
  day: string;
  value: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: number;
  subtitle: string;
  data: WeeklyData[];
  color?: string;
}

const defaultData: WeeklyData[] = [
  { day: "Mon", value: 60 },
  { day: "Tue", value: 75 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 80 },
  { day: "Sat", value: 45 },
  { day: "Sun", value: 95 },
];

export function AnalyticsCard({
  title,
  value,
  change,
  subtitle,
  data = defaultData,
  color = "#6366F1",
}: AnalyticsCardProps) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:shadow-lg hover:border-[var(--primary)]/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-[var(--muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: isPositive ? "#10B98115" : "#EF444415",
            color: isPositive ? "#10B981" : "#EF4444",
          }}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? "+" : ""}{change}%
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1.5 h-24">
        {data.map((item, i) => {
          const heightPct = (item.value / maxVal) * 100;
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
              <div className="w-full relative flex items-end" style={{ height: "80px" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                  className="w-full rounded-t-lg relative overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: i === data.length - 1 ? color : `${color}40`,
                    minHeight: "4px",
                  }}
                >
                  {/* Hover highlight */}
                  <div className="absolute inset-0 bg-white/0 group-hover/bar:bg-white/15 transition-colors duration-150" />
                  {/* Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.value}%
                  </div>
                </motion.div>
              </div>
              <span className="text-[10px] text-[var(--muted)]">{item.day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
