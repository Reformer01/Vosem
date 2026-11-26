# Admin feature research: church management systems

Reviewed public feature lists for Planning Center, Rock RMS and Tithely/Church Management (26 Nov 2026).

Sources:
- https://www.planningcenter.com/ (People, Groups, Calendar, Check-ins, Services, Giving, Publishing, Church Center)
- https://rockrms.com/ and https://www.rockrms.com/rock-features (Church Management, Communication, Digital Publishing, Engagement, AI; check-in, metrics/reporting, prayer, finance, event registration, workflows, groups, connections, steps)
- https://get.tithe.ly/product/church-management-software and https://tithely.com/ (People, Groups, Events & Check-In, Service Planning, Messaging, Giving Insights Dashboard, Pledge Campaigns, background checks)

## Common modules across these systems

| Module | Typical capability | VOSEM data today |
| --- | --- | --- |
| People / membership | Directory, search, contact details, status | `users` (name, email, whatsappNumber, createdAt) |
| Groups | Small groups, membership, attendance | none |
| Events & check-in | Event list, registrations, attendance counts | `events` + `events/{id}/rsvps/{uid}` |
| Giving & finance | Donation history, purpose breakdown, reports/exports | `donations` (amount in kobo, currency, purpose, status, gateway, donor) |
| Communication | Email/SMS, announcements, follow-up workflows | none (no mail/SMS provider configured) |
| Service planning | Volunteer scheduling, worship plans | none |
| Prayer & care | Prayer requests, follow-up | `prayer_requests` |
| Content | Sermons, media library | `sermons` |
| Dashboards / metrics | Attendance, giving totals, pending items, activity | derivable from the above |
| Administration | Roles, audit log | `admins`, `audit_logs` |

## Decision for this iteration

Implement the modules that need no new data collection and no new provider credentials:

1. **Giving** tab: totals, purpose breakdown, gateway/status, recent gifts, CSV export.
2. **Overview** upgrades: giving this month, pending moderation counts, upcoming events, recent activity.
3. **Reports** tab: one place to export donations, members, events, sermons and submissions as CSV, using the existing role-gated read permissions.
4. **RSVP/attendance** on the Events tab: per-event counts and attendee names where the rules permit reading RSVPs.

Deferred (need new collections, credentials or external services): groups, messaging, service planning, pledge campaigns, background checks, automated follow-up workflows.
