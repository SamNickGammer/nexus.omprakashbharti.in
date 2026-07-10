# Nexus Testing and Quality

## Testing Strategy

Nexus handles infrastructure metadata and secrets, so testing must cover correctness, security, and resilience. The test suite should include unit tests, integration tests, database tests, UI tests, and provider connector tests with mocked APIs.

## Unit Tests

Test:

- Credential encryption and decryption
- Redaction utilities
- Provider error mapping
- Normalized asset conversion
- Asset link creation rules
- Alert generation rules
- Filter parsing
- Pagination helpers
- Date and expiry calculations

Acceptance criteria:

- Secrets never appear in snapshots or failure output.
- Normalizers produce stable asset payloads.
- Alert logic avoids duplicate active alerts.

## Integration Tests

Test with mocked provider APIs:

- GitHub sync
- Supabase sync
- Neon sync
- Cloudflare sync
- Hostinger sync when implemented
- GoDaddy sync when implemented
- Slack notification delivery when implemented

Scenarios:

- Successful sync
- Invalid credentials
- Insufficient scopes
- Rate limit
- Provider outage
- Partial resource failure
- Pagination
- Empty provider account

## Database Tests

Test:

- Workspace isolation
- Provider account ownership
- Credential ownership
- Asset upsert uniqueness
- Asset link creation
- Sync run recording
- Alert state transitions
- Audit event creation

Important checks:

- A user cannot read another workspace's assets.
- A provider credential cannot be loaded outside its workspace.
- Duplicate provider resources update existing assets instead of creating duplicates.

## UI Tests

Test:

- Sidebar navigation
- Overview dashboard
- Database list filters
- Domain list filters
- Website health display
- Provider integration status
- Alert acknowledgement
- Empty states
- Error states
- Global search

Recommended browser scenarios:

- No connected providers
- One connected provider
- Multiple accounts from same provider
- Failed provider token
- Website down
- SSL expiring
- Stale sync data

## Security Tests

Test:

- Provider credentials are encrypted in database.
- API responses do not include plaintext secrets.
- Logs redact tokens and URLs.
- Webhook signatures are required.
- Workspace authorization is enforced.
- Server-only modules are not imported into client bundles.

Manual review:

- Search repo for known secret patterns before committing.
- Confirm `.env.local` is ignored.
- Confirm docs use redacted examples only.

## Health Check Tests

Test:

- HTTP 200 is healthy.
- HTTP 500 is unhealthy.
- Timeout is unhealthy.
- DNS failure is unhealthy.
- SSL expiry threshold creates alert.
- Resolved health issue resolves or updates alert.

## Sync Tests

Test:

- Initial sync after provider connection.
- Scheduled sync.
- Manual sync.
- Sync retry.
- Rate-limit backoff.
- Stale data marking.
- Partial success.

## Acceptance Test Matrix

| Area | Acceptance Criteria |
| --- | --- |
| Auth | User can sign in and access personal workspace |
| Credentials | Secrets encrypted, never returned to browser |
| Providers | Multiple accounts per provider are supported |
| Assets | Assets normalize into shared list views |
| Filters | Lists filter by provider, account, type, status, environment, and tags |
| Sync | Sync runs are recorded and visible |
| Alerts | Failures create alerts and resolved issues clear alerts |
| UI | Empty, loading, error, and success states are clear |
| Security | No real secrets in docs, commits, logs, or client responses |

## Quality Bar

Before shipping a phase:

- Tests pass.
- Type checking passes.
- Linting passes.
- Security scan or secret scan passes.
- Manual smoke test passes.
- New docs or changed behavior are updated.
- Provider API assumptions are verified against current official docs.

