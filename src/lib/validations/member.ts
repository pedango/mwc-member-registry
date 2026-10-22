import { z } from "zod";

export const sexSchema = z.enum(["MALE", "FEMALE"]);
export const assemblySchema = z.enum(["ENGLISH", "LOCAL"]);
export const memberStatusSchema = z.enum(["MEMBER", "OFFICER"]);

export const memberFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  otherNames: z.string().max(100).optional().nullable(),
  sex: sexSchema,
  assembly: assemblySchema,
  contact: z.string().max(50).optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  motherName: z.string().max(150).optional().nullable(),
  fatherName: z.string().max(150).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  status: memberStatusSchema,
  dateBaptised: z.string().optional().nullable(),
  baptisedBy: z.string().max(150).optional().nullable(),
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

export const bulkMemberRowSchema = z.object({
  firstName: z.preprocess(asTrimmedString, z.string().min(1, "First name is required")),
  lastName: z.preprocess(asTrimmedString, z.string().min(1, "Last name is required")),
  otherNames: z.string().optional().nullable(),
  sex: z.preprocess(
    normalizeSex,
    z.enum(["MALE", "FEMALE"], {
      errorMap: () => ({ message: "Sex must be Male or Female" }),
    })
  ),
  assembly: z.preprocess(
    normalizeAssembly,
    z.enum(["ENGLISH", "LOCAL"], {
      errorMap: () => ({ message: "Assembly must be English or Local" }),
    })
  ),
  contact: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: z.preprocess(
    normalizeStatus,
    z.enum(["MEMBER", "OFFICER"], {
      errorMap: () => ({ message: "Status must be Member or Officer" }),
    })
  ),
  dateBaptised: z.string().optional().nullable(),
  baptisedBy: z.string().optional().nullable(),
});

export type BulkMemberRow = z.infer<typeof bulkMemberRowSchema>;

export function emptyToNull(value?: string | null) {
  if (value === undefined || value === null || value.trim() === "") return null;
  return value.trim();
}
