import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Goal from "@/lib/models/goal";
import { getSessionUser } from "@/lib/session";

// GET /api/goals — fetch all goals for logged-in user
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const goals = await Goal.find({ userId: user.id }).sort({ createdAt: -1 });

    const now = new Date();

    const result = goals.map((g) => {
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

    return NextResponse.json({ goals: result }, { status: 200 });
  } catch (err) {
    console.error("[goals GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/goals — create a new goal
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { title, description, deadline, category, color } = await req.json();

    if (!title || !deadline) {
      return NextResponse.json(
        { error: "Title and deadline are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.create({
      userId: user.id,
      title: title.trim(),
      description: description?.trim() ?? "",
      deadline: new Date(deadline),
      category: category ?? "General",
      color: color ?? "indigo",
    });

    return NextResponse.json(
      { message: "Goal created.", goal: { id: goal._id.toString(), title: goal.title } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[goals POST] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}