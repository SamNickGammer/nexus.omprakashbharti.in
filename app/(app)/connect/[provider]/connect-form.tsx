"use client";

import { useFormState, useFormStatus } from "react-dom";
import { connect } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="border border-edge-bright bg-surface px-4 py-2 text-sm text-text transition-colors hover:border-cyan hover:text-cyan disabled:opacity-50"
    >
      {pending ? "verifying token…" : "verify & connect →"}
    </button>
  );
}

export function ConnectForm({ provider, name }: { provider: string; name: string }) {
  const [error, action] = useFormState(connect, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="provider" value={provider} />

      <label className="block">
        <span className="text-[11px] uppercase tracking-wide text-dim">account label (optional)</span>
        <input
          name="label"
          placeholder={`my ${name} account`}
          className="mt-1 w-full border border-edge bg-surface px-3 py-2 text-sm text-text placeholder:text-dim focus:border-edge-bright focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-[11px] uppercase tracking-wide text-dim">api token</span>
        <input
          name="token"
          type="password"
          autoComplete="off"
          required
          className="mt-1 w-full border border-edge bg-surface px-3 py-2 text-sm text-text focus:border-edge-bright focus:outline-none"
        />
        <span className="mt-1 block text-[11px] text-dim">
          Stored encrypted (AES-256). Never shown again, never sent back to the browser.
        </span>
      </label>

      {error && <p className="text-[13px] text-down">{error}</p>}

      <Submit />
    </form>
  );
}
