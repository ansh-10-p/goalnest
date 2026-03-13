"use client";
 
import { useState } from "react";
import { Plus, Search, Filter, Flame } from "lucide-react";
import HabitCard from "@/components/dashboard/habit-card";
 
const allHabits = [
  { id: "1", name: "Morning Run", emoji: "🏃", streak: 12, progress: 100, completed: true, color: "bg-orange-50 dark:bg-orange-900/20", category: "Fitness" },
  { id: "2", name: "Read 30 mins", emoji: "📚", streak: 7, progress: 65, completed: false, color: "bg-blue-50 dark:bg-blue-900/20", category: "Learning" },
  { id: "3", name: "Meditate", emoji: "🧘", streak: 21, progress: 100, completed: true, color: "bg-violet-50 dark:bg-violet-900/20", category: "Wellness" },
  { id: "4", name: "Drink 8 glasses", emoji: "💧", streak: 5, progress: 50, completed: false, color: "bg-cyan-50 dark:bg-cyan-900/20", category: "Health" },
  { id: "5", name: "Journaling", emoji: "✍️", streak: 3, progress: 80, completed: false, color: "bg-pink-50 dark:bg-pink-900/20", category: "Wellness" },
  { id: "6", name: "Cold Shower", emoji: "🚿", streak: 9, progress: 0, completed: false, color: "bg-teal-50 dark:bg-teal-900/20", category: "Health" },
  { id: "7", name: "No Sugar", emoji: "🍎", streak: 2, progress: 100, completed: true, color: "bg-red-50 dark:bg-red-900/20", category: "Health" },
  { id: "8", name: "Code 1 hour", emoji: "💻", streak: 15, progress: 100, completed: true, color: "bg-indigo-50 dark:bg-indigo-900/20", category: "Learning" },
  { id: "9", name: "Stretch", emoji: "🤸", streak: 4, progress: 40, completed: false, color: "bg-yellow-50 dark:bg-yellow-900/20", category: "Fitness" },
];
 
const categories = ["All", "Fitness", "Learning", "Wellness", "Health"];
 
export default function HabitsPage() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(allHabits.map((h) => [h.id, h.completed]))
  );
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
 
  const toggleHabit = (id: string) =>
    setStates((prev) => ({ ...prev, [id]: !prev[id] }));
 
  const filtered = allHabits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || h.category === activeCategory;
    return matchesSearch && matchesCat;
  });
 
  const completedCount = Object.values(states).filter(Boolean).length;
  const totalStreak = allHabits.reduce((a, b) => a + b.streak, 0);
 
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {completedCount}/{allHabits.length} completed today · {totalStreak} total streak days
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40">
          <Plus size={16} />
          New Habit
        </button>
      </div>
 
      {/* Streak banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
          <Flame size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">21-day streak on Meditation 🔥</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep it up! You're building a lifelong habit.</p>
        </div>
      </div>
 
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search habits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-[#6366F1] text-white"
                  : "bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-[#6366F1] hover:text-[#6366F1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
 
      {/* Habit grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm font-medium">No habits found</p>
          <p className="text-xs mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              completed={states[habit.id]}
              onToggle={() => toggleHabit(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
 