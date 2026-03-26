import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Habit from "@/lib/models/habit";
import { getSessionUser } from "@/lib/session";

// DELETE /api/habits/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <-- Updated type
) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params; // <-- Await the params in Next.js 15!

    await connectDB();

    const habit = await Habit.findOneAndDelete({ _id: id, userId: user.id });
    if (!habit) return NextResponse.json({ error: "Habit not found." }, { status: 404 });

    return NextResponse.json({ message: "Habit deleted." }, { status: 200 });
  } catch (err) {
    console.error("[habit DELETE] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}