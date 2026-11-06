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

export const MEMBER_TEMPLATE_HEADERS = [
  "title",
  "firstName",
  "middleName",
  "lastName",
  "sex",
  "dateOfBirth",
  "placeOfBirth",
  "phone",
  "email",
  "status",
  "maritalStatus",
  "addressLine1",
  "gpsAddress",
  "hometown",
  "streetName",
  "city",
  "holyGhostBaptism",
  "dateOfHolySpiritBaptism",
  "waterBaptism",
  "dateOfBaptism",
  "dateOfConversion",
  "dateOfJoining",
  "placeOfBaptism",
  "officiatingMinisterBaptism",
  "officiatingMinisterDistrict",
  "communicant",
  "occupation",
  "educationLevel",
  "profile",
  "dedicated",
  "dedicationDate",
  "dedicationOfficiatingMinister",
  "dedicationChurch",
  "assembly",
  "photoUrl",
] as const;

export const MEMBER_TEMPLATE_COLUMNS: Array<{
  name: (typeof MEMBER_TEMPLATE_HEADERS)[number];
  note: string;
}> = [
  { name: "title", note: "Optional" },
  { name: "firstName", note: "Required" },
  { name: "middleName", note: "Optional" },
  { name: "lastName", note: "Required" },
  { name: "sex", note: "Required: Male or Female" },
  { name: "dateOfBirth", note: "Required date (YYYY-MM-DD)" },
  { name: "placeOfBirth", note: "Optional" },
  { name: "phone", note: "Optional" },
  { name: "email", note: "Optional" },
  { name: "status", note: "Required: Member or Officer" },
  { name: "maritalStatus", note: "Optional: Single, Married, Divorced, Widowed" },
  { name: "addressLine1", note: "Optional" },
  { name: "gpsAddress", note: "Optional" },
  { name: "hometown", note: "Optional" },
  { name: "streetName", note: "Optional" },
  { name: "city", note: "Optional" },
  { name: "holyGhostBaptism", note: "Optional: Yes or No" },
  { name: "dateOfHolySpiritBaptism", note: "Optional date" },
  { name: "waterBaptism", note: "Optional: Yes or No" },
  { name: "dateOfBaptism", note: "Optional date" },
  { name: "dateOfConversion", note: "Optional date" },
  { name: "dateOfJoining", note: "Optional date" },
  { name: "placeOfBaptism", note: "Optional" },
  { name: "officiatingMinisterBaptism", note: "Optional" },
  { name: "officiatingMinisterDistrict", note: "Optional" },
  { name: "communicant", note: "Optional: Yes or No" },
  { name: "occupation", note: "Optional" },
  { name: "educationLevel", note: "Optional" },
  { name: "profile", note: "Optional long text" },
  { name: "dedicated", note: "Optional: Yes or No" },
  { name: "dedicationDate", note: "Optional date" },
  { name: "dedicationOfficiatingMinister", note: "Optional" },
  { name: "dedicationChurch", note: "Optional" },
  { name: "assembly", note: "Required: English or Local" },
  { name: "photoUrl", note: "Optional URL" },
];

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
