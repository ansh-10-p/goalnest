import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import { getSessionUser } from "@/lib/session";

// GET /api/habits?category=Fitness&search=run
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search   = searchParams.get("search")?.trim().slice(0, 60) ?? "";

    await connectDB();

    // Build query
    const query: Record<string, unknown> = { userId: user.id };
    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const habits = await Habit.find(query).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = habits.map((h) => {
      const completedToday = h.completedDates.some((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      });

      return {
        id:           h._id.toString(),
        name:         h.name,
        emoji:        h.emoji,
        color:        h.color,
        category:     h.category,
        streak:       h.streak,
        longestStreak:h.longestStreak,
        completed:    completedToday,
        progress:     completedToday ? 100 : Math.min((h.streak / 30) * 100, 99),
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

    const { name, emoji, color, category } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Habit name must be at least 2 characters." }, { status: 400 });
    }

    await connectDB();

    const habit = await Habit.create({
      userId:   user.id,
      name:     name.trim().slice(0, 40),
      emoji:    emoji    ?? "🎯",
      color:    color    ?? "bg-orange-50 dark:bg-orange-900/20",
      category: category ?? "Health",
    });

    return NextResponse.json(
      {
        message: "Habit created.",
        habit: {
          id:       habit._id.toString(),
          name:     habit.name,
          emoji:    habit.emoji,
          color:    habit.color,
          category: habit.category,
          streak:   habit.streak,
          progress: 0,
          completed:false,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[habits POST] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}