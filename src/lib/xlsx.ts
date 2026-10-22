import * as XLSX from "xlsx";
import { bulkMemberRowSchema, type BulkMemberRow } from "@/lib/validations/member";

export const MEMBER_TEMPLATE_HEADERS = [
  "firstName",
  "lastName",
  "otherNames",
  "sex",
  "assembly",
  "contact",
  "photoUrl",
  "location",
  "motherName",
  "fatherName",
  "position",
  "status",
  "dateBaptised",
  "baptisedBy",
] as const;

type TemplateHeader = (typeof MEMBER_TEMPLATE_HEADERS)[number];

const HEADER_ALIASES: Record<string, TemplateHeader> = {
  firstname: "firstName",
  first: "firstName",
  givenname: "firstName",
  lastname: "lastName",
  last: "lastName",
  surname: "lastName",
  familyname: "lastName",
  othernames: "otherNames",
  othername: "otherNames",
  middlename: "otherNames",
  sex: "sex",
  gender: "sex",
  assembly: "assembly",
  service: "assembly",
  contact: "contact",
  phone: "contact",
  phonenumber: "contact",
  mobile: "contact",
  photourl: "photoUrl",
  photo: "photoUrl",
  location: "location",
  address: "location",
  mothername: "motherName",
  mothersname: "motherName",
  mother: "motherName",
  fathername: "fatherName",
  fathersname: "fatherName",
  father: "fatherName",
  position: "position",
  status: "status",
  datebaptised: "dateBaptised",
  baptismdate: "dateBaptised",
  baptisedby: "baptisedBy",
  baptizedby: "baptisedBy",
};

function canonicalHeader(raw: string): TemplateHeader | undefined {
  const compact = raw
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return HEADER_ALIASES[compact];
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

export function buildMemberTemplateBuffer() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    [...MEMBER_TEMPLATE_HEADERS],
    [
      "John",
      "Doe",
      "Kwame",
      "MALE",
      "ENGLISH",
      "+233XXXXXXXXX",
      "",
      "Accra",
      "Jane Doe",
      "James Doe",
      "Usher",
      "MEMBER",
      "2020-01-15",
      "Pastor Name",
    ],
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
  const worksheet = XLSX.utils.json_to_sheet([member]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Member");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
