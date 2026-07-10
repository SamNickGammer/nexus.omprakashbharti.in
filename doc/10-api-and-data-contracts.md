# Nexus API and Data Contracts

## Summary

Nexus should expose internal app APIs for the browser and server actions for mutations. Provider APIs should remain behind server-side connector adapters.

The API design should be boring, predictable, and typed.

## Internal API Principles

- Never return secrets to the browser.
- Always scope requests to a workspace.
- Use normalized asset data in UI APIs.
- Keep provider-specific raw payloads server-side unless safe and useful.
- Return consistent error shapes.
- Support pagination for list endpoints.
- Support filters with explicit query parameters.

## Route Areas

Suggested route groups:

- `/api/assets`
- `/api/assets/:id`
- `/api/provider-accounts`
- `/api/provider-accounts/:id`
- `/api/integrations/:provider/connect`
- `/api/integrations/:provider/callback`
- `/api/sync-runs`
- `/api/health-checks`
- `/api/alerts`
- `/api/search`
- `/api/webhooks/:provider`

## Asset List Contract

Example response:

```json
{
  "data": [
    {
      "id": "asset_id",
      "assetType": "database",
      "name": "production",
      "provider": "neon",
      "providerAccountLabel": "Personal Neon",
      "status": "healthy",
      "environment": "production",
      "region": "us-east-1",
      "tags": ["personal", "production"],
      "lastSyncedAt": "2026-07-10T00:00:00.000Z",
      "providerConsoleUrl": "https://provider.example/console"
    }
  ],
  "page": {
    "limit": 50,
    "cursor": null,
    "nextCursor": null
  }
}
```

## Asset Detail Contract

Example response:

```json
{
  "id": "asset_id",
  "assetType": "website",
  "name": "Nexus",
  "status": "healthy",
  "provider": "manual_vps",
  "links": [
    {
      "relationshipType": "uses_database",
      "targetAssetId": "database_asset_id",
      "targetAssetType": "database",
      "targetName": "nexus_production"
    }
  ],
  "health": {
    "lastCheckedAt": "2026-07-10T00:00:00.000Z",
    "statusCode": 200,
    "latencyMs": 184
  },
  "alerts": []
}
```

## Error Contract

Example:

```json
{
  "error": {
    "code": "provider_invalid_credentials",
    "message": "The provider token is no longer valid.",
    "details": {
      "provider": "cloudflare",
      "providerAccountId": "provider_account_id"
    }
  }
}
```

Rules:

- `message` must be safe to show to users.
- `details` must not contain secrets.
- Provider raw errors should be redacted before storage or display.

## Connector Interface

Suggested TypeScript shape:

```ts
export interface ProviderConnector {
  provider: ProviderKey;
  verifyConnection(input: VerifyConnectionInput): Promise<VerifiedConnection>;
  syncAccount(input: SyncAccountInput): Promise<SyncAccountResult>;
  buildDeepLink(input: DeepLinkInput): string | null;
}
```

Supporting types:

```ts
export type ProviderKey =
  | "github"
  | "supabase"
  | "neon"
  | "cloudflare"
  | "hostinger"
  | "godaddy"
  | "manual_vps"
  | "slack"
  | "aws"
  | "azure";
```

## Normalized Asset Payload

Suggested shape:

```ts
export interface NormalizedAsset {
  externalId: string;
  assetType: AssetType;
  name: string;
  displayName?: string;
  status: AssetStatus;
  environment?: string;
  region?: string;
  externalUrl?: string;
  providerConsoleUrl?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
```

## Sync Result Contract

Suggested shape:

```ts
export interface SyncAccountResult {
  providerAccountId: string;
  status: "success" | "partial_success" | "failed" | "rate_limited";
  resourcesSeen: number;
  resourcesCreated: number;
  resourcesUpdated: number;
  resourcesFailed: number;
  assets: NormalizedAsset[];
  links: NormalizedAssetLink[];
  errors: SyncError[];
}
```

## Filtering Contract

Common query parameters:

- `provider`
- `providerAccountId`
- `assetType`
- `status`
- `environment`
- `tag`
- `search`
- `limit`
- `cursor`

Example:

```text
/api/assets?assetType=database&provider=neon&status=healthy&limit=50
```

## Webhook Contract

Webhook routes should:

- Verify signature.
- Parse provider event.
- Store event receipt.
- Queue sync or apply safe metadata update.
- Return quickly.

Webhook route example:

```text
/api/webhooks/github
```

## Frontend Data Fetching

Frontend pages should call Nexus internal APIs, not provider APIs.

Recommended pattern:

- Server components fetch initial list data.
- Client components handle filters, search, and table interactions.
- Mutations use server actions or API routes.
- Optimistic UI only for Nexus-owned metadata, not provider state.

