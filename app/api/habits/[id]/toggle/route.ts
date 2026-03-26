import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

// PATCH /api/habits/[id]/toggle — mark habit done/undone for today
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Updated type
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params; // <-- Await the params in Next.js 15!

    await connectDB();

    const habit = await Habit.findOne({ _id: id, userId: user.id });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyDoneIndex = habit.completedDates.findIndex((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    if (alreadyDoneIndex >= 0) {
      // Undo today's completion
      habit.completedDates.splice(alreadyDoneIndex, 1);
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      // Mark as done today
      habit.completedDates.push(today);
      habit.streak += 1;
      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak;
      }

      // Log activity
      await Activity.create({
        userId: user.id,
        type: "habit_complete",
        title: `Completed ${habit.name}`,
        description:
          habit.streak > 1
            ? `Day ${habit.streak} in a row — keep it up!`
            : "Great start!",
      });

      // Log streak milestones
      if ([7, 14, 21, 30, 60, 100].includes(habit.streak)) {
        await Activity.create({
          userId: user.id,
          type: "streak",
          title: `${habit.streak}-day ${habit.name} streak!`,
          description: `Incredible consistency with ${habit.name}.`,
        });
      }
    }

    await habit.save();

    return NextResponse.json(
      { message: "Habit updated.", streak: habit.streak, completed: alreadyDoneIndex < 0 },
      { status: 200 }
    );
  } catch (err) {
    console.error("[habit toggle] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}