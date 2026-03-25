"use client";

import { useState, useEffect } from "react";
import { Flame, CheckSquare, Target, Zap, Plus, Loader2 } from "lucide-react";
import HabitCard from "@/components/dashboard/habit-card";
import GoalCard from "@/components/dashboard/goal-card";
import AnalyticsCard from "@/components/dashboard/analytics-card";
import ActivityFeed from "@/components/dashboard/activity-feed";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  streak: number;
  progress: number;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  percentage: number;
  daysLeft: number;
  category: string;
  color: "indigo" | "violet" | "emerald" | "amber";
}

interface Activity {
  id: string;
  type: "habit_complete" | "streak" | "goal_milestone" | "achievement" | "progress";
  title: string;
  description: string;
  time: string;
}

interface DashboardData {
  user: { name: string };
  stats: {
    bestStreak: number;
    bestStreakHabit: string;
    completedToday: number;
    totalHabits: number;
    activeGoals: number;
    closeToCompletion: number;
  };
  habits: Habit[];
  goals: Goal[];
  analytics: {
    weeklyHabits: { day: string; value: number }[];
  };
  activities: Activity[];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={17} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {actionLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 text-sm text-[#6366F1] font-medium hover:underline"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habitStates, setHabitStates] = useState<Record<string, boolean>>({});

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard.");
        const json: DashboardData = await res.json();
        setData(json);
        setHabitStates(
          Object.fromEntries(json.habits.map((h) => [h.id, h.completed]))
        );
      } catch (err: any) {
        setError(err.message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Toggle habit and sync with backend
  const toggleHabit = async (id: string) => {
    // Optimistic update
    setHabitStates((prev) => ({ ...prev, [id]: !prev[id] }));

    try {
      const res = await fetch(`/api/habits/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) {
        // Revert on failure
        setHabitStates((prev) => ({ ...prev, [id]: !prev[id] }));
      } else {
        // Refresh activity feed silently
        const dashRes = await fetch("/api/dashboard");
        if (dashRes.ok) {
          const updated: DashboardData = await dashRes.json();
          setData((prev) =>
            prev ? { ...prev, activities: updated.activities, stats: updated.stats } : prev
          );
        }
      }
    } catch {
      setHabitStates((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400">{error ?? "Failed to load dashboard."}</p>
      </div>
    );
  }

  const { user, stats, habits, goals, analytics, activities } = data;
  const completedCount = Object.values(habitStates).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good morning, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" · "}
          <span className="text-[#6366F1] font-medium">
            {completedCount}/{stats.totalHabits} habits done today
          </span>
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={`${stats.bestStreak} days`}
          sub={stats.bestStreakHabit}
          iconBg="bg-orange-100 dark:bg-orange-900/20 text-orange-500"
        />
        <StatCard
          icon={CheckSquare}
          label="Today's Habits"
          value={`${completedCount}/${stats.totalHabits}`}
          sub="Keep it up!"
          iconBg="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500"
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={`${stats.activeGoals}`}
          sub={`${stats.closeToCompletion} close to completion`}
          iconBg="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500"
        />
        <StatCard
          icon={Zap}
          label="Habit Rate"
          value={
            stats.totalHabits > 0
              ? `${Math.round((completedCount / stats.totalHabits) * 100)}%`
              : "—"
          }
          sub="Today's completion rate"
          iconBg="bg-violet-100 dark:bg-violet-900/20 text-violet-500"
        />
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalyticsCard
          title="Habit Completions"
          subtitle="Habits done per day this week"
          total={analytics.weeklyHabits.reduce((s, d) => s + d.value, 0)}
          change={0}
          data={analytics.weeklyHabits}
        />
      </div>

      {/* Habits */}
      <div>
        <SectionHeader title="Today's Habits" actionLabel="Add habit" />
        {habits.length === 0 ? (
          <p className="text-sm text-gray-400">No habits yet. Add your first habit!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                {...habit}
                completed={habitStates[habit.id] ?? habit.completed}
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader title="Active Goals" actionLabel="Add goal" />
          {goals.length === 0 ? (
            <p className="text-sm text-gray-400">No goals yet. Add your first goal!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} {...goal} />
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionHeader title="Activity" />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}