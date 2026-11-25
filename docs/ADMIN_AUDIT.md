# Admin portal audit (ux-admin-portal + admin-design-system skills)

## What was missing (before this change)
- Only two moderation lists (pending testimonies, pending prayer requests) and two create-only forms (sermons, events).
- No update or delete for sermons/events; no list of created records to manage.
- No member list, no admin management, no activity/audit log.
- No data-table essentials: search, sortable columns, pagination, result counts, loading states, mobile card layout.
- No delete confirmation dialog naming the action; no success feedback for moderation actions.
- Role gate existed but no permissions model beyond "is admin".

## Implemented
- `src/components/admin/crud-table.tsx` — shared table with visible search, sortable headers, 10-row pagination, "Showing X-Y of Z" count, loading/empty states, desktop table + mobile cards, edit/delete row actions and a confirmation dialog.
- `src/app/admin/page.tsx` — tabbed admin area: Overview stats, Sermons (list/create/edit/delete), Events (list/create/edit/delete), Testimonies (moderate/delete), Prayer requests (moderate/delete), Users (read-only), Admins (create/edit/delete), Activity log (read-only).
- Every create/update/approve/delete writes an `audit_logs` entry with actor, action and target.
- Firestore rules now allow admin reads of members/donations/audit logs, admin writes to `admins`, admin deletion of testimonies, and append-only admin audit entries.

## Remaining gaps (not implemented)
- Soft delete / trash with restore and bulk actions with undo.
- Dedicated detail views and inline field editing with change diffs.
- Saved filters, column customisation, row-density preference.
- Granular `resource:action` permissions beyond admin/moderator.
- Scheduled publishing and sermon-series/category management.
