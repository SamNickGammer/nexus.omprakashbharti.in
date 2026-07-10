# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Nexus** — a personal-first developer operations cockpit. It indexes assets from many providers (domains, DNS, databases, Git repos, VPS/websites, provider accounts) into one normalized, searchable workspace. Domain: `nexus.omprakashbharti.in`.

V1 is **monitoring-and-inventory-first**: sync provider metadata into Neon, run health/SSL/expiry checks, raise alerts, and **deep-link into provider consoles for risky actions** — it does not perform destructive provider mutations itself.

The full spec lives in `doc/` (01-prd through 14-glossary). The SYNAPSE/SPARKPIXEL dashboard image used during setup is a **visual style reference only** — the product is Nexus.

## Commands

```bash
npm run dev        # local dev server (localhost:3000)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next/eslint
npm run typecheck  # tsc --noEmit
```

No test runner is wired yet — the docs prescribe a quality bar (unit/integration/db/ui/security) but name no framework. Pick one when the first testable logic lands.

## Stack

Next.js 14 (App Router, TS) · Tailwind CSS · Neon Postgres (source of truth) · Drizzle **or** Prisma (not yet chosen — decide before writing schema). Auth via `AUTH_SECRET`; credential encryption via `NEXUS_ENCRYPTION_KEY`.

## Architecture (the parts that span files)

- **UI reads normalized Nexus data only** — never calls provider APIs directly, never receives secrets.
- **Server layer** (server actions / route handlers) owns auth, workspace authorization, metadata CRUD, sync triggering, aggregation, search.
- **Provider connectors** are server-side adapters, one per provider, behind a common interface (`verifyConnection`, `syncAccount`, `buildDeepLink`, `normalize`). Isolated so one provider breaking can't take down the dashboard. `ProviderKey`: `github | supabase | neon | cloudflare | hostinger | godaddy | manual_vps | slack | aws | azure`.
- **Background jobs** (sync, health, SSL/expiry, alerts) are idempotent and retry-safe, triggered by cron/Vercel Cron with a secret. Every sync writes a `sync_runs` row; every synced asset records its source provider + last-sync time.
- **Core tables:** `users`, `workspaces`, `workspace_members`, `provider_accounts`, `provider_credentials` (encrypted), `assets`, `asset_links`, `sync_runs`, `health_checks`, `alerts`, `audit_events`. Everything workspace-owned carries `workspace_id`.

## Non-negotiable conventions

- **Server boundary:** all provider access and the crypto module are server-only — never import them into a client bundle.
- **Secrets:** provider credentials are encrypted before storage; never plaintext, never sent to the browser, never logged, never committed. `.env*` is gitignored.
- **Workspace isolation:** every workspace-owned query must enforce membership, even in single-user mode.
- **No destructive provider actions in V1** — deep-link to the provider console instead.
- **Provider APIs drift:** re-check the current official provider docs (auth, scopes, pagination, rate limits) before implementing each connector.
- **Error shape:** `{ error: { code, message, details } }` — `message` is user-safe, `details` never contains secrets.

## Current state (Phase 1 scaffold)

App shell only: sidebar (`app/components/sidebar.tsx`), overview page with placeholder data (`app/page.tsx`), status badge (`app/components/status-badge.tsx`). No DB, auth, connectors, or real data yet — those are Phases 2–4 in `doc/11-roadmap-and-phases.md`.

## Committing (repo rules)

- Commit messages are **one line**, no body.
- Do **not** attribute commits to Claude or any AI — no "Generated with", no `Co-Authored-By: Claude`, no mention of the assistant anywhere in the message.
- Local git identity for this repo is `SamNickGammer <omprakash121samuni@gmail.com>`.
