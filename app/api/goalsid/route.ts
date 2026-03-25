import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Goal from "@/lib/models/goal";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

// PATCH /api/goals/[id] — update goal progress percentage
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { percentage } = await req.json();

    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be between 0 and 100." },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: params.id, userId: user.id });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    const prevPercentage = goal.percentage;
    goal.percentage = percentage;
    await goal.save();

    // Log milestone activities
    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (prevPercentage < milestone && percentage >= milestone) {
        await Activity.create({
          userId: user.id,
          type: milestone === 100 ? "achievement" : "goal_milestone",
          title:
            milestone === 100
              ? `Completed goal: ${goal.title}`
              : `Goal "${goal.title}" is ${milestone}% complete`,
          description:
            milestone === 100
              ? "Congratulations on achieving your goal!"
              : `You've hit the ${milestone}% milestone.`,
        });
        break;
      }
    }

    return NextResponse.json(
      { message: "Goal updated.", percentage: goal.percentage },
      { status: 200 }
    );
  } catch (err) {
    console.error("[goal PATCH] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// DELETE /api/goals/[id] — delete a goal
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const goal = await Goal.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal deleted." }, { status: 200 });
  } catch (err) {
    console.error("[goal DELETE] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}