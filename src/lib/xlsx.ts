import * as XLSX from "xlsx";
import {
  MEMBER_TEMPLATE_HEADERS,
  bulkMemberRowSchema,
  type BulkMemberRow,
} from "@/lib/validations/member";

export { MEMBER_TEMPLATE_COLUMNS, MEMBER_TEMPLATE_HEADERS } from "@/lib/validations/member";

type TemplateHeader = (typeof MEMBER_TEMPLATE_HEADERS)[number];

const HEADER_ALIASES: Record<string, TemplateHeader> = {
  title: "title",
  firstname: "firstName",
  first: "firstName",
  givenname: "firstName",
  middlename: "middleName",
  middle: "middleName",
  othernames: "middleName",
  othername: "middleName",
  lastname: "lastName",
  last: "lastName",
  surname: "lastName",
  familyname: "lastName",
  sex: "sex",
  gender: "sex",
  dateofbirth: "dateOfBirth",
  dob: "dateOfBirth",
  birthdate: "dateOfBirth",
  placeofbirth: "placeOfBirth",
  phone: "phone",
  phonenumber: "phone",
  mobile: "phone",
  contact: "phone",
  email: "email",
  status: "status",
  membertype: "status",
  type: "status",
  maritalstatus: "maritalStatus",
  addressline1: "addressLine1",
  address: "addressLine1",
  gpsaddress: "gpsAddress",
  gps: "gpsAddress",
  hometown: "hometown",
  streetname: "streetName",
  street: "streetName",
  city: "city",
  holyghostbaptism: "holyGhostBaptism",
  dateofholyspiritbaptism: "dateOfHolySpiritBaptism",
  waterbaptism: "waterBaptism",
  dateofbaptism: "dateOfBaptism",
  datebaptised: "dateOfBaptism",
  baptismdate: "dateOfBaptism",
  dateofconversion: "dateOfConversion",
  dateofjoiningus: "dateOfJoining",
  dateofjoining: "dateOfJoining",
  placeofbaptism: "placeOfBaptism",
  officiatingministerbaptism: "officiatingMinisterBaptism",
  baptisedby: "officiatingMinisterBaptism",
  baptizedby: "officiatingMinisterBaptism",
  officiatingministersdistrictchurch: "officiatingMinisterDistrict",
  officiatingministerdistrict: "officiatingMinisterDistrict",
  communicant: "communicant",
  occupation: "occupation",
  levelofeducation: "educationLevel",
  educationlevel: "educationLevel",
  education: "educationLevel",
  profile: "profile",
  memberprofile: "profile",
  biography: "profile",
  bio: "profile",
  testimony: "profile",
  dedicated: "dedicated",
  dedicationdate: "dedicationDate",
  nameofofficiatingminister: "dedicationOfficiatingMinister",
  dedicationofficiatingminister: "dedicationOfficiatingMinister",
  churchwherededicationwasdone: "dedicationChurch",
  dedicationchurch: "dedicationChurch",
  assembly: "assembly",
  service: "assembly",
  photourl: "photoUrl",
  photo: "photoUrl",
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
      "Mrs",
      "Ama",
      "",
      "Owusu",
      "FEMALE",
      "1990-05-17",
      "Kumasi",
      "0244000000",
      "ama@example.com",
      "MEMBER",
      "MARRIED",
      "08 Long Lane",
      "GA-123-4567",
      "Cape Coast",
      "",
      "Accra",
      "No",
      "",
      "No",
      "",
      "",
      "",
      "",
      "",
      "",
      "No",
      "Nurse",
      "Senior High",
      "Ama has worshipped with us since 2018 and serves in the choir.",
      "No",
      "",
      "",
      "",
      "ENGLISH",
      "",
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
