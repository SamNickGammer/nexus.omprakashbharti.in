# Nexus Connection Procedures

## Overview

Nexus should support multiple connection styles:

- OAuth connection
- API token connection
- Database URL connection
- Manual provider account entry
- Manual website/server entry
- SSH-based metadata collection in a later phase
- Webhook setup for event-driven updates

Every connection flow should verify access before storing the provider account as active.

## Universal Connection Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Nexus UI
    participant API as Nexus Server
    participant Crypto as Encryption Service
    participant DB as Neon Postgres
    participant Provider as External Provider

    User->>UI: Select provider
    UI->>API: Submit auth method
    API->>Provider: Verify credential or OAuth callback
    Provider-->>API: Account metadata or error
    API->>Crypto: Encrypt credential payload
    Crypto-->>API: Encrypted payload
    API->>DB: Save provider account and credential
    API->>DB: Create sync run
    API->>Provider: Initial resource sync
    Provider-->>API: Resources
    API->>DB: Store normalized assets
    API-->>UI: Connection active
```

## OAuth Provider Flow

Use OAuth for providers that support it cleanly.

Steps:

1. User selects provider.
2. Nexus redirects the user to the provider OAuth authorization URL.
3. User approves requested scopes.
4. Provider redirects back to Nexus callback route.
5. Nexus exchanges authorization code for tokens on the server.
6. Nexus verifies account identity.
7. Nexus encrypts and stores token payload.
8. Nexus creates provider account record.
9. Nexus runs initial sync.
10. Nexus shows connected account status.

Rules:

- Use the smallest scopes that support the selected Nexus features.
- Store refresh tokens only when required.
- Track token expiry.
- Alert when refresh fails.
- Never expose OAuth tokens to the browser.

## API Token Flow

Use API tokens for providers where OAuth is not practical.

Steps:

1. User creates a provider token in the provider console.
2. User copies token into Nexus connection form.
3. Nexus sends token to server over HTTPS.
4. Server verifies token against provider API.
5. Server reads token scopes if provider supports scope inspection.
6. Server encrypts token.
7. Server stores provider account and credential.
8. Server runs initial sync.
9. UI shows provider account health and permission status.

Token form fields:

- Provider
- Account label
- API token
- Optional account identifier
- Optional notes

Rules:

- Do not log submitted tokens.
- Redact tokens in validation errors.
- Show only last 4 characters if a token fingerprint is useful.
- If verification fails, do not store the token unless the user explicitly saves as inactive.

## Database URL Flow

Use database URLs for manually connecting PostgreSQL-compatible databases.

Steps:

1. User enters a redacted-friendly database label.
2. User pastes a database URL.
3. Nexus server parses the URL.
4. Nexus validates protocol and SSL requirements.
5. Nexus attempts a read-only connection.
6. Nexus stores encrypted connection string if verification succeeds.
7. Nexus records database metadata.
8. Nexus optionally inspects schemas and tables using read-only queries.

Rules:

- Prefer read-only database users for external databases.
- Never show full URLs after saving.
- Never store plaintext database URLs.
- Never reuse the Nexus internal database admin credential for external inspection.
- Require rotation for any database URL pasted into chat, docs, or tickets.

Redacted example:

```text
postgresql://readonly_user:REDACTED@example-host.example.neon.tech/database?sslmode=require
```

## Manual Website Flow

Use manual website records when provider integration is unavailable.

Steps:

1. User enters website name.
2. User enters URL.
3. User chooses environment.
4. User links domain, repository, server, and database if known.
5. Nexus runs HTTP health check.
6. Nexus runs SSL check.
7. Nexus stores website asset and health state.

Fields:

- Name
- URL
- Environment
- Owner/client
- Hosting provider
- Linked domain
- Linked repo
- Linked database
- Notes

## Manual Server Flow

Steps:

1. User enters server name.
2. User enters provider label.
3. User enters IP or hostname.
4. User selects environment.
5. User links hosted websites.
6. Nexus stores server asset.
7. Nexus optionally performs ping/HTTP checks through linked sites.

V1 should not require SSH access.

## SSH Metadata Flow Later

SSH-based metadata collection can be added after v1.

Possible metadata:

- OS version
- Disk usage
- Memory usage
- Running services
- Nginx/Apache virtual hosts
- Docker containers

Rules:

- Store SSH keys only as encrypted secrets or external secret references.
- Prefer a limited Nexus user on the server.
- Never run arbitrary user-provided commands without guardrails.
- Record every remote operation as an audit event.

## Webhook Setup Flow

Webhooks can reduce polling for providers like GitHub.

Steps:

1. User enables webhook for a provider account.
2. Nexus generates webhook URL and secret.
3. User installs webhook through provider flow or manually.
4. Nexus verifies webhook signature on incoming events.
5. Nexus updates relevant asset metadata.
6. Nexus records event and schedules follow-up sync if needed.

Rules:

- Every webhook must verify signature.
- Webhook secrets must be encrypted or stored as secret hashes where possible.
- Webhook events should be idempotent.

## Provider Console Deep Links

V1 should use deep links for risky operations.

Examples:

- Edit DNS record in Cloudflare
- Rotate database password in Neon
- Manage Supabase project settings
- Change domain registrar settings
- Review GitHub repository settings
- Restart a VPS through provider panel

Deep links must be stored or generated server-side as part of normalized asset metadata.

