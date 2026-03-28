import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import Goal from "@/lib/models/goal";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

// GET /api/analytics?range=7|30|90
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const range = Math.min(90, Math.max(7, parseInt(searchParams.get("range") ?? "30")));

    await connectDB();

    const now   = new Date();
    const today = new Date(now); today.setHours(0,0,0,0);
    const rangeStart = new Date(today); rangeStart.setDate(today.getDate() - (range - 1));

    // ── Raw data ──────────────────────────────────────────────────────────────
    const [habits, goals, activities] = await Promise.all([
      Habit.find({ userId: user.id }),
      Goal.find({ userId: user.id }),
      Activity.find({ userId: user.id, createdAt: { $gte: rangeStart } }).sort({ createdAt: -1 }).limit(50),
    ]);

    // ── Build daily date array ────────────────────────────────────────────────
    const days = Array.from({ length: range }, (_, i) => {
      const d = new Date(rangeStart);
      d.setDate(rangeStart.getDate() + i);
      return d;
    });

    const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    function dayKey(d: Date) {
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }
    function label(d: Date) {
      return range <= 7 ? DAY_LABELS[d.getDay()] : range <= 31 ? `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}` : MONTH_LABELS[d.getMonth()];
    }

    // ── Habit completion per day ──────────────────────────────────────────────
    const habitCompletionByDay = days.map(d => {
      const key = dayKey(d);
      const count = habits.reduce((acc, h) => {
        const done = h.completedDates.some((cd: Date) => dayKey(new Date(cd)) === key);
        return acc + (done ? 1 : 0);
      }, 0);
      return { date: key, day: label(d), value: count, total: habits.length };
    });

    // Completion rate per day (%)
    const completionRateByDay = habitCompletionByDay.map(d => ({
      date: d.date, day: d.day,
      value: d.total > 0 ? Math.round((d.value / d.total) * 100) : 0,
    }));

    // ── Streak data ───────────────────────────────────────────────────────────
    const habitStreaks = habits.map(h => ({
      name: h.name,
      emoji: h.emoji,
      streak: h.streak,
      longestStreak: h.longestStreak,
      color: h.color,
    })).sort((a, b) => b.streak - a.streak);

    const bestStreak    = habitStreaks[0]?.longestStreak ?? 0;
    const bestStreakHabit = habitStreaks[0]?.name ?? "—";
    const currentStreak = habitStreaks[0]?.streak ?? 0;

    // ── Today's completion ────────────────────────────────────────────────────
    const todayKey = dayKey(today);
    const completedToday = habits.filter(h =>
      h.completedDates.some((cd: Date) => dayKey(new Date(cd)) === todayKey)
    ).length;

    // ── Weekly heatmap (last 12 weeks) ────────────────────────────────────────
    const heatmapDays = Array.from({ length: 84 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (83 - i));
      const key = dayKey(d);
      const count = habits.reduce((acc, h) => {
        const done = h.completedDates.some((cd: Date) => dayKey(new Date(cd)) === key);
        return acc + (done ? 1 : 0);
      }, 0);
      const rate = habits.length > 0 ? Math.round((count / habits.length) * 100) : 0;
      return { date: key, count, rate, dayOfWeek: d.getDay() };
    });

    // ── Goals analytics ───────────────────────────────────────────────────────
    const ALLOWED_PRIORITIES = ["critical","high","medium","low"] as const;
    const ALLOWED_CATEGORIES = ["Career","Health","Finance","Learning","Personal","Creative"] as const;

    const goalsByCategory = ALLOWED_CATEGORIES.map(cat => ({
      category: cat,
      total: goals.filter(g => g.category === cat).length,
      completed: goals.filter(g => g.category === cat && (() => {
        const m = g.milestones ?? [];
        return m.length > 0 && m.every((ms: any) => ms.done);
      })()).length,
      avgProgress: (() => {
        const catGoals = goals.filter(g => g.category === cat);
        if (!catGoals.length) return 0;
        return Math.round(catGoals.reduce((acc, g) => {
          const m = g.milestones ?? [];
          const p = m.length > 0 ? Math.round(m.filter((ms: any) => ms.done).length / m.length * 100) : 0;
          return acc + p;
        }, 0) / catGoals.length);
      })(),
    })).filter(c => c.total > 0);

    const goalsByPriority = ALLOWED_PRIORITIES.map(p => ({
      priority: p,
      count: goals.filter(g => g.priority === p).length,
    })).filter(p => p.count > 0);

    const overdueGoals    = goals.filter(g => {
      const dl = new Date(g.deadline); dl.setHours(0,0,0,0);
      const m = g.milestones ?? [];
      const prog = m.length ? Math.round(m.filter((ms:any)=>ms.done).length/m.length*100) : 0;
      return prog < 100 && dl < today;
    }).length;

    const completedGoals  = goals.filter(g => {
      const m = g.milestones ?? [];
      return m.length > 0 && m.every((ms:any) => ms.done);
    }).length;

    const avgGoalProgress = goals.length ? Math.round(goals.reduce((acc, g) => {
      const m = g.milestones ?? [];
      return acc + (m.length ? Math.round(m.filter((ms:any)=>ms.done).length/m.length*100) : 0);
    }, 0) / goals.length) : 0;

    // ── Category breakdown for habits ─────────────────────────────────────────
    const habitCategories = ["Fitness","Learning","Wellness","Health","Mindfulness","Nutrition"];
    const habitsByCategory = habitCategories.map(cat => ({
      category: cat,
      count: habits.filter((h: any) => h.category === cat).length,
      completed: habits.filter((h: any) => h.category === cat &&
        h.completedDates.some((cd: Date) => dayKey(new Date(cd)) === todayKey)
      ).length,
    })).filter(c => c.count > 0);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalCompletionsInRange = habitCompletionByDay.reduce((a, d) => a + d.value, 0);
    const avgDailyCompletions     = range > 0 ? +(totalCompletionsInRange / range).toFixed(1) : 0;
    const perfectDays = habitCompletionByDay.filter(d => d.total > 0 && d.value === d.total).length;

    // Compare to previous period
    const prevStart = new Date(rangeStart); prevStart.setDate(prevStart.getDate() - range);
    const prevDays  = Array.from({ length: range }, (_, i) => {
      const d = new Date(prevStart); d.setDate(prevStart.getDate() + i); return dayKey(d);
    });
    const prevCompletions = habits.reduce((acc, h) => {
      return acc + h.completedDates.filter((cd: Date) => prevDays.includes(dayKey(new Date(cd)))).length;
    }, 0);
    const completionChange = prevCompletions > 0
      ? Math.round(((totalCompletionsInRange - prevCompletions) / prevCompletions) * 100)
      : totalCompletionsInRange > 0 ? 100 : 0;

    return NextResponse.json({
      range,
      summary: {
        totalHabits: habits.length,
        completedToday,
        todayRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0,
        bestStreak,
        bestStreakHabit,
        currentStreak,
        totalCompletionsInRange,
        avgDailyCompletions,
        perfectDays,
        completionChange,
        totalGoals: goals.length,
        completedGoals,
        overdueGoals,
        avgGoalProgress,
      },
      charts: {
        habitCompletionByDay,
        completionRateByDay,
        habitsByCategory,
        goalsByCategory,
        goalsByPriority,
        heatmap: heatmapDays,
        habitStreaks: habitStreaks.slice(0, 8),
      },
      recentActivity: activities.map(a => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        time: formatTime(a.createdAt),
      })),
    }, { status: 200 });
  } catch (err) {
    console.error("[analytics GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

function formatTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `Today, ${new Date(date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`;
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}