# Nexus Documentation

Nexus is a personal-first developer operations dashboard for people who manage many domains, databases, repositories, servers, hosted websites, DNS zones, and cloud/provider accounts across different platforms.

The first version of Nexus should focus on monitoring, inventory, metadata sync, alerts, logs, filtering, and deep links to provider consoles. It should not attempt risky full CRUD across every external service until each provider integration is designed, tested, and permission-scoped.

## Reading Order

1. [Product Requirements](./01-prd.md)
2. [System Architecture](./02-system-architecture.md)
3. [Database Design](./03-database-design.md)
4. [Integrations and Connectors](./04-integrations-and-connectors.md)
5. [Connection Procedures](./05-connection-procedures.md)
6. [Security and Secrets](./06-security-and-secrets.md)
7. [UI and UX Design](./07-ui-ux-design.md)
8. [Feature Specification](./08-feature-specification.md)
9. [Background Jobs and Sync](./09-background-jobs-and-sync.md)
10. [API and Data Contracts](./10-api-and-data-contracts.md)
11. [Roadmap and Phases](./11-roadmap-and-phases.md)
12. [Testing and Quality](./12-testing-and-quality.md)
13. [Deployment and Operations](./13-deployment-and-operations.md)
14. [Glossary](./14-glossary.md)

## Project Principles

- Nexus is personal-first, but its data model should not block future team or SaaS expansion.
- Neon Postgres is the source of truth for Nexus metadata.
- Provider tokens and connection strings must be encrypted before storage.
- Provider APIs are isolated behind connector adapters.
- External provider data is normalized into a shared asset model.
- Risky actions should deep-link to the provider console in v1.
- Secrets must never be committed to source control.

## Current Baseline

The project directory is currently documentation-only. The intended implementation baseline is:

- Next.js full-stack application
- TypeScript
- Neon Postgres
- Drizzle ORM or Prisma
- Server-side provider connector adapters
- Background sync jobs
- Encrypted credential storage
- Dashboard UI with dense developer-focused navigation

## Important Secret Warning

A live-looking Neon database URL was shared during planning. Before implementation starts:

1. Rotate that Neon password or database role.
2. Treat the previous connection string as compromised.
3. Store the replacement only in `.env.local`, deployment environment variables, or a secret manager.
4. Never paste full connection strings into docs, tickets, commits, or chat.

