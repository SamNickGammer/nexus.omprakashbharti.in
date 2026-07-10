# Nexus Security and Secrets

## Security Summary

Nexus will store powerful provider credentials. Security must be designed from the beginning, not added later.

The most important rule: provider credentials must never be stored or displayed in plaintext.

## Immediate Secret Action

A live-looking Neon database URL was shared during planning. Treat it as compromised.

Before implementation starts:

1. Rotate the Neon password or database role.
2. Disable or replace the exposed credential.
3. Create a new least-privilege database role for Nexus.
4. Store the new value only in `.env.local`, deployment environment variables, or a secret manager.
5. Do not commit the connection string.

## Threat Model

Nexus must protect against:

- Accidental secret commits
- Provider token leakage in logs
- Browser exposure of server secrets
- Cross-workspace data leaks
- Stale tokens silently failing
- Over-scoped provider tokens
- Malicious or mistaken destructive actions
- Compromised provider accounts
- Insecure manual database connections
- Webhook spoofing

## Credential Storage

Credential payloads should be encrypted before they are written to Neon.

Credential examples:

- OAuth access tokens
- OAuth refresh tokens
- API tokens
- Database URLs
- Webhook secrets
- SSH key references

Recommended approach:

- Use an application-level encryption key from environment variables or secret manager.
- Encrypt credential payloads server-side.
- Store encrypted ciphertext in `provider_credentials.encrypted_payload`.
- Store key identifier in `encryption_key_id`.
- Keep encryption/decryption code in a small server-only module.
- Never decrypt credentials in client components.

## Environment Variables

Expected environment variables:

```text
DATABASE_URL=postgresql://REDACTED
NEXUS_ENCRYPTION_KEY=REDACTED
AUTH_SECRET=REDACTED
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
SLACK_CLIENT_ID=optional
SLACK_CLIENT_SECRET=optional
```

Rules:

- Use `.env.local` for local development.
- Add `.env*` to `.gitignore`.
- Never include real secrets in Markdown docs.
- Use redacted examples only.
- Use separate credentials for local, staging, and production.

## Token Scope Rules

Request the smallest useful scope.

Examples:

- GitHub: read repository metadata before requesting write scopes.
- Cloudflare: prefer zone read and DNS read for v1.
- Supabase: request management metadata only where needed.
- Neon: use project read metadata before write/admin actions.
- Slack: notification scope before workspace administration.

If a feature requires stronger scopes, Nexus should explain why before requesting them.

## Workspace Isolation

Even in personal-first mode, all records should include `workspace_id`.

Every query should enforce:

- Current user belongs to workspace.
- Resource belongs to workspace.
- Provider account belongs to workspace.
- Credential belongs to provider account in workspace.

This prevents future team support from requiring a full schema rewrite.

## Browser Boundary

Never send these to the browser:

- Provider tokens
- Refresh tokens
- Database passwords
- Full database URLs
- Encryption keys
- Webhook secrets
- SSH private keys

Safe browser data:

- Provider name
- Account label
- Credential status
- Last verification time
- Token expiry time
- Redacted token fingerprint
- Provider console URL

## Logging Rules

Logs must redact:

- Authorization headers
- Cookies
- Tokens
- Database URLs
- Passwords
- Webhook signatures
- SSH keys

Error messages shown to users should be helpful without leaking secrets.

## Audit Logging

Create audit events for:

- Provider account connected
- Provider account disconnected
- Credential rotated
- Sync job manually triggered
- Alert acknowledged
- Manual asset created
- Manual asset deleted
- Health check configuration changed
- Workspace membership changed later

Audit logs should include actor, target, event type, timestamp, and safe metadata.

## Token Failure Handling

When a credential stops working:

1. Mark provider account as degraded or disconnected.
2. Create alert.
3. Keep previous synced assets visible.
4. Mark stale data clearly.
5. Ask user to reconnect.
6. Resume sync after successful verification.

## Webhook Security

Webhook endpoints must:

- Verify provider signature.
- Reject unsigned requests.
- Enforce timestamp tolerance where supported.
- Use idempotency keys when available.
- Avoid doing heavy work inline.
- Record event receipt and schedule sync.

## Destructive Action Policy

V1 should not perform destructive provider operations.

Examples that should deep-link to provider consoles:

- Delete DNS record
- Delete database branch
- Rotate provider database password
- Delete GitHub repository
- Restart production server
- Change registrar settings

Later versions may add limited safe actions only after confirmation design, permissions, dry-run behavior, and audit logging are complete.

## Security Acceptance Criteria

- No plaintext credentials in database rows.
- No provider credentials in browser responses.
- No real secrets in docs or commits.
- Token verification failures create visible alerts.
- All workspace-owned records include workspace authorization.
- Every credential access path is server-only.

