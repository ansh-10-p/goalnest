import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <-- Add this
import { cookies } from "next/headers"; // <-- Add this
import connectDB from "@/lib/mongoose";
import User from "@/lib/models/user";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // ─── NEW: CREATE TOKEN & SET COOKIE ───────────────────────────────────
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("Missing NEXTAUTH_SECRET in env variables");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 1. Generate the JWT token
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email },
      secret,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // 2. Set the cookie in the browser (using await for Next.js 15!)
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true, // Prevents JavaScript from reading the cookie (XSS protection)
      secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
      sameSite: "lax", // CSRF protection
      path: "/", // Available across the whole site
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });
    // ──────────────────────────────────────────────────────────────────────

    // Return safe user data
    return NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}