# Nexus Deployment and Operations

## Summary

Nexus should start with a simple deployment model: one Next.js app, one Neon Postgres database, encrypted credentials, and scheduled background jobs.

The deployment should be easy to operate personally but structured enough to become production-grade.

## Environments

Recommended environments:

- Local development
- Staging
- Production

Each environment should have:

- Separate Neon database or branch
- Separate auth secret
- Separate encryption key
- Separate provider OAuth apps where practical
- Separate deployment environment variables

## Required Environment Variables

```text
DATABASE_URL=postgresql://REDACTED
NEXUS_ENCRYPTION_KEY=REDACTED
AUTH_SECRET=REDACTED
APP_URL=https://nexus.example.com
```

Optional provider variables:

```text
GITHUB_CLIENT_ID=REDACTED
GITHUB_CLIENT_SECRET=REDACTED
SLACK_CLIENT_ID=REDACTED
SLACK_CLIENT_SECRET=REDACTED
```

Rules:

- Never commit environment files with real values.
- Use deployment provider secret storage.
- Rotate any secret pasted into chat or docs.

## Neon Setup

Recommended setup:

- Create dedicated Neon project for Nexus.
- Create separate database role for the app.
- Use SSL-required connection.
- Use least-privilege database credentials.
- Rotate the previously shared database credential before use.
- Enable backups/branching according to Neon plan.

Database migration flow:

1. Define schema in ORM.
2. Generate migration.
3. Review migration.
4. Apply to staging.
5. Run tests.
6. Apply to production.

## Hosting Options

Good initial options:

- Vercel for Next.js app
- Self-hosted Node app on VPS
- Dockerized deployment later

If using Vercel:

- Use Vercel environment variables.
- Use scheduled cron for sync jobs if sufficient.
- Use separate worker later if jobs exceed platform limits.

If using VPS:

- Use process manager.
- Use reverse proxy.
- Use HTTPS.
- Use cron or queue worker.
- Configure log rotation.

## Background Jobs

Possible job runners:

- Next.js route triggered by cron
- Vercel Cron
- GitHub Actions scheduled job calling internal endpoint
- Dedicated worker later
- Queue system later

Rules:

- Protect job endpoints with a secret.
- Record every job in `sync_runs` or operational logs.
- Avoid long-running provider sync inside request paths.

## Logging

Log:

- Sync start/end
- Provider errors
- Health check failures
- Alert creation/resolution
- Credential verification failures
- Webhook receipt failures

Do not log:

- Tokens
- Full database URLs
- Authorization headers
- Cookies
- Webhook secrets
- SSH keys

## Monitoring

Monitor:

- App availability
- API error rate
- Job failures
- Sync duration
- Provider rate limits
- Database connection errors
- Alert volume

Nexus should eventually monitor itself as an asset.

## Backups

Backup strategy:

- Use Neon backups or branching.
- Export critical metadata before major migrations.
- Do not export plaintext secrets.
- Test restore procedure before relying on backups.

## Rollback

Rollback should include:

- App deployment rollback
- Migration rollback or forward fix
- Provider sync pause if a connector is broken
- Feature flags for risky integrations

## Production Readiness Checklist

- Shared Neon credential rotated.
- `.env.local` ignored.
- Production secrets configured.
- Database migrations applied.
- Auth works.
- Credential encryption works.
- Provider credentials encrypted.
- No tokens in logs.
- Health checks scheduled.
- Sync jobs scheduled.
- Error reporting enabled.
- Backups confirmed.
- Security review completed.

## Operational Runbooks

### Provider Token Fails

1. Alert appears.
2. Provider account marked degraded.
3. User opens Integrations page.
4. User reconnects account.
5. Nexus verifies credential.
6. Nexus runs sync.
7. Alert resolves.

### Website Down

1. Health check fails.
2. Alert appears.
3. User opens website detail.
4. User checks linked server, domain, DNS, repo, and database.
5. User opens provider console if action is needed.
6. Health check recovers.
7. Alert resolves.

### Sync Job Broken

1. Sync run fails.
2. Error category appears in sync history.
3. Connector logs are reviewed.
4. Provider docs are checked for API changes.
5. Connector is patched.
6. Manual sync verifies recovery.

