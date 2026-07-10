# Nexus Product Requirements Document

## Overview

Nexus is a unified operations dashboard for developers who run many services across many providers. It brings together domains, DNS, databases, Git repositories, virtual servers, hosted websites, logs, alerts, and provider account health into one searchable, filterable workspace.

The product begins as a personal dashboard for one developer, then grows into a team-ready control plane for client and project infrastructure.

## Problem Statement

Developers often manage infrastructure through many scattered consoles:

- WordPress hosting dashboards
- Hostinger and GoDaddy accounts
- Cloudflare DNS zones
- Supabase projects across several accounts
- Neon databases and branches
- GitHub repositories
- VPS panels and manually deployed websites
- Slack workspaces and notification channels
- Future AWS and Azure accounts

This creates operational friction:

- It is difficult to remember where a site, domain, database, or DNS record lives.
- Expired domains, broken DNS, failed SSL, stale tokens, and unhealthy services are easy to miss.
- Account switching creates clutter and wastes time.
- Client domains and personal projects are mixed across tools.
- The developer has no single inventory of all technical assets.

Nexus solves this by indexing assets from multiple providers and presenting them in one operational dashboard.

## Target User

The first target user is a solo developer or technical operator who manages:

- Multiple personal domains
- Client domains and DNS
- Multiple database providers
- Many GitHub repositories
- VPS-hosted websites
- WordPress and managed hosting projects
- Provider tokens and credentials
- Operational logs and alerts

Future users may include small teams, agencies, freelancers, and SaaS operators.

## Goals

- Create one place to view every important developer asset.
- Connect many provider accounts of the same type.
- Normalize provider-specific resources into common asset types.
- Provide fast search and filters across providers.
- Detect broken, expired, stale, or disconnected resources.
- Show relationships between assets, such as domain to DNS zone to website to repo to database.
- Provide safe deep links into provider consoles for actions not supported inside Nexus.
- Store metadata and connection state in Neon Postgres.
- Store credentials securely with encryption.

## Non-Goals For V1

- Full CRUD management for every provider.
- Replacing Cloudflare, Supabase, Neon, GitHub, Hostinger, GoDaddy, AWS, or Azure consoles.
- Running destructive operations without provider-specific safety reviews.
- Public SaaS onboarding, billing, or marketplace launch.
- Building a general-purpose password manager.
- Storing raw logs forever without retention controls.

## Product Positioning

Nexus is a developer operations cockpit. It is not a marketing analytics dashboard, a generic uptime monitor, or a hosting provider. It should feel like a focused workspace for someone who knows what a branch, DNS record, token scope, database table, VPS, and deployment are.

## MVP Scope

V1 should include:

- Authentication for the owner
- Workspace-ready data model
- Provider account connection storage
- Encrypted credential storage
- Manual asset entry
- GitHub repository sync
- Supabase project metadata sync
- Neon project and database metadata sync
- Cloudflare zone and DNS metadata sync
- Manual website and VPS inventory
- HTTP health checks
- SSL expiry checks
- Domain expiry tracking where supported
- Alerts for sync failures, expired credentials, unhealthy websites, and expiring SSL
- Overview dashboard
- Databases page
- Domains and DNS page
- Websites and servers page
- Git page
- Integrations page
- Settings page
- Provider console deep links

## Future Scope

Future versions may add:

- Hostinger API integration
- GoDaddy API integration
- Slack notifications
- Email notifications
- AWS account inventory
- Azure subscription inventory
- Database schema browser
- Log ingestion
- Deployment history
- GitHub Actions workflow insights
- Asset graph view
- Team workspaces
- Client workspaces
- Role-based access control
- Billing and public SaaS packaging
- Limited safe provider actions

## Core User Stories

- As a developer, I want to see every connected provider account so I know what Nexus can monitor.
- As a developer, I want to see all databases across Supabase, Neon, and manual Postgres connections so I can find the right database quickly.
- As a developer, I want to filter databases by provider, project, environment, account, and status.
- As a developer, I want to click a database and see tables, connection status, linked repos, linked sites, and provider deep links.
- As a developer, I want to see all domains and DNS zones across providers.
- As a developer, I want to know when DNS, SSL, or health checks fail.
- As a developer, I want to connect many accounts from the same provider.
- As a developer, I want Nexus to tell me when a token stops working.
- As a developer, I want to manually add a VPS-hosted website even if there is no provider API.
- As a developer, I want an asset graph that explains how domains, websites, repos, databases, and providers connect.

## Success Metrics

- Time to find a database, domain, repo, or website decreases significantly.
- Most personal and client assets are represented in Nexus.
- Failed syncs and disconnected provider tokens are visible.
- Expiring SSL certificates and unhealthy websites are detected early.
- The user can add a new provider account without editing code.
- The dashboard remains useful even when some providers fail to sync.

## MVP Acceptance Criteria

- The dashboard can store multiple provider accounts of the same type.
- Credentials are encrypted before storage.
- Assets sync into a normalized model.
- The user can browse databases, domains, websites, repos, and alerts.
- The user can filter by account, provider, type, tag, status, and environment.
- Every synced asset records source provider and last sync time.
- Risky actions link to provider consoles instead of pretending to manage everything internally.
- No real secrets are committed.

