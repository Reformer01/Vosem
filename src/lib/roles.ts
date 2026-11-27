export const ADMIN_ROLES = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full access: manage admins, members, content and all records.",
  },
  {
    value: "moderator",
    label: "Moderator",
    description: "Approve testimonies and prayer requests, and manage sermons and events.",
  },
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number]["value"];

export function roleLabel(value?: string): string {
  return ADMIN_ROLES.find(role => role.value === value)?.label ?? value ?? "Unknown";
}
