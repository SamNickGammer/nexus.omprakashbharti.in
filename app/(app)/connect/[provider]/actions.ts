"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getConnector } from "@/lib/connectors";
import { ConnectorError } from "@/lib/connectors/types";
import { connectProvider } from "@/lib/connections";
import { isConnectable } from "@/lib/providers";

// Token stays server-side: submitted over HTTPS, verified, encrypted, stored.
// It is never logged and never returned to the browser (doc/05, doc/06).
export async function connect(_prev: string | null, form: FormData): Promise<string | null> {
  const session = await getSession();
  if (!session) redirect("/login");

  const provider = String(form.get("provider") ?? "");
  const label = String(form.get("label") ?? "").trim();
  const token = String(form.get("token") ?? "").trim();

  if (!isConnectable(provider) || !getConnector(provider)) return "That provider can't be connected yet.";
  if (!token) return "Paste an API token.";

  let accountId: string;
  try {
    accountId = await connectProvider({ workspaceId: session.workspaceId, provider, label, token });
  } catch (err) {
    if (err instanceof ConnectorError) {
      if (err.code === "invalid_credentials") return "The token was rejected. Check it and try again.";
      if (err.code === "rate_limited") return "Provider rate limit or missing scope. Try later.";
      if (err.code === "provider_unavailable") return "The provider is unavailable right now.";
    }
    return "Could not connect. Verify the token and try again.";
  }

  redirect(`/connections/${accountId}`);
}
