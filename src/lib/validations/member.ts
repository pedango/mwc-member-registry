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

export const bulkMemberRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otherNames: z.string().optional().nullable(),
  sex: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(sexSchema),
  assembly: z
    .string()
    .transform((v) => {
      const normalized = v.trim().toUpperCase();
      if (normalized.startsWith("ENG")) return "ENGLISH";
      if (normalized.startsWith("LOC")) return "LOCAL";
      return normalized;
    })
    .pipe(assemblySchema),
  contact: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return "MEMBER" as const;
      const normalized = v.trim().toUpperCase();
      if (normalized.startsWith("OFF")) return "OFFICER" as const;
      return "MEMBER" as const;
    }),
  dateBaptised: z.string().optional().nullable(),
  baptisedBy: z.string().optional().nullable(),
});

export type BulkMemberRow = z.infer<typeof bulkMemberRowSchema>;

export function emptyToNull(value?: string | null) {
  if (value === undefined || value === null || value.trim() === "") return null;
  return value.trim();
}
