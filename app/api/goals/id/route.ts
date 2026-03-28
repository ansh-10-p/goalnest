import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Goal from "@/lib/models/goal";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

const ALLOWED_PRIORITIES = ["critical", "high", "medium", "low"] as const;

// PATCH /api/goals/[id] — update progress or deadline
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    await connectDB();
    const goal = await Goal.findOne({ _id: params.id, userId: user.id });
    if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

    const body = await req.json();

    if (body.priority !== undefined && ALLOWED_PRIORITIES.includes(body.priority)) {
      goal.priority = body.priority;
    }
    if (body.deadline !== undefined) {
      const d = new Date(body.deadline);
      if (!isNaN(d.getTime())) goal.deadline = d;
    }

    await goal.save();
    return NextResponse.json({ message: "Goal updated." }, { status: 200 });
  } catch (err) {
    console.error("[goal PATCH] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// DELETE /api/goals/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    await connectDB();
    const goal = await Goal.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

    return NextResponse.json({ message: "Goal deleted." }, { status: 200 });
  } catch (err) {
    console.error("[goal DELETE] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}