import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import { getSessionUser } from "@/lib/session";

// GET /api/habits — fetch all habits for logged-in user
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const habits = await Habit.find({ userId: user.id }).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = habits.map((h) => {
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
        longestStreak: h.longestStreak,
        completed: completedToday,
        // Simple progress: percentage based on streak (capped at 100)
        progress: completedToday ? 100 : Math.min((h.streak / 30) * 100, 99),
      };
    });

    return NextResponse.json({ habits: result }, { status: 200 });
  } catch (err) {
    console.error("[habits GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/habits — create a new habit
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name, emoji, color } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Habit name is required." }, { status: 400 });
    }

    await connectDB();

    const habit = await Habit.create({
      userId: user.id,
      name: name.trim(),
      emoji: emoji ?? "✅",
      color: color ?? "bg-indigo-50 dark:bg-indigo-900/20",
    });

    return NextResponse.json(
      { message: "Habit created.", habit: { id: habit._id.toString(), name: habit.name } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[habits POST] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}