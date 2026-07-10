"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { resyncAccount, disconnectAccount } from "@/lib/connections";

export async function resync(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(formData.get("id"));
  try {
    await resyncAccount(id, session.workspaceId);
  } catch {
    // sync failure is recorded on the account/sync_run; detail page shows it
  }
  revalidatePath(`/connections/${id}`);
}

export async function disconnect(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(formData.get("id"));
  await disconnectAccount(id, session.workspaceId);
  redirect("/connections");
}
