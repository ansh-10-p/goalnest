import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Goal from "@/lib/models/goal";
import Activity from "@/lib/models/activity"; // Fixed typo here
import { getSessionUser } from "@/lib/session";

// PATCH /api/goals/[id]/milestone/[milestoneId] — toggle a milestone done/undone
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> } // <-- Updated for Next.js 15
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    // Extract the variables from params first!
    const { id, milestoneId } = await params; 

    await connectDB();

    // Use the extracted 'id'
    const goal = await Goal.findOne({ _id: id, userId: user.id });
    if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

    // Now 'milestoneId' is defined and works perfectly!
    const milestone = goal.milestones.find((m: any) => m._id.toString() === milestoneId);
    if (!milestone) return NextResponse.json({ error: "Milestone not found." }, { status: 404 });

    const prevProgress = goal.milestones.length
      ? Math.round((goal.milestones.filter((m: any) => m.done).length / goal.milestones.length) * 100)
      : 0;

    milestone.done = !milestone.done;
    
    // Calculate new progress AFTER toggling
    const newProgress = goal.milestones.length
      ? Math.round((goal.milestones.filter((m: any) => m.done).length / goal.milestones.length) * 100)
      : 0;
      
    // Update the parent goal's percentage field if you have one
    goal.percentage = newProgress;
    await goal.save();

    // Log milestone activities
    if (milestone.done) {
      await Activity.create({
        userId: user.id,
        type: "progress",
        title: `Milestone completed: "${milestone.text}"`,
        description: `Progress on "${goal.title}" updated to ${newProgress}%.`,
      });

      // Milestone % badges
      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (prevProgress < m && newProgress >= m) {
          await Activity.create({
            userId: user.id,
            type: m === 100 ? "achievement" : "goal_milestone",
            title: m === 100
              ? `Goal completed: "${goal.title}" 🎉`
              : `"${goal.title}" is ${m}% complete`,
            description: m === 100
              ? "Congratulations on achieving your goal!"
              : `You've hit the ${m}% milestone — keep going!`,
          });
          break;
        }
      }
    }

    return NextResponse.json({
      message: "Milestone updated.",
      done: milestone.done,
      progress: newProgress,
    }, { status: 200 });
  } catch (err) {
    console.error("[milestone toggle] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}