import type { Role } from "@/lib/types";

export type Permission =
  | "read"
  | "report"
  | "edit"
  | "submit"
  | "approve"
  | "audit";

const permissions: Record<Role, Permission[]> = {
  staff: ["read", "report"],
  owner: ["read", "report", "edit", "submit"],
  reviewer: ["read", "report", "edit", "submit", "approve", "audit"],
  admin: ["read", "report", "edit", "submit", "approve", "audit"],
};

export const roleLabels: Record<Role, string> = {
  staff: "Staf / kasir",
  owner: "Pemilik konten",
  reviewer: "Reviewer",
  admin: "Admin",
};

export function can(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}
