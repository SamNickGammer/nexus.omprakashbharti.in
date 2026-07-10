# Nexus Glossary

## Asset

Any resource Nexus tracks. Examples include domains, DNS zones, DNS records, databases, repositories, websites, servers, SSL certificates, and cloud accounts.

## Asset Link

A relationship between two assets. Examples: a website uses a database, a domain resolves to a website, or a website is deployed from a GitHub repository.

## Provider

An external service Nexus connects to, such as GitHub, Supabase, Neon, Cloudflare, Hostinger, GoDaddy, Slack, AWS, or Azure.

## Provider Account

One connected account for a provider. Nexus must support many accounts from the same provider, such as multiple Supabase accounts or multiple Cloudflare accounts.

## Credential

A secret used to access a provider or database. Examples include OAuth tokens, API tokens, database URLs, webhook secrets, and SSH key references.

## Connector

A server-side adapter that knows how to talk to one provider, verify credentials, fetch resources, normalize data, and generate provider deep links.

## Normalized Asset

A provider resource converted into Nexus's common asset shape so resources from different providers can appear in the same UI.

## Sync Run

A recorded attempt to fetch and update data from a provider account.

## Health Check

A scheduled check that verifies whether a website, endpoint, SSL certificate, database, or related resource is healthy.

## Alert

An issue Nexus wants the user to notice, such as a failed sync, disconnected token, unhealthy website, expiring SSL certificate, or stale asset data.

## Deep Link

A URL that opens the exact provider console page for a resource. V1 uses deep links for risky operations instead of performing those operations directly.

## Workspace

A container for users, provider accounts, assets, credentials, alerts, and settings. V1 may have one personal workspace, but the model should support teams later.

## Environment

A label such as production, staging, development, test, or client-specific environment.

## Stale Data

Previously synced data that has not been refreshed within its expected sync window.

## Manual Asset

An asset created directly by the user instead of synced from a provider API.

## Provider Console

The original external service dashboard, such as GitHub, Cloudflare, Supabase, Neon, Hostinger, GoDaddy, AWS, or Azure.

## Least Privilege

The practice of granting Nexus only the minimum provider permissions required for selected features.

## Redaction

Replacing sensitive values with safe placeholders before showing or logging them.

## Encryption At Rest

Storing sensitive data in encrypted form so database access alone does not reveal secrets.

