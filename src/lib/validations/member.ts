import { z } from "zod";

export const sexSchema = z.enum(["MALE", "FEMALE"]);
export const assemblySchema = z.enum(["ENGLISH", "LOCAL"]);
export const memberStatusSchema = z.enum(["MEMBER", "OFFICER"]);
export const maritalStatusSchema = z.enum([
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
]);

export const TITLE_OPTIONS = [
  "Mr",
  "Mrs",
  "Miss",
  "Ms",
  "Dr",
  "Rev",
  "Elder",
  "Pastor",
] as const;

export const EDUCATION_OPTIONS = [
  "None",
  "Primary",
  "Junior High",
  "Senior High",
  "Vocational/Technical",
  "Tertiary",
  "Postgraduate",
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
] as const;

export const MEMBER_TEMPLATE_COLUMNS = [
  { key: "title", name: "Title", note: "Optional" },
  { key: "firstName", name: "First Name *", note: "Required" },
  { key: "middleName", name: "Middle Name", note: "Optional" },
  { key: "lastName", name: "Last Name *", note: "Required" },
  { key: "sex", name: "Gender *", note: "Required: Male or Female" },
  { key: "dateOfBirth", name: "Date of Birth *", note: "Required date (YYYY-MM-DD)" },
  { key: "placeOfBirth", name: "Place of Birth", note: "Optional" },
  { key: "phone", name: "Phone", note: "Optional" },
  { key: "email", name: "Email", note: "Optional" },
  { key: "status", name: "Member Type *", note: "Required: Member or Officer" },
  { key: "maritalStatus", name: "Marital Status", note: "Optional: Single, Married, Divorced, Widowed" },
  { key: "addressLine1", name: "Address line 1", note: "Optional" },
  { key: "gpsAddress", name: "GPS Address", note: "Optional" },
  { key: "hometown", name: "Hometown", note: "Optional" },
  { key: "streetName", name: "Street Name", note: "Optional" },
  { key: "city", name: "City", note: "Optional" },
  { key: "holyGhostBaptism", name: "HolyGhost Baptism", note: "Optional: Yes or No" },
  { key: "dateOfHolySpiritBaptism", name: "Date of HolySpirit Baptism", note: "Optional date" },
  { key: "waterBaptism", name: "Water Baptism", note: "Optional: Yes or No" },
  { key: "dateOfBaptism", name: "Date of Baptism", note: "Optional date" },
  { key: "dateOfConversion", name: "Date of Conversion", note: "Optional date" },
  { key: "dateOfJoining", name: "Date of joining us", note: "Optional date" },
  { key: "placeOfBaptism", name: "Place of Baptism", note: "Optional" },
  { key: "officiatingMinisterBaptism", name: "Officiating Minister Baptism", note: "Optional" },
  {
    key: "officiatingMinisterDistrict",
    name: "Officiating Ministers District/Church",
    note: "Optional",
  },
  { key: "communicant", name: "Communicant?", note: "Optional: Yes or No" },
  { key: "occupation", name: "Occupation", note: "Optional" },
  { key: "educationLevel", name: "Level of Education", note: "Optional" },
  { key: "dedicated", name: "Dedicated", note: "Optional: Yes or No" },
  { key: "dedicationDate", name: "Dedication Date", note: "Optional date" },
  {
    key: "dedicationOfficiatingMinister",
    name: "Name of Officiating Minister",
    note: "Optional",
  },
  {
    key: "dedicationChurch",
    name: "Church where dedication was done",
    note: "Optional",
  },
  { key: "profile", name: "Profile", note: "Optional long text" },
  { key: "assembly", name: "Assembly", note: "Required: English or Local" },
  { key: "photoUrl", name: "Photo URL", note: "Optional URL" },
] as const;

export type MemberTemplateKey = (typeof MEMBER_TEMPLATE_COLUMNS)[number]["key"];

export const MEMBER_TEMPLATE_HEADERS: MemberTemplateKey[] =
  MEMBER_TEMPLATE_COLUMNS.map((column) => column.key);

export function memberFieldLabel(key: MemberTemplateKey) {
  const column = MEMBER_TEMPLATE_COLUMNS.find((item) => item.key === key);
  return (column?.name ?? key).replace(/\s*\*$/, "").trim();
}

export const PROFILE_MAX_LENGTH = 10000;

const optionalText = (max: number) =>
  z.string().max(max).optional().nullable();

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

