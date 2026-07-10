"use client";

import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { authenticate } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full border border-edge-bright bg-surface py-2 text-sm text-text transition-colors hover:border-cyan hover:text-cyan disabled:opacity-50"
    >
      {pending ? "authenticating…" : "sign in →"}
    </button>
  );
}

export default function LoginPage() {
  const [error, action] = useFormState(authenticate, null);

  return (
    <div className="relative z-10 grid min-h-screen place-items-center p-6">
      <div className="term-panel w-full max-w-sm p-8">
        <div className="grad-rule absolute inset-x-0 top-0" />

        <div className="mb-6 flex items-center gap-3">
          <Image src="/logo_withoutname.png" alt="Nexus" width={34} height={34} priority />
          <span className="grad-text text-xl font-bold tracking-[0.25em]">NEXUS</span>
        </div>

        <p className="mb-6 text-sm text-muted">
          <span className="text-cyan">$</span> nexus login
          <span className="cursor ml-1 align-middle" />
        </p>

        <form action={action} className="space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-dim">email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-1 w-full border border-edge bg-surface px-3 py-2 text-sm text-text focus:border-edge-bright focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-dim">password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="mt-1 w-full border border-edge bg-surface px-3 py-2 text-sm text-text focus:border-edge-bright focus:outline-none"
            />
          </label>

          {error && <p className="text-[13px] text-down">{error}</p>}

          <SubmitButton />
        </form>

        <p className="mt-5 text-[11px] leading-relaxed text-dim">
          First sign-in creates the owner account and your personal workspace.
        </p>
      </div>
    </div>
  );
}
