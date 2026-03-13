"use client";

import React from "react";
import { TrendingUp, CheckSquare, Flame, Target, Calendar } from "lucide-react";
import AnalyticsCard from "@/components/dashboard/analytics-card";

const weeklyData = [
  { day: "Mon", value: 6 },
  { day: "Tue", value: 8 },
  { day: "Wed", value: 5 },
  { day: "Thu", value: 9 },
  { day: "Fri", value: 10 },
  { day: "Sat", value: 7 },
  { day: "Sun", value: 4 },
];

const habitCompletions = [
  { day: "Mon", value: 4 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 3 },
  { day: "Thu", value: 6 },
  { day: "Fri", value: 6 },
  { day: "Sat", value: 5 },
  { day: "Sun", value: 2 },
];

const monthlyStreak = [
  { day: "W1", value: 25 },
  { day: "W2", value: 30 },
  { day: "W3", value: 28 },
  { day: "W4", value: 35 },
];

const habitBreakdown = [
  { name: "Morning Run", completions: 26, total: 31, color: "bg-orange-400" },
  { name: "Meditation", completions: 31, total: 31, color: "bg-violet-400" },
  { name: "Read 30 mins", completions: 18, total: 31, color: "bg-blue-400" },
  { name: "Journaling", completions: 22, total: 31, color: "bg-pink-400" },
  { name: "Cold Shower", completions: 14, total: 31, color: "bg-teal-400" },
  { name: "Drink 8 glasses", completions: 20, total: 31, color: "bg-cyan-400" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">March 2026 · Your productivity insights</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CheckSquare, label: "Total Completions", value: "187", change: "+14%", bg: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500" },
          { icon: Flame, label: "Best Streak", value: "21 days", change: "+3 days", bg: "bg-orange-50 dark:bg-orange-900/20 text-orange-500" },
          { icon: TrendingUp, label: "Consistency Rate", value: "84%", change: "+8%", bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" },
          { icon: Target, label: "Goals On Track", value: "3/4", change: "75%", bg: "bg-violet-50 dark:bg-violet-900/20 text-violet-500" },
        ].map(({ icon: Icon, label, value, change, bg }) => (
          <div key={label} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            <p className="text-xs text-emerald-500 font-medium mt-1">{change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Weekly Productivity"
          subtitle="Focus hours per day"
          total={49}
          change={12}
          data={weeklyData}
        />
        <AnalyticsCard
          title="Habit Completions"
          subtitle="This week"
          total={31}
          change={8}
          data={habitCompletions}
        />
        <AnalyticsCard
          title="Monthly Streaks"
          subtitle="Total streak days per week"
          total={118}
          change={18}
          data={monthlyStreak}
        />
      </div>

      {/* Habit breakdown */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">Habit Performance — March 2026</h2>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} />
            31 days
          </span>
        </div>
        <div className="space-y-4">
          {habitBreakdown.map(({ name, completions, total, color }) => {
            const pct = Math.round((completions / total) * 100);
            return (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {completions}/{total}
                    <span className="text-xs text-gray-400 font-normal ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap placeholder */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Heatmap</h2>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 91 }).map((_, i) => {
            const intensity = Math.random();
            const bg =
              intensity > 0.8 ? "bg-[#6366F1]" :
              intensity > 0.6 ? "bg-[#818CF8]" :
              intensity > 0.4 ? "bg-[#A5B4FC]" :
              intensity > 0.2 ? "bg-[#C7D2FE]" :
              "bg-gray-100 dark:bg-gray-800";
            return (
              <div
                key={i}
                title={`Day ${i + 1}`}
                className={`w-5 h-5 rounded-sm ${bg} transition-opacity hover:opacity-80 cursor-pointer`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}