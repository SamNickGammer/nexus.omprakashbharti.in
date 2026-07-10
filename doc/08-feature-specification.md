# Nexus Feature Specification

## Overview

This document lists the major Nexus feature areas and expected behavior. V1 should prioritize reliable monitoring and inventory over broad write access.

## Overview Dashboard

Features:

- Global status summary
- Critical alert list
- Provider health summary
- Website uptime summary
- SSL/domain expiry summary
- Recent sync failures
- Recent asset changes
- Quick filters
- Global search

Acceptance criteria:

- The user can see urgent operational problems without visiting each provider.
- Provider failures do not prevent the rest of the dashboard from loading.
- Each summary item links to the relevant detail page.

## Databases

Features:

- List all connected databases across providers.
- Filter by provider, account, project, environment, region, status, and tags.
- Show Supabase and Neon metadata.
- Allow manual Postgres database entries.
- Show linked websites and repositories.
- Display read-only schema/table metadata when enabled.
- Link to provider console.

V1 actions:

- View database details.
- Refresh metadata.
- Open provider console.
- Link database to website or repo.

Deferred actions:

- Create database.
- Delete database.
- Rotate database password.
- Run arbitrary SQL.

## Domains and DNS

Features:

- List domains, zones, and DNS records.
- Show registrar and DNS provider.
- Show nameservers.
- Show expiry where available.
- Show SSL state.
- Link domains to websites and servers.
- Detect mismatches where possible.

V1 actions:

- View DNS records.
- Refresh DNS metadata.
- Open provider console.
- Link domain to website.

Deferred actions:

- Edit DNS records.
- Delete DNS records.
- Change nameservers.
- Transfer domains.

## Websites

Features:

- Manual website inventory.
- Provider-synced websites where supported.
- HTTP health checks.
- SSL checks.
- Environment labels.
- Linked domain, server, repo, and database.
- Health history.

V1 actions:

- Add website.
- Edit Nexus metadata.
- Refresh health check.
- Open hosting/deploy/provider link.

Deferred actions:

- Restart website.
- Deploy website.
- Edit remote server configuration.

## Servers

Features:

- Manual server inventory.
- Provider label.
- Hostname/IP.
- Environment.
- Linked websites.
- Health summary through linked endpoints.

V1 actions:

- Add server.
- Edit server metadata.
- Link websites.

Deferred actions:

- SSH command execution.
- Service restart.
- Package updates.
- Disk cleanup.

## Git

Features:

- Sync GitHub repositories.
- Show repo metadata.
- Show visibility, language, default branch, pushed date.
- Show open PR/issue counts where available.
- Link repos to websites and databases.

V1 actions:

- View repo details.
- Open GitHub.
- Refresh metadata.
- Link repo to asset.

Deferred actions:

- Delete repo.
- Change repo settings.
- Merge pull requests.
- Trigger production deploys without explicit integration design.

## Logs

V1 logs should focus on Nexus operational logs:

- Sync runs
- Health checks
- Alerts
- Credential verification
- Manual changes
- Webhook events where added

Future logs may include:

- Server logs
- App logs
- Deployment logs
- Provider audit logs

## Alerts

Alert categories:

- Provider disconnected
- Token expired
- Insufficient scope
- Sync failed
- Website down
- SSL expiring
- Domain expiring
- DNS mismatch
- Database unreachable
- Stale data

Alert actions:

- Acknowledge
- Resolve automatically when fixed
- Open related asset
- Open reconnect flow
- Open provider console

## Integrations

Features:

- Connect provider account.
- View connected accounts.
- See last sync and status.
- Reconnect account.
- Disconnect account.
- Trigger manual sync.
- View required scopes.

Providers:

- GitHub
- Supabase
- Neon
- Cloudflare
- Hostinger
- GoDaddy
- Manual VPS
- Slack
- AWS later
- Azure later

## Settings

Settings areas:

- Profile
- Workspace
- Provider accounts
- Credential health
- Alert preferences
- Notification channels
- Tags and environments
- Data retention
- Export/delete data later

## Notifications

Initial notification targets:

- In-app alert center

Near-future targets:

- Slack
- Email
- Webhook

## Search and Filters

Search should work across:

- Asset names
- Provider account labels
- Domains
- URLs
- Repository names
- Database names
- Tags

Filters should be consistent:

- Provider
- Account
- Asset type
- Status
- Environment
- Tags
- Last sync
- Alert state

## Import and Manual Entry

Manual entry is important because not every provider has useful APIs.

Manual assets:

- Domain
- Website
- Server
- Database
- Repository link
- Provider account note

Manual records should still support health checks, links, tags, alerts, and notes.

