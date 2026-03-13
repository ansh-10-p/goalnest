"use client";
 
import { TrendingUp } from "lucide-react";
 
interface WeeklyData {
  day: string;
  value: number;
}
 
interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  total: number;
  change: number;
  data: WeeklyData[];
}
 
const MAX_BAR_HEIGHT = 80;
 
export default function AnalyticsCard({ title, subtitle, total, change, data }: AnalyticsCardProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
 
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-500"}`}>
          <TrendingUp size={11} />
          {change >= 0 ? "+" : ""}{change}%
        </div>
      </div>
 
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-5">{total}</p>
 
      {/* Bar chart */}
      <div className="flex items-end gap-2" style={{ height: `${MAX_BAR_HEIGHT}px` }}>
        {data.map(({ day, value }) => {
          const barH = Math.round((value / maxVal) * MAX_BAR_HEIGHT);
          const isToday = day === "Fri"; // example
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                {value}
              </div>
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isToday
                    ? "bg-gradient-to-t from-[#6366F1] to-[#A5B4FC]"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
                }`}
                style={{ height: `${barH}px` }}
              />
            </div>
          );
        })}
      </div>
 
      {/* Day labels */}
      <div className="flex gap-2 mt-2">
        {data.map(({ day }) => (
          <div key={day} className="flex-1 text-center text-[10px] text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}