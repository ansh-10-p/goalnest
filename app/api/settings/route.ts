import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import UserSettings from "@/lib/models/UserSetting";
import User from "@/lib/models/user";
import { getSessionUser } from "@/lib/session";

// GET /api/settings
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    await connectDB();

    // Get or create settings doc
    let settings = await UserSettings.findOne({ userId: user.id });
    if (!settings) {
      // Seed from User record
      const dbUser = await User.findById(user.id).select("name email");
      settings = await UserSettings.create({
        userId: user.id,
        name:   dbUser?.name ?? user.name,
        email:  dbUser?.email ?? user.email,
      });
    }

    return NextResponse.json({
      name:          settings.name,
      email:         settings.email,
      timezone:      settings.timezone,
      theme:         settings.theme,
      notifications: settings.notifications,
      privacy:       settings.privacy,
    }, { status: 200 });
  } catch (err) {
    console.error("[settings GET] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// PATCH /api/settings
export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const ALLOWED_THEMES = ["light", "dark", "system"];
    const ALLOWED_TIMEZONES = [
      "Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles",
      "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney",
    ];

    const update: Record<string, unknown> = {};

    if (typeof body.name === "string") update.name = body.name.trim().slice(0, 80);
    if (typeof body.timezone === "string" && ALLOWED_TIMEZONES.includes(body.timezone)) update.timezone = body.timezone;
    if (typeof body.theme === "string" && ALLOWED_THEMES.includes(body.theme)) update.theme = body.theme;

    if (body.notifications && typeof body.notifications === "object") {
      const n = body.notifications;
      update["notifications.daily"]   = !!n.daily;
      update["notifications.streaks"] = !!n.streaks;
      update["notifications.goals"]   = !!n.goals;
      update["notifications.weekly"]  = !!n.weekly;
    }

    if (body.privacy && typeof body.privacy === "object") {
      update["privacy.shareProfile"] = !!body.privacy.shareProfile;
      update["privacy.showActivity"] = !!body.privacy.showActivity;
    }

    await UserSettings.findOneAndUpdate(
      { userId: user.id },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Settings saved." }, { status: 200 });
  } catch (err) {
    console.error("[settings PATCH] error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}