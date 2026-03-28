import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Goal from "@/lib/models/goal";
import { getSessionUser } from "@/lib/session";

const ALLOWED_PRIORITIES = ["critical", "high", "medium", "low"] as const;
const ALLOWED_CATEGORIES = ["Career", "Health", "Finance", "Learning", "Personal", "Creative"] as const;

function isValidDateString(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

function serializeGoal(g: any) {
  const milestones = (g.milestones ?? []).map((m: any) => ({
    id: m._id.toString(),
    text: m.text,
    done: m.done,
  }));
  const progress = milestones.length
    ? Math.round((milestones.filter((m: any) => m.done).length / milestones.length) * 100)
    : 0;
  const now = new Date();
  const deadline = new Date(g.deadline);
  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((deadline.getTime() - now.getTime()) / 86_400_000);

  return {
    id: g._id.toString(),
    title: g.title,
    description: g.description,
    category: g.category,
    priority: g.priority,
    deadline: g.deadline.toISOString().split("T")[0],
    milestones,
    progress,
    daysLeft,
    createdAt: g.createdAt.toISOString(),
  };
}

// GET /api/goals?status=active&sortBy=deadline
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status");  // active | completed | overdue
    const sortBy  = searchParams.get("sortBy") ?? "deadline"; // deadline | priority
    const category = searchParams.get("category");

    await connectDB();

    const query: Record<string, unknown> = { userId: user.id };
    if (category && ALLOWED_CATEGORIES.includes(category as any)) query.category = category;

    const goals = await Goal.find(query).sort({ createdAt: -1 });

    const now = new Date(); now.setHours(0, 0, 0, 0);
    const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

    let result = goals.map(serializeGoal);

    // Filter by derived status
    if (status && status !== "all") {
      result = result.filter((g) => {
        if (g.progress === 100) return status === "completed";
        if (g.daysLeft < 0)     return status === "overdue";
        return status === "active";
      });
    }

    // Sort
    result.sort((a, b) =>
      sortBy === "priority"
        ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        : new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    return NextResponse.json({ goals: result }, { status: 200 });
  } catch (err) {
    console.error("[goals GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/goals — create new goal
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { title, description, category, priority, deadline, milestones } = await req.json();

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    }
    if (!deadline || !isValidDateString(deadline)) {
      return NextResponse.json({ error: "A valid deadline is required." }, { status: 400 });
    }

    await connectDB();

    const safeMilestones = Array.isArray(milestones)
      ? milestones
          .map((m: unknown) => (typeof m === "string" ? m.trim().slice(0, 100) : ""))
          .filter((m: string) => m.length >= 2)
          .map((text: string) => ({ text, done: false }))
      : [];

    const goal = await Goal.create({
      userId:      user.id,
      title:       title.trim().slice(0, 80),
      description: (description ?? "").trim().slice(0, 200),
      category:    ALLOWED_CATEGORIES.includes(category) ? category : "Career",
      priority:    ALLOWED_PRIORITIES.includes(priority) ? priority : "medium",
      deadline:    new Date(deadline),
      milestones:  safeMilestones,
    });

    return NextResponse.json({ message: "Goal created.", goal: serializeGoal(goal) }, { status: 201 });
  } catch (err) {
    console.error("[goals POST] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}