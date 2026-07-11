import "server-only";
import { and, eq, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { providerAccounts, providerCredentials, assets, syncRuns } from "./schema";
import { getConnector } from "./connectors";
import { ConnectorError, type NormalizedAsset } from "./connectors/types";
import { encrypt, decrypt, fingerprint, ENCRYPTION_KEY_ID } from "./crypto";

// All functions are workspace-scoped: the caller passes the session's
// workspaceId and every query is constrained to it (doc/06 isolation).

export async function connectProvider(opts: {
  workspaceId: string;
  provider: string;
  label: string;
  token: string;
}) {
  const connector = getConnector(opts.provider);
  if (!connector) throw new ConnectorError("unknown_error", "No connector for this provider.");

  // 1. verify BEFORE storing (doc/05) — throws on bad credentials, nothing saved
  const meta = await connector.verify(opts.token);

  // 2. store account + encrypted credential
  const [account] = await db
    .insert(providerAccounts)
    .values({
      workspaceId: opts.workspaceId,
      provider: opts.provider,
      label: opts.label || meta.externalAccountName,
      authMethod: "api_token",
      externalAccountId: meta.externalAccountId,
      externalAccountName: meta.externalAccountName,
      scopes: meta.scopes,
      status: "active",
      lastVerifiedAt: new Date(),
    })
    .returning();

  await db.insert(providerCredentials).values({
    providerAccountId: account.id,
    credentialType: "api_token",
    encryptedPayload: encrypt(opts.token),
    encryptionKeyId: ENCRYPTION_KEY_ID,
    fingerprint: fingerprint(opts.token),
  });

  // 3. initial sync
  await runSync(account, opts.token);
  return account.id;
}

export async function resyncAccount(accountId: string, workspaceId: string) {
  const account = await getAccount(accountId, workspaceId);
  if (!account) throw new ConnectorError("unknown_error", "Connection not found.");
  const token = await loadToken(accountId);
  await runSync(account, token);
}

export async function disconnectAccount(accountId: string, workspaceId: string) {
  // cascade removes credentials, assets, and sync_runs
  await db
    .delete(providerAccounts)
    .where(and(eq(providerAccounts.id, accountId), eq(providerAccounts.workspaceId, workspaceId)));
}

// ── internals ──

async function loadToken(accountId: string): Promise<string> {
  const [cred] = await db
    .select({ payload: providerCredentials.encryptedPayload })
    .from(providerCredentials)
    .where(eq(providerCredentials.providerAccountId, accountId))
    .limit(1);
  if (!cred) throw new ConnectorError("invalid_credentials", "Missing credential.");
  return decrypt(cred.payload);
}

async function runSync(
  account: { id: string; workspaceId: string; provider: string; externalAccountName: string | null },
  token: string,
) {
  const { id: accountId, workspaceId, provider } = account;
  const connector = getConnector(provider)!;
  const [run] = await db
    .insert(syncRuns)
    .values({ workspaceId, providerAccountId: accountId, status: "running" })
    .returning();

  try {
    const items = await connector.sync(token, { accountName: account.externalAccountName });
    if (items.length) await upsertAssets(workspaceId, accountId, items);
    await db
      .update(syncRuns)
      .set({ status: "success", finishedAt: new Date(), resourcesSeen: items.length, resourcesCreated: items.length })
      .where(eq(syncRuns.id, run.id));
    await db
      .update(providerAccounts)
      .set({ status: "active", lastSyncAt: new Date(), lastVerifiedAt: new Date() })
      .where(eq(providerAccounts.id, accountId));
  } catch (err) {
    const code = err instanceof ConnectorError ? err.code : "unknown_error";
    await db
      .update(syncRuns)
      .set({ status: "failed", finishedAt: new Date(), errorCode: code, errorMessage: safeMessage(err) })
      .where(eq(syncRuns.id, run.id));
    // degrade the account so the UI can prompt reconnect (doc/06 token failure)
    if (code === "invalid_credentials") {
      await db.update(providerAccounts).set({ status: "disconnected" }).where(eq(providerAccounts.id, accountId));
    } else {
      await db.update(providerAccounts).set({ status: "degraded" }).where(eq(providerAccounts.id, accountId));
    }
    throw err;
  }
}

async function upsertAssets(workspaceId: string, accountId: string, items: NormalizedAsset[]) {
  // ponytail: upsert seen assets only; pruning assets deleted at the provider
  // is a follow-up. Keyed on the (account, type, external_id) unique index.
  await db
    .insert(assets)
    .values(
      items.map((a) => ({
        workspaceId,
        providerAccountId: accountId,
        assetType: a.assetType,
        name: a.name,
        displayName: a.displayName,
        status: a.status,
        environment: a.environment,
        externalId: a.externalId,
        externalUrl: a.externalUrl,
        providerConsoleUrl: a.providerConsoleUrl,
        region: a.region,
        metadata: a.metadata,
        lastSyncedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: [assets.providerAccountId, assets.assetType, assets.externalId],
      set: {
        name: sql`excluded.name`,
        displayName: sql`excluded.display_name`,
        status: sql`excluded.status`,
        environment: sql`excluded.environment`,
        externalUrl: sql`excluded.external_url`,
        providerConsoleUrl: sql`excluded.provider_console_url`,
        region: sql`excluded.region`,
        metadata: sql`excluded.metadata`,
        lastSyncedAt: sql`excluded.last_synced_at`,
        updatedAt: sql`now()`,
      },
    });
}

function safeMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

// ── read helpers (safe fields only — never returns tokens) ──

export async function getAccount(accountId: string, workspaceId: string) {
  const [a] = await db
    .select()
    .from(providerAccounts)
    .where(and(eq(providerAccounts.id, accountId), eq(providerAccounts.workspaceId, workspaceId)))
    .limit(1);
  return a ?? null;
}

export async function listConnections(workspaceId: string) {
  return db
    .select({
      id: providerAccounts.id,
      provider: providerAccounts.provider,
      label: providerAccounts.label,
      externalAccountName: providerAccounts.externalAccountName,
      status: providerAccounts.status,
      lastSyncAt: providerAccounts.lastSyncAt,
      assetCount: sql<number>`(select count(*)::int from ${assets} where ${assets.providerAccountId} = ${providerAccounts.id})`,
    })
    .from(providerAccounts)
    .where(eq(providerAccounts.workspaceId, workspaceId))
    .orderBy(desc(providerAccounts.createdAt));
}

export async function connectionCounts(workspaceId: string) {
  const rows = await db
    .select({ provider: providerAccounts.provider, count: sql<number>`count(*)::int` })
    .from(providerAccounts)
    .where(eq(providerAccounts.workspaceId, workspaceId))
    .groupBy(providerAccounts.provider);
  return Object.fromEntries(rows.map((r) => [r.provider, r.count])) as Record<string, number>;
}

// Every asset in the workspace, tagged with its source account — powers the
// global search panel and the Infra pages.
export async function listAllAssets(workspaceId: string) {
  return db
    .select({
      id: assets.id,
      name: assets.name,
      displayName: assets.displayName,
      assetType: assets.assetType,
      status: assets.status,
      environment: assets.environment,
      externalUrl: assets.externalUrl,
      providerConsoleUrl: assets.providerConsoleUrl,
      lastSyncedAt: assets.lastSyncedAt,
      accountId: providerAccounts.id,
      accountLabel: providerAccounts.label,
      provider: providerAccounts.provider,
    })
    .from(assets)
    .innerJoin(providerAccounts, eq(assets.providerAccountId, providerAccounts.id))
    .where(eq(assets.workspaceId, workspaceId))
    .orderBy(desc(assets.lastSyncedAt));
}

export async function listAssetsByType(workspaceId: string, assetType: string) {
  return (await listAllAssets(workspaceId)).filter((a) => a.assetType === assetType);
}

// One asset + its source account. For domain/website assets we also resolve the
// cross-linked partner (project ↔ domain) via metadata references.
export async function getAssetDetail(assetId: string, workspaceId: string) {
  const [asset] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, assetId), eq(assets.workspaceId, workspaceId)))
    .limit(1);
  if (!asset) return null;

  const account = await getAccount(asset.providerAccountId, workspaceId);
  const meta = (asset.metadata ?? {}) as Record<string, any>;

  // resolve linked assets within the same account
  let linked: { id: string; name: string; assetType: string; status: string | null }[] = [];
  if (asset.assetType === "website" && Array.isArray(meta.domains) && meta.domains.length) {
    const names = meta.domains.map((d: any) => d.name);
    const rows = await db
      .select({ id: assets.id, name: assets.name, assetType: assets.assetType, status: assets.status })
      .from(assets)
      .where(and(eq(assets.workspaceId, workspaceId), eq(assets.providerAccountId, asset.providerAccountId), eq(assets.assetType, "domain")));
    linked = rows.filter((r) => names.includes(r.name));
  } else if (asset.assetType === "domain" && meta.projectExternalId) {
    const rows = await db
      .select({ id: assets.id, name: assets.name, assetType: assets.assetType, status: assets.status })
      .from(assets)
      .where(and(eq(assets.workspaceId, workspaceId), eq(assets.providerAccountId, asset.providerAccountId), eq(assets.assetType, "website"), eq(assets.externalId, String(meta.projectExternalId))));
    linked = rows;
  }

  return { asset, account, linked };
}

export async function getConnectionDetail(accountId: string, workspaceId: string) {
  const account = await getAccount(accountId, workspaceId);
  if (!account) return null;
  const [cred] = await db
    .select({
      fingerprint: providerCredentials.fingerprint,
      credentialType: providerCredentials.credentialType,
      status: providerCredentials.status,
      expiresAt: providerCredentials.expiresAt,
    })
    .from(providerCredentials)
    .where(eq(providerCredentials.providerAccountId, accountId))
    .limit(1);
  const assetRows = await db
    .select()
    .from(assets)
    .where(eq(assets.providerAccountId, accountId))
    .orderBy(desc(assets.lastSyncedAt))
    .limit(200);
  const runs = await db
    .select()
    .from(syncRuns)
    .where(eq(syncRuns.providerAccountId, accountId))
    .orderBy(desc(syncRuns.startedAt))
    .limit(5);
  return { account, credential: cred ?? null, assets: assetRows, runs };
}
