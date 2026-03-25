import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Activity from "@/lib/models/activity";
import { getSessionUser } from "@/lib/session";

// GET /api/activity — fetch recent activity for logged-in user
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const activities = await Activity.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const result = activities.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      title: a.title,
      description: a.description,
      time: formatTime(a.createdAt),
    }));

    return NextResponse.json({ activities: result }, { status: 200 });
  } catch (err) {
    console.error("[activity GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) {
    const time = new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Today, ${time}`;
  }
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}