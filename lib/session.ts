import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function getSessionUser(_req?: Request): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      console.log("Auth Error: No auth_token cookie found.");
      return null;
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("Auth Error: NEXTAUTH_SECRET is not set in environment variables.");
      throw new Error("NEXTAUTH_SECRET not set");
    }

    const decoded = jwt.verify(token, secret) as SessionUser;
    return { id: decoded.id, name: decoded.name, email: decoded.email };
  } catch (error) {
    // THIS is the crucial part you need for debugging
    console.error("Auth Error details:", error); 
    return null;
  }
}