"use server";

import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, workspaces, workspaceMembers } from "@/lib/schema";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";

// Single-owner V1: the very first submit provisions the owner + personal
// workspace. After that it's a plain email/password login.
export async function authenticate(_prev: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) return "Enter an email and password.";
  if (password.length < 8) return "Password must be at least 8 characters.";

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    if (!(await verifyPassword(password, existing.passwordHash))) {
      return "Incorrect email or password.";
    }
    const [ws] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.ownerId, existing.id))
      .limit(1);
    await createSession({ userId: existing.id, workspaceId: ws!.id });
    redirect("/");
  }

  // first run — only allowed when there are zero users
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  if (count > 0) return "Incorrect email or password.";

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  const [ws] = await db
    .insert(workspaces)
    .values({ name: "Personal", ownerId: user.id })
    .returning();
  await db.insert(workspaceMembers).values({ workspaceId: ws.id, userId: user.id, role: "owner" });

  await createSession({ userId: user.id, workspaceId: ws.id });
  redirect("/");
}
