import type { LogType } from "@prisma/client";

export const AUDIT_LABELS: Record<LogType, string> = {
  LOGIN: "Login",
  EXPORT_SINGLE: "Single export",
  EXPORT_BULK: "Bulk export",
};

/**
 * Audit rows store `targetInfo` in a few shapes depending on the action that
 * wrote them. This turns those raw strings into something an admin can read.
 */
export function describeAuditTarget(
  type: LogType,
  targetInfo?: string | null
): string {
  const raw = targetInfo?.trim();
  if (!raw) {
    return type === "LOGIN" ? "Signed in" : "No details recorded";
  }

  if (type === "EXPORT_SINGLE") {
    const separator = raw.indexOf(":");
    if (separator === -1) return raw;

    const id = raw.slice(0, separator);
    const rest = raw.slice(separator + 1).trim();
    const withFormat = rest.match(/^(.*)\s\(([^)]+)\)$/);
    const name = (withFormat ? withFormat[1] : rest).trim();
    const format = withFormat?.[2]?.toUpperCase();

    if (!name) return `Member #${id.slice(0, 6)}…`;
    return format ? `${name} · ${format}` : name;
  }

  if (type === "EXPORT_BULK") {
    if (raw === "template download") return "Template download";

    const upload = raw.match(
      /^bulk upload:\s*(\d+)\s*created,\s*(\d+)\s*failed$/i
    );
    if (upload) {
      return `Bulk upload · ${upload[1]} created, ${upload[2]} failed`;
    }
  }

  return raw;
}
