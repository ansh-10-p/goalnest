import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import Goal from "@/lib/models/goal";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

// GET /api/dashboard — fetch all data needed for the dashboard in one call
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── Habits ──────────────────────────────────────────────────────────────
    const habits = await Habit.find({ userId: user.id }).sort({ createdAt: -1 });

    const habitResult = habits.map((h) => {
      const completedToday = h.completedDates.some((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      });
      return {
        id: h._id.toString(),
        name: h.name,
        emoji: h.emoji,
        color: h.color,
        streak: h.streak,
        completed: completedToday,
        progress: completedToday ? 100 : Math.min((h.streak / 30) * 100, 99),
      };
    });

    const completedToday = habitResult.filter((h) => h.completed).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    const bestStreakHabit = habits.find((h) => h.longestStreak === bestStreak);

    // ── Goals ───────────────────────────────────────────────────────────────
    const goals = await Goal.find({ userId: user.id }).sort({ createdAt: -1 });

    const goalResult = goals.map((g) => {
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return {
        id: g._id.toString(),
        title: g.title,
        description: g.description,
        percentage: g.percentage,
        daysLeft,
        category: g.category,
        color: g.color,
      };
    });

    const closeToCompletion = goalResult.filter((g) => g.percentage >= 75).length;

    // ── Weekly Analytics (last 7 days) ──────────────────────────────────────
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyHabits = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const count = habits.reduce((acc, h) => {
        const done = h.completedDates.some((cd) => {
          const date = new Date(cd);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === d.getTime();
        });
        return acc + (done ? 1 : 0);
      }, 0);
      return { day: days[d.getDay()], value: count };
    });

    // ── Activity Feed (latest 10) ────────────────────────────────────────────
    const activities = await Activity.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const activityResult = activities.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      title: a.title,
      description: a.description,
      time: formatTime(a.createdAt),
    }));

    // ── Stats ────────────────────────────────────────────────────────────────
    return NextResponse.json({
      user: { name: user.name },
      stats: {
        bestStreak,
        bestStreakHabit: bestStreakHabit?.name ?? "—",
        completedToday,
        totalHabits: habits.length,
        activeGoals: goals.length,
        closeToCompletion,
      },
      habits: habitResult,
      goals: goalResult,
      analytics: {
        weeklyHabits,
      },
      activities: activityResult,
    });
  } catch (err) {
    console.error("[dashboard GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) {
    const time = new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Today, ${time}`;
  }
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}