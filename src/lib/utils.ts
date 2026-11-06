import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function cleanNamePart(value?: string | null) {
  return (value ?? "").trim();
}

/**
 * Stored Western order for files and internal records:
 * Firstname [Middle] Surname
 */
export function fullName(member: {
  firstName: string;
  lastName: string;
  middleName?: string | null;
}) {
  return [
    cleanNamePart(member.firstName),
    cleanNamePart(member.middleName),
    cleanNamePart(member.lastName),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * UI display order: Surname Firstname [Middle]
 */
export function formatMemberName(member: {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
}) {
  const last = cleanNamePart(member.lastName);
  const first = cleanNamePart(member.firstName);
  const middle = cleanNamePart(member.middleName);
  return [last, first, middle].filter(Boolean).join(" ");
}

export function toDateInput(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatYesNo(value: boolean | null | undefined) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return null;
}

export function formatMaritalStatus(value?: string | null) {
  if (value === "SINGLE") return "Single";
  if (value === "MARRIED") return "Married";
  if (value === "DIVORCED") return "Divorced";
  if (value === "WIDOWED") return "Widowed";
  return null;
}

export function initials(name?: string | null) {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]!.toUpperCase()).join("");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Accra",
  });
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
