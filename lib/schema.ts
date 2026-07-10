import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Phase 1 base schema: identity + workspace ownership.
// Provider/asset/sync/alert tables land in Phase 2+ (doc/03, doc/11).

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// membership is the authorization unit — every workspace-owned query joins here
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "member"] })
      .notNull()
      .default("owner"),
  },
  (t) => ({
    uniqMember: uniqueIndex("uniq_member").on(t.workspaceId, t.userId),
  }),
);

// A connected provider account (doc/03). Many per provider allowed.
export const providerAccounts = pgTable(
  "provider_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // github | vercel | ...
    label: text("label").notNull(),
    authMethod: text("auth_method").notNull().default("api_token"),
    externalAccountId: text("external_account_id"),
    externalAccountName: text("external_account_name"),
    status: text("status", { enum: ["active", "degraded", "disconnected"] })
      .notNull()
      .default("active"),
    scopes: jsonb("scopes").$type<string[]>(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byWorkspace: index("provider_accounts_ws").on(t.workspaceId, t.provider),
  }),
);

// Encrypted secret for a provider account. Never stores plaintext (doc/06).
export const providerCredentials = pgTable("provider_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerAccountId: uuid("provider_account_id")
    .notNull()
    .references(() => providerAccounts.id, { onDelete: "cascade" }),
  credentialType: text("credential_type").notNull().default("api_token"),
  encryptedPayload: text("encrypted_payload").notNull(),
  encryptionKeyId: text("encryption_key_id").notNull(),
  fingerprint: text("fingerprint"), // safe-to-display last-4
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Normalized resource synced from a provider (doc/03).
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    providerAccountId: uuid("provider_account_id")
      .notNull()
      .references(() => providerAccounts.id, { onDelete: "cascade" }),
    assetType: text("asset_type").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    status: text("status"),
    environment: text("environment"),
    externalId: text("external_id").notNull(),
    externalUrl: text("external_url"),
    providerConsoleUrl: text("provider_console_url"),
    region: text("region"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byWorkspace: index("assets_ws").on(t.workspaceId, t.assetType),
    // provider identity — enables upsert on resync
    uniqIdentity: uniqueIndex("assets_identity").on(t.providerAccountId, t.assetType, t.externalId),
  }),
);

// One row per sync attempt (doc/03).
export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  providerAccountId: uuid("provider_account_id")
    .notNull()
    .references(() => providerAccounts.id, { onDelete: "cascade" }),
  syncType: text("sync_type").notNull().default("full"),
  status: text("status", { enum: ["running", "success", "failed"] }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  resourcesSeen: integer("resources_seen").default(0),
  resourcesCreated: integer("resources_created").default(0),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
});
