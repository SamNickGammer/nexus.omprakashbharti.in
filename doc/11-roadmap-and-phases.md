# Nexus Roadmap and Phases

## Summary

Nexus should be built in phases. The first phases create a strong foundation: secure credentials, normalized assets, reliable sync, and useful read-only monitoring. Later phases can add deeper provider management, teams, notifications, and cloud modules.

## Phase 0: Documentation and Product Shape

Deliverables:

- Documentation pack
- Product requirements
- Architecture design
- Database design
- Security model
- Integration strategy
- Roadmap

Exit criteria:

- The project direction is clear.
- V1 scope is monitoring-first.
- Secrets policy is defined.
- The exposed Neon credential is rotated before coding starts.

## Phase 1: App Foundation

Deliverables:

- Next.js project scaffold
- TypeScript setup
- Tailwind and UI foundation
- Auth
- Neon connection
- ORM setup
- Base schema
- Workspace creation
- Sidebar layout
- Overview shell

Exit criteria:

- User can log in.
- Personal workspace exists.
- App can read/write Neon metadata.
- No real secrets are committed.

## Phase 2: Security and Credential Foundation

Deliverables:

- Credential encryption module
- Provider account tables
- Credential tables
- Redaction utilities
- Audit events
- Integration settings UI
- Manual provider account records

Exit criteria:

- Credentials are encrypted at rest.
- Browser never receives plaintext credentials.
- Provider accounts can be connected as inactive/manual records.
- Audit events are recorded for security-sensitive actions.

## Phase 3: Normalized Asset Inventory

Deliverables:

- Assets table
- Asset links table
- Asset list APIs
- Asset detail APIs
- Global search
- Manual asset creation
- Databases, domains, websites, servers, and Git list pages

Exit criteria:

- User can manually create key assets.
- User can link assets.
- Dashboard can browse and filter assets.
- Manual records are useful even before provider sync exists.

## Phase 4: First Provider Connectors

Deliverables:

- GitHub connector
- Neon connector
- Supabase connector
- Cloudflare connector
- Connector interface
- Initial sync jobs
- Sync run tracking
- Provider deep links

Exit criteria:

- Connected accounts can sync metadata.
- Multiple accounts per provider are supported.
- Sync failures are visible.
- Assets are normalized into shared lists.

## Phase 5: Health Checks and Alerts

Deliverables:

- HTTP health checks
- SSL expiry checks
- Domain expiry checks where supported
- Alert engine
- Alert center
- Alert acknowledgement
- Stale data indicators

Exit criteria:

- Unhealthy websites create alerts.
- Expiring SSL creates alerts.
- Provider sync failures create alerts.
- Token failures create reconnect prompts.

## Phase 6: Hostinger, GoDaddy, VPS, and Manual Ops

Deliverables:

- Hostinger connector where API allows
- GoDaddy connector where API allows
- Manual VPS workflows
- Website/server relationship UI
- Provider console deep links

Exit criteria:

- Hosting and registrar assets are represented.
- Manual server and website inventory supports daily operations.
- Unsupported provider actions deep-link to provider consoles.

## Phase 7: Notifications

Deliverables:

- Slack integration
- Email notifications if desired
- Alert routing preferences
- Notification audit records

Exit criteria:

- Alerts can be delivered outside Nexus.
- Notification failures are tracked.
- Users can configure what matters.

## Phase 8: Asset Graph and Advanced UX

Deliverables:

- Relationship graph view
- Asset impact view
- Better linked-resource suggestions
- Bulk tagging
- Saved filters

Exit criteria:

- User can understand how resources depend on each other.
- Broken relationships are easy to see.
- Large asset sets remain navigable.

## Phase 9: Safe Actions

Deliverables:

- Provider-specific action framework
- Confirmation flows
- Permission checks
- Dry-run where possible
- Audit logs
- Limited safe actions

Possible actions:

- Refresh metadata
- Trigger known deployment workflow
- Restart a monitored health check
- Create provider deep-link task

Avoid until explicitly designed:

- Delete database
- Delete repo
- Delete DNS record
- Rotate production credential
- Restart production server

## Phase 10: Teams and SaaS Readiness

Deliverables:

- Workspace invitations
- Role-based access control
- Client/project grouping
- Billing model if public
- Tenant isolation review
- Data export/delete workflows

Exit criteria:

- Nexus can support more than one user safely.
- Workspace boundaries are enforced.
- SaaS launch requirements are documented.

