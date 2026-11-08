import * as XLSX from "xlsx";
import {
  MEMBER_TEMPLATE_COLUMNS,
  MEMBER_TEMPLATE_HEADERS,
  bulkMemberRowSchema,
  type BulkMemberRow,
  type MemberTemplateKey,
} from "@/lib/validations/member";

export { MEMBER_TEMPLATE_COLUMNS, MEMBER_TEMPLATE_HEADERS } from "@/lib/validations/member";

function compactHeader(raw: string) {
  return raw
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const EXTRA_HEADER_ALIASES: Record<string, MemberTemplateKey> = {
  first: "firstName",
  givenname: "firstName",
  middle: "middleName",
  othernames: "middleName",
  othername: "middleName",
  last: "lastName",
  surname: "lastName",
  familyname: "lastName",
  dob: "dateOfBirth",
  birthdate: "dateOfBirth",
  phonenumber: "phone",
  mobile: "phone",
  contact: "phone",
  type: "status",
  address: "addressLine1",
  gps: "gpsAddress",
  street: "streetName",
  datebaptised: "dateOfBaptism",
  baptismdate: "dateOfBaptism",
  baptisedby: "officiatingMinisterBaptism",
  baptizedby: "officiatingMinisterBaptism",
  officiatingministerdistrict: "officiatingMinisterDistrict",
  education: "educationLevel",
  memberprofile: "profile",
  biography: "profile",
  bio: "profile",
  testimony: "profile",
  service: "assembly",
  photo: "photoUrl",
};

const HEADER_ALIASES: Record<string, MemberTemplateKey> = {
  ...Object.fromEntries(
    MEMBER_TEMPLATE_COLUMNS.flatMap((column) => [
      [compactHeader(column.key), column.key],
      [compactHeader(column.name), column.key],
    ])
  ) as Record<string, MemberTemplateKey>,
  ...EXTRA_HEADER_ALIASES,
};

function canonicalHeader(raw: string): MemberTemplateKey | undefined {
  return HEADER_ALIASES[compactHeader(raw)];
}

function cellValue(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "-" || /^n\/?a$/i.test(trimmed)) return "";
    return trimmed;
  }
  if (value === undefined || value === null) return "";
  return value;
}

const SAMPLE_ROW: Partial<Record<MemberTemplateKey, string>> = {
  title: "Mrs",
  firstName: "Ama",
  lastName: "Owusu",
  sex: "FEMALE",
  dateOfBirth: "1990-05-17",
  placeOfBirth: "Kumasi",
  phone: "0244000000",
  email: "ama@example.com",
  status: "MEMBER",
  maritalStatus: "MARRIED",
  addressLine1: "08 Long Lane",
  gpsAddress: "GA-123-4567",
  hometown: "Cape Coast",
  city: "Accra",
  holyGhostBaptism: "No",
  waterBaptism: "No",
  communicant: "No",
  occupation: "Nurse",
  educationLevel: "Senior High",
  dedicated: "No",
  profile: "Ama has worshipped with us since 2018 and serves in the choir.",
  assembly: "ENGLISH",
};

export function buildMemberTemplateBuffer() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    MEMBER_TEMPLATE_COLUMNS.map((column) => column.name),
    MEMBER_TEMPLATE_COLUMNS.map((column) => SAMPLE_ROW[column.key] ?? ""),
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function parseMemberSpreadsheet(buffer: ArrayBuffer | Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const results: Array<
    | { ok: true; row: number; data: BulkMemberRow }
    | { ok: false; row: number; error: string }
  > = [];

  rows.forEach((raw, index) => {
    const normalized: Record<string, unknown> = {};
    for (const [rawKey, rawValue] of Object.entries(raw)) {
      const key = canonicalHeader(rawKey);
      if (!key) continue;
      normalized[key] = cellValue(rawValue);
    }

    const hasAnyValue = MEMBER_TEMPLATE_HEADERS.some((key) => {
      const value = normalized[key];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });
    if (!hasAnyValue) return;

    const parsed = bulkMemberRowSchema.safeParse(normalized);
    if (!parsed.success) {
      results.push({
        ok: false,
        row: index + 2,
        error: parsed.error.issues.map((i) => i.message).join("; "),
      });
      return;
    }

    results.push({ ok: true, row: index + 2, data: parsed.data });
  });

  return results;
}

export function buildSingleMemberExcelBuffer(member: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  for (const column of MEMBER_TEMPLATE_COLUMNS) {
    row[column.name] = member[column.key] ?? "";
  }
  const worksheet = XLSX.utils.json_to_sheet([row], {
    header: MEMBER_TEMPLATE_COLUMNS.map((column) => column.name),
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
