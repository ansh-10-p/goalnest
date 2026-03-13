"use client";
 
import { useState } from "react";
import { Flame, CheckSquare, Target, Zap, Plus } from "lucide-react";
import HabitCard from "@/components/dashboard/habit-card";
import GoalCard from "@/components/dashboard/goal-card";
import AnalyticsCard from "@/components/dashboard/analytics-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
 
// ─── Mock Data ────────────────────────────────────────────────────────────────
 
const habits = [
  { id: "1", name: "Morning Run", emoji: "🏃", streak: 12, progress: 100, completed: true, color: "bg-orange-50 dark:bg-orange-900/20" },
  { id: "2", name: "Read 30 mins", emoji: "📚", streak: 7, progress: 65, completed: false, color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "3", name: "Meditate", emoji: "🧘", streak: 21, progress: 100, completed: true, color: "bg-violet-50 dark:bg-violet-900/20" },
  { id: "4", name: "Drink 8 glasses", emoji: "💧", streak: 5, progress: 50, completed: false, color: "bg-cyan-50 dark:bg-cyan-900/20" },
  { id: "5", name: "Journaling", emoji: "✍️", streak: 3, progress: 80, completed: false, color: "bg-pink-50 dark:bg-pink-900/20" },
  { id: "6", name: "Cold Shower", emoji: "🚿", streak: 9, progress: 0, completed: false, color: "bg-teal-50 dark:bg-teal-900/20" },
];
 
const goals = [
  { id: "1", title: "Read 12 books this year", description: "Expand knowledge across business, philosophy, and fiction genres.", percentage: 75, daysLeft: 92, category: "Learning", color: "indigo" as const },
  { id: "2", title: "Run a half marathon", description: "Build up mileage progressively and complete the 21km race.", percentage: 42, daysLeft: 60, category: "Fitness", color: "violet" as const },
  { id: "3", title: "Save ₹2L emergency fund", description: "Build financial safety net with consistent monthly contributions.", percentage: 88, daysLeft: 14, category: "Finance", color: "emerald" as const },
  { id: "4", title: "Launch side project", description: "Build and ship the SaaS MVP by end of quarter.", percentage: 33, daysLeft: 45, category: "Career", color: "amber" as const },
];
 
const weeklyProductivity = [
  { day: "Mon", value: 6 },
  { day: "Tue", value: 8 },
  { day: "Wed", value: 5 },
  { day: "Thu", value: 9 },
  { day: "Fri", value: 10 },
  { day: "Sat", value: 7 },
  { day: "Sun", value: 4 },
];
 
const weeklyHabits = [
  { day: "Mon", value: 4 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 3 },
  { day: "Thu", value: 6 },
  { day: "Fri", value: 6 },
  { day: "Sat", value: 5 },
  { day: "Sun", value: 2 },
];
 
const activities = [
  { id: "1", type: "habit_complete" as const, title: "Completed Morning Run", description: "Day 12 in a row — you're on fire!", time: "Today, 7:14 AM" },
  { id: "2", type: "streak" as const, title: "21-day Meditation streak", description: "Three weeks of consistent mindfulness.", time: "Today, 6:45 AM" },
  { id: "3", type: "goal_milestone" as const, title: "Book goal 75% complete", description: "9 of 12 books read this year.", time: "Yesterday, 10:30 PM" },
  { id: "4", type: "achievement" as const, title: "Earned 'Iron Will' badge", description: "Completed all habits for 7 consecutive days.", time: "Yesterday, 11:59 PM" },
  { id: "5", type: "progress" as const, title: "Emergency fund goal updated", description: "Progress jumped to 88% after monthly saving.", time: "2 days ago" },
];
 
// ─── Stat Card ────────────────────────────────────────────────────────────────
 
function StatCard({ icon: Icon, label, value, sub, iconBg }: { icon: React.ElementType; label: string; value: string; sub: string; iconBg: string }) {
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
 
function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
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
  const [habitStates, setHabitStates] = useState<Record<string, boolean>>(
    Object.fromEntries(habits.map((h) => [h.id, h.completed]))
  );
 
  const completedCount = Object.values(habitStates).filter(Boolean).length;
  const totalHabits = habits.length;
 
  const toggleHabit = (id: string) =>
    setHabitStates((prev) => ({ ...prev, [id]: !prev[id] }));
 
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good morning, Arjun 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {" · "}
          <span className="text-[#6366F1] font-medium">{completedCount}/{totalHabits} habits done today</span>
        </p>
      </div>
 
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Best Streak"
          value="21 days"
          sub="Meditation habit"
          iconBg="bg-orange-100 dark:bg-orange-900/20 text-orange-500"
        />
        <StatCard
          icon={CheckSquare}
          label="Today's Habits"
          value={`${completedCount}/${totalHabits}`}
          sub="Keep it up!"
          iconBg="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500"
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={`${goals.length}`}
          sub="2 close to completion"
          iconBg="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500"
        />
        <StatCard
          icon={Zap}
          label="Productivity"
          value="84%"
          sub="+12% vs last week"
          iconBg="bg-violet-100 dark:bg-violet-900/20 text-violet-500"
        />
      </div>
 
      {/* Analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalyticsCard
          title="Weekly Productivity"
          subtitle="Hours focused per day"
          total={49}
          change={12}
          data={weeklyProductivity}
        />
        <AnalyticsCard
          title="Habit Completions"
          subtitle="Habits done per day"
          total={31}
          change={8}
          data={weeklyHabits}
        />
      </div>
 
      {/* Habits */}
      <div>
        <SectionHeader title="Today's Habits" actionLabel="Add habit" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              completed={habitStates[habit.id]}
              onToggle={() => toggleHabit(habit.id)}
            />
          ))}
        </div>
      </div>
 
      {/* Goals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader title="Active Goals" actionLabel="Add goal" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} {...goal} />
            ))}
          </div>
        </div>
 
        <div>
          <SectionHeader title="Activity" />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}