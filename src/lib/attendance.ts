const TIMEZONE = "Africa/Accra";

function accraParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    iso: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday ?? "",
  };
}

/** Calendar date in Ghana, stored as UTC midnight for Prisma `@db.Date`. */
export function getServiceDate(date = new Date()) {
  return parseServiceDateParam(accraParts(date).iso);
}

export function parseServiceDateParam(value?: string | null) {
  const iso =
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : accraParts().iso;
  return new Date(`${iso}T00:00:00.000Z`);
}

export function serviceDateIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isSunday(date = new Date()) {
  return accraParts(date).weekday === "Sun";
}

export function formatServiceDateLong(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
