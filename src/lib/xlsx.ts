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
    for (const key of MEMBER_TEMPLATE_HEADERS) {
      const matchKey = Object.keys(raw).find(
        (k) => k.trim().toLowerCase() === key.toLowerCase()
      );
      let value = matchKey ? raw[matchKey] : "";
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      }
      normalized[key] = typeof value === "string" ? value.trim() : value;
    }

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
