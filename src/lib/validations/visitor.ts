import { z } from "zod";

export const VISITOR_PURPOSES = [
  "Sunday service",
  "Midweek service",
  "Prayer meeting",
  "First-time visit",
  "Visiting a member",
  "Special programme",
  "Other",
] as const;

export type VisitorPurpose = (typeof VISITOR_PURPOSES)[number];

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined || value === null) return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    });

export const visitorFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100),
    otherNames: optionalText(150),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    phone: z.string().trim().min(1, "Phone number is required").max(50),
    email: z
      .union([z.literal(""), z.string().email("Enter a valid email")])
      .optional()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }),
    purpose: z.enum(VISITOR_PURPOSES, {
      errorMap: () => ({ message: "Select a purpose for coming" }),
    }),
    purposeOther: optionalText(200),
    photoUrl: z
      .string()
      .max(500)
      .optional()
      .nullable()
      .transform((value) => {
        if (!value) return null;
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }),
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.purpose === "Other" && !data.purposeOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["purposeOther"],
        message: "Tell us the purpose for coming",
      });
    }
    if (
      data.photoUrl &&
      !/^https:\/\//i.test(data.photoUrl)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["photoUrl"],
        message: "Photo upload did not complete",
      });
    }
  });

export type VisitorFormValues = z.infer<typeof visitorFormSchema>;

export function resolveVisitorPurpose(
  purpose: VisitorPurpose,
  purposeOther?: string | null
) {
  if (purpose !== "Other") return purpose;
  return purposeOther?.trim() ? `Other: ${purposeOther.trim()}` : "Other";
}