const optionalDateString = z
  .union([z.literal(""), dateString])
  .optional()
  .nullable();

const optionalEmail = z
  .union([z.literal(""), z.string().email("Enter a valid email")])
  .optional()
  .nullable();

const optionalBoolean = z.boolean().optional().nullable();

export const memberFormSchema = z.object({
  title: optionalText(40),
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: optionalText(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  sex: sexSchema,
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  placeOfBirth: optionalText(150),
  phone: optionalText(50),
  email: optionalEmail,
  assembly: assemblySchema,
  status: memberStatusSchema,
  maritalStatus: maritalStatusSchema.optional().nullable(),
  addressLine1: optionalText(200),
  gpsAddress: optionalText(80),
  hometown: optionalText(150),
  streetName: optionalText(150),
  city: optionalText(150),
  holyGhostBaptism: optionalBoolean,
  dateOfHolySpiritBaptism: optionalDateString,
  waterBaptism: optionalBoolean,
  dateOfBaptism: optionalDateString,
  dateOfConversion: optionalDateString,
  dateOfJoining: optionalDateString,
  placeOfBaptism: optionalText(150),
  officiatingMinisterBaptism: optionalText(150),
  officiatingMinisterDistrict: optionalText(200),
  communicant: optionalBoolean,
  occupation: optionalText(150),
  educationLevel: optionalText(80),
  profile: optionalText(PROFILE_MAX_LENGTH),
  dedicated: optionalBoolean,
  dedicationDate: optionalDateString,
  dedicationOfficiatingMinister: optionalText(150),
  dedicationChurch: optionalText(200),
  photoUrl: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  forceDuplicate: z.boolean().optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

function asTrimmedString(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeSex(value: unknown) {
  const s = asTrimmedString(value).toUpperCase();
  if (["M", "MALE", "MAN"].includes(s)) return "MALE";
  if (["F", "FEMALE", "WOMAN"].includes(s)) return "FEMALE";
  return s;
}

function normalizeAssembly(value: unknown) {
  const s = asTrimmedString(value).toUpperCase();
  if (s.startsWith("ENG")) return "ENGLISH";
  if (s.startsWith("LOC")) return "LOCAL";
  return s;
}

function normalizeStatus(value: unknown) {
  const s = asTrimmedString(value).toUpperCase();
  if (!s) return "MEMBER";
  if (s.startsWith("OFF")) return "OFFICER";
  if (s.startsWith("MEM")) return "MEMBER";
  return s;
}

function normalizeMaritalStatus(value: unknown) {
  const s = asTrimmedString(value).toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return null;
  if (s.startsWith("SING")) return "SINGLE";
  if (s.startsWith("MARR")) return "MARRIED";
  if (s.startsWith("DIV")) return "DIVORCED";
  if (s.startsWith("WID")) return "WIDOWED";
  return s;
}

function normalizeYesNo(value: unknown) {
  const s = asTrimmedString(value).toUpperCase();
  if (!s) return null;
  if (["Y", "YES", "TRUE", "1"].includes(s)) return true;
  if (["N", "NO", "FALSE", "0"].includes(s)) return false;
  return s;
}

const optionalBulkText = z.preprocess((value) => {
  const s = asTrimmedString(value);
  return s === "" ? null : s;
}, z.string().optional().nullable());

const optionalBulkDate = z.preprocess((value) => {
  const s = asTrimmedString(value);
  return s === "" ? null : s;
}, z.union([dateString, z.null()]).optional().nullable());

const optionalBulkBoolean = z.preprocess(
  normalizeYesNo,
  z
    .union([
      z.boolean(),
      z.null(),
      z.undefined(),
    ])
    .optional()
);

export const bulkMemberRowSchema = z.object({
  title: optionalBulkText,
  firstName: z.preprocess(asTrimmedString, z.string().min(1, "First name is required")),
  middleName: optionalBulkText,
  lastName: z.preprocess(asTrimmedString, z.string().min(1, "Last name is required")),
  sex: z.preprocess(
    normalizeSex,
    z.enum(["MALE", "FEMALE"], {
      errorMap: () => ({ message: "Gender must be Male or Female" }),
    })
  ),
  dateOfBirth: z.preprocess(
    asTrimmedString,
    z
      .string()
      .min(1, "Date of birth is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  ),
  placeOfBirth: optionalBulkText,
  phone: optionalBulkText,
  email: z.preprocess((value) => {
    const s = asTrimmedString(value);
    return s === "" ? null : s;
  }, z.union([z.string().email("Enter a valid email"), z.null()]).optional().nullable()),
  assembly: z.preprocess(
    normalizeAssembly,
    z.enum(["ENGLISH", "LOCAL"], {
      errorMap: () => ({ message: "Assembly must be English or Local" }),
    })
  ),
  status: z.preprocess(
    normalizeStatus,
    z.enum(["MEMBER", "OFFICER"], {
      errorMap: () => ({ message: "Member type must be Member or Officer" }),
    })
  ),
  maritalStatus: z.preprocess(
    normalizeMaritalStatus,
    maritalStatusSchema.optional().nullable()
  ),
  addressLine1: optionalBulkText,
  gpsAddress: optionalBulkText,
  hometown: optionalBulkText,
  streetName: optionalBulkText,
  city: optionalBulkText,
  holyGhostBaptism: optionalBulkBoolean,
  dateOfHolySpiritBaptism: optionalBulkDate,
  waterBaptism: optionalBulkBoolean,
  dateOfBaptism: optionalBulkDate,
  dateOfConversion: optionalBulkDate,
  dateOfJoining: optionalBulkDate,
  placeOfBaptism: optionalBulkText,
  officiatingMinisterBaptism: optionalBulkText,
  officiatingMinisterDistrict: optionalBulkText,
  communicant: optionalBulkBoolean,
  occupation: optionalBulkText,
  educationLevel: optionalBulkText,
  profile: z.preprocess((value) => {
    const s = asTrimmedString(value);
    return s === "" ? null : s;
  }, z.string().max(PROFILE_MAX_LENGTH).optional().nullable()),
  dedicated: optionalBulkBoolean,
  dedicationDate: optionalBulkDate,
  dedicationOfficiatingMinister: optionalBulkText,
  dedicationChurch: optionalBulkText,
  photoUrl: optionalBulkText,
});

export type BulkMemberRow = z.infer<typeof bulkMemberRowSchema>;

export function emptyToNull(value?: string | null) {
  if (value === undefined || value === null || value.trim() === "") return null;
  return value.trim();
}

export function parseDate(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00.000Z`
    : trimmed;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toMemberRecord(
  data: MemberFormValues | BulkMemberRow,
  photoUrl?: string | null
) {
  return {
    title: emptyToNull(data.title),
    firstName: data.firstName.trim(),
    middleName: emptyToNull(data.middleName),
    lastName: data.lastName.trim(),
    sex: data.sex,
    dateOfBirth: parseDate(data.dateOfBirth),
    placeOfBirth: emptyToNull(data.placeOfBirth),
    phone: emptyToNull(data.phone),
    email: emptyToNull(data.email),
    assembly: data.assembly,
    status: data.status,
    maritalStatus: data.maritalStatus ?? null,
    addressLine1: emptyToNull(data.addressLine1),
    gpsAddress: emptyToNull(data.gpsAddress),
    hometown: emptyToNull(data.hometown),
    streetName: emptyToNull(data.streetName),
    city: emptyToNull(data.city),
    holyGhostBaptism: data.holyGhostBaptism ?? null,
    dateOfHolySpiritBaptism: parseDate(data.dateOfHolySpiritBaptism),
    waterBaptism: data.waterBaptism ?? null,
    dateOfBaptism: parseDate(data.dateOfBaptism),
    dateOfConversion: parseDate(data.dateOfConversion),
    dateOfJoining: parseDate(data.dateOfJoining),
    placeOfBaptism: emptyToNull(data.placeOfBaptism),
    officiatingMinisterBaptism: emptyToNull(data.officiatingMinisterBaptism),
    officiatingMinisterDistrict: emptyToNull(data.officiatingMinisterDistrict),
    communicant: data.communicant ?? null,
    occupation: emptyToNull(data.occupation),
    educationLevel: emptyToNull(data.educationLevel),
    profile: emptyToNull(data.profile),
    dedicated: data.dedicated ?? null,
    dedicationDate: parseDate(data.dedicationDate),
    dedicationOfficiatingMinister: emptyToNull(
      data.dedicationOfficiatingMinister
    ),
    dedicationChurch: emptyToNull(data.dedicationChurch),
    photoUrl: photoUrl === undefined ? emptyToNull(data.photoUrl) : photoUrl,
  };
}
