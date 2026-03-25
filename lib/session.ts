import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export async function getSessionUser(_req?: Request): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("NEXTAUTH_SECRET not set");

    const decoded = jwt.verify(token, secret) as SessionUser;
    return { id: decoded.id, name: decoded.name, email: decoded.email };
  } catch {
    return null;
  }
}