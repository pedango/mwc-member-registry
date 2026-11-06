"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Camera,
  Droplet,
  FileText,
  HeartHandshake,
  Loader2,
  Phone,
  Upload,
  User,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  EDUCATION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  TITLE_OPTIONS,
  PROFILE_MAX_LENGTH,
  memberFormSchema,
  type MemberFormValues,
} from "@/lib/validations/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CameraCapture } from "@/components/members/CameraCapture";
import {
  PhotoUploader,
  uploadCapturedPhoto,
} from "@/components/members/PhotoUploader";
import { DuplicateWarningDialog } from "@/components/members/DuplicateWarningDialog";
import { cn, formatMemberName } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  memberId?: string;
  defaultValues?: Partial<MemberFormValues>;
};

const TRACKED_FIELDS = [
  "title",
  "middleName",
  "placeOfBirth",
  "phone",
  "email",
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
  "photoUrl",
] as const;

const EMPTY_VALUES: MemberFormValues = {
  title: "",
  firstName: "",
  middleName: "",
  lastName: "",
  sex: "MALE",
  dateOfBirth: "",
  placeOfBirth: "",
  phone: "",
  email: "",
  assembly: "ENGLISH",
  status: "MEMBER",
  maritalStatus: null,
  addressLine1: "",
  gpsAddress: "",
  hometown: "",
  streetName: "",
  city: "",
  holyGhostBaptism: null,
  dateOfHolySpiritBaptism: "",
  waterBaptism: null,
  dateOfBaptism: "",
  dateOfConversion: "",
  dateOfJoining: "",
  placeOfBaptism: "",
  officiatingMinisterBaptism: "",
  officiatingMinisterDistrict: "",
  communicant: null,
  occupation: "",
  educationLevel: "",
  profile: "",
  dedicated: null,
  dedicationDate: "",
  dedicationOfficiatingMinister: "",
  dedicationChurch: "",
  photoUrl: "",
};

export function MemberForm({ mode, memberId, defaultValues }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<MemberFormValues | null>(
    null
  );
  const [photoMode, setPhotoMode] = useState<"upload" | "camera">("upload");

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      ...EMPTY_VALUES,
      ...defaultValues,
    },
  });

  const values = form.watch();
  const photoUrl = values.photoUrl;
  const previewName =
    formatMemberName({
      firstName: values.firstName ?? "",
      lastName: values.lastName ?? "",
      middleName: values.middleName,
    }).trim() || "New member";

  const filledCount = TRACKED_FIELDS.filter((key) => {
    const value = values[key];
    if (typeof value === "boolean") return true;
    return typeof value === "string" ? value.trim() !== "" : Boolean(value);
  }).length;
  const completeness = Math.round((filledCount / TRACKED_FIELDS.length) * 100);

  async function submitMember(values: MemberFormValues, forceDuplicate = false) {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        forceDuplicate,
        updatedAt: defaultValues?.updatedAt ?? values.updatedAt,
      };
      const url =
        mode === "create" ? "/api/members" : `/api/members/${memberId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.status === 409 && json.duplicate) {
        setPendingPayload(values);
        setDuplicateOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(json.error || "Failed to save member");
      }

      toast.success(mode === "create" ? "Member added" : "Member updated");
      router.push(`/members/${json.member.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCapture(dataUrl: string) {
    try {
      const url = await uploadCapturedPhoto(dataUrl);
      form.setValue("photoUrl", url, { shouldDirty: true });
      setPhotoMode("upload");
      toast.success("Captured photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Capture upload failed");
    }
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit((v) => submitMember(v, false))}
        className="space-y-6"
      >
        <p className="rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning-soft-fg">
          Fields marked <span className="font-semibold text-destructive">*</span>{" "}
          are required.
        </p>

        <div className="grid items-start gap-4 lg:gap-6 xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="brand-panel overflow-hidden rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/25">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary-foreground/10 text-primary-foreground/70">
                      <UserRound className="h-8 w-8" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-caption uppercase tracking-wide text-white/60">
                    {mode === "create" ? "New record" : "Editing"}
                  </p>
                  <p className="truncate text-section font-semibold">
                    {previewName}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-white/12 px-2 py-1 text-caption">
                  {values.assembly === "ENGLISH" ? "English" : "Local"} Assembly
                </span>
                <span className="rounded-md bg-white/12 px-2 py-1 text-caption">
                  {values.status === "OFFICER" ? "Officer" : "Member"}
                </span>
                <span className="rounded-md bg-white/12 px-2 py-1 text-caption">
                  {values.sex === "FEMALE" ? "Female" : "Male"}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-caption text-white/70">
                  <span>Details filled</span>
                  <span className="numeric tabular-nums">{completeness}%</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-valuenow={completeness}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Details filled"
                >
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-300"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="type-section text-primary">Photo</h2>
                <div className="inline-flex rounded-xl border border-border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setPhotoMode("upload")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-caption font-medium transition-ui",
                      photoMode === "upload"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-pressed={photoMode === "upload"}
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode("camera")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-caption font-medium transition-ui",
                      photoMode === "camera"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-pressed={photoMode === "camera"}
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    Camera
                  </button>
                </div>
              </div>

              {photoMode === "upload" ? (
                <PhotoUploader
                  photoUrl={photoUrl}
                  onUploaded={(url) =>
                    form.setValue("photoUrl", url, { shouldDirty: true })
                  }
                />
              ) : (
                <CameraCapture onCapture={onCapture} />
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <FormSection step={1} title="Personal info" icon={User}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Title">
                  <OptionalSelect
                    value={values.title}
                    placeholder="Select title"
                    options={TITLE_OPTIONS.map((title) => ({
                      value: title,
                      label: title,
                    }))}
                    onChange={(value) =>
                      form.setValue("title", value, { shouldDirty: true })
                    }
                  />
                </Field>
                <Field
                  label="First name"
                  error={form.formState.errors.firstName?.message}
                  required
                >
                  <Input
                    {...form.register("firstName")}
                    autoComplete="given-name"
                    aria-invalid={!!form.formState.errors.firstName}
                  />
                </Field>
                <Field label="Middle name">
                  <Input {...form.register("middleName")} />
                </Field>
                <Field
                  label="Last name"
                  error={form.formState.errors.lastName?.message}
                  required
                >
                  <Input
                    {...form.register("lastName")}
                    autoComplete="family-name"
                    aria-invalid={!!form.formState.errors.lastName}
                  />
                </Field>
                <Field label="Gender" required>
                  <Select
                    value={form.watch("sex")}
                    onValueChange={(v) =>
                      form.setValue("sex", v as "MALE" | "FEMALE", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Date of birth"
                  error={form.formState.errors.dateOfBirth?.message}
                  required
                >
                  <Input
                    type="date"
                    {...form.register("dateOfBirth")}
                    aria-invalid={!!form.formState.errors.dateOfBirth}
                  />
                </Field>
                <Field label="Place of birth">
                  <Input {...form.register("placeOfBirth")} />
                </Field>
                <Field label="Marital status">
                  <OptionalSelect
                    value={values.maritalStatus}
                    placeholder="Select marital status"
                    options={[...MARITAL_STATUS_OPTIONS]}
                    onChange={(value) =>
                      form.setValue(
                        "maritalStatus",
                        (value as MemberFormValues["maritalStatus"]) || null,
                        { shouldDirty: true }
                      )
                    }
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection step={2} title="Church info" icon={Building2}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Assembly" required>
                  <Select
                    value={form.watch("assembly")}
                    onValueChange={(v) =>
                      form.setValue("assembly", v as "ENGLISH" | "LOCAL", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENGLISH">English Assembly</SelectItem>
                      <SelectItem value="LOCAL">Local Assembly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Member type" required>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(v) =>
                      form.setValue("status", v as "MEMBER" | "OFFICER", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="OFFICER">Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FormSection>

            <FormSection step={3} title="Contact & address" icon={Phone}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Phone">
                  <Input {...form.register("phone")} placeholder="024..." />
                </Field>
                <Field
                  label="Email"
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    {...form.register("email")}
                    autoComplete="email"
                    aria-invalid={!!form.formState.errors.email}
                  />
                </Field>
                <Field label="Address line 1" className="md:col-span-2">
                  <Input {...form.register("addressLine1")} />
                </Field>
                <Field label="Street name">
                  <Input {...form.register("streetName")} />
                </Field>
                <Field label="City">
                  <Input {...form.register("city")} />
                </Field>
                <Field label="GPS address">
                  <Input
                    {...form.register("gpsAddress")}
                    placeholder="GA-123-4567"
                  />
                </Field>
                <Field label="Hometown">
                  <Input {...form.register("hometown")} />
                </Field>
              </div>
            </FormSection>

            <FormSection
              step={4}
              title="Baptism & faith"
              icon={Droplet}
              hint="Optional"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Holy Ghost baptism">
                  <YesNoSelect
                    value={values.holyGhostBaptism}
                    onChange={(value) =>
                      form.setValue("holyGhostBaptism", value, {
                        shouldDirty: true,
                      })
                    }
                  />
                </Field>
                <Field label="Date of Holy Spirit baptism">
                  <Input
                    type="date"
                    {...form.register("dateOfHolySpiritBaptism")}
                  />
                </Field>
                <Field label="Water baptism">
                  <YesNoSelect
                    value={values.waterBaptism}
                    onChange={(value) =>
                      form.setValue("waterBaptism", value, {
                        shouldDirty: true,
                      })
                    }
                  />
                </Field>
                <Field label="Date of baptism">
                  <Input type="date" {...form.register("dateOfBaptism")} />
                </Field>
                <Field label="Date of conversion">
                  <Input type="date" {...form.register("dateOfConversion")} />
                </Field>
                <Field label="Date of joining us">
                  <Input type="date" {...form.register("dateOfJoining")} />
                </Field>
                <Field label="Place of baptism">
                  <Input {...form.register("placeOfBaptism")} />
                </Field>
                <Field label="Communicant">
                  <YesNoSelect
                    value={values.communicant}
                    onChange={(value) =>
                      form.setValue("communicant", value, {
                        shouldDirty: true,
                      })
                    }
                  />
                </Field>
                <Field label="Officiating minister (baptism)">
                  <Input {...form.register("officiatingMinisterBaptism")} />
                </Field>
                <Field label="Officiating minister's district / church">
                  <Input {...form.register("officiatingMinisterDistrict")} />
                </Field>
              </div>
            </FormSection>

            <FormSection
              step={5}
              title="Dedication"
              icon={HeartHandshake}
              hint="Optional"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Dedicated">
                  <YesNoSelect
                    value={values.dedicated}
                    onChange={(value) =>
                      form.setValue("dedicated", value, { shouldDirty: true })
                    }
                  />
                </Field>
                <Field label="Dedication date">
                  <Input type="date" {...form.register("dedicationDate")} />
                </Field>
                <Field label="Name of officiating minister">
                  <Input
                    {...form.register("dedicationOfficiatingMinister")}
                  />
                </Field>
                <Field label="Church where dedication was done">
                  <Input {...form.register("dedicationChurch")} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={6} title="Work & education" icon={Briefcase}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Occupation">
                  <Input {...form.register("occupation")} />
                </Field>
                <Field label="Level of education">
                  <OptionalSelect
                    value={values.educationLevel}
                    placeholder="Select education level"
                    options={EDUCATION_OPTIONS.map((level) => ({
                      value: level,
                      label: level,
                    }))}
                    onChange={(value) =>
                      form.setValue("educationLevel", value, {
                        shouldDirty: true,
                      })
                    }
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              step={7}
              title="Profile"
              icon={FileText}
              hint="Optional"
            >
              <Field
                label="Profile"
                error={form.formState.errors.profile?.message}
                hint="Longer notes, testimony, or background. Up to 10,000 characters."
              >
                <Textarea
                  rows={8}
                  maxLength={PROFILE_MAX_LENGTH}
                  className="min-h-[10rem] resize-y"
                  {...form.register("profile")}
                  aria-invalid={!!form.formState.errors.profile}
                />
              </Field>
            </FormSection>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t border-border bg-background/95 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Add member"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>

      <DuplicateWarningDialog
        open={duplicateOpen}
        memberName={
          pendingPayload
            ? formatMemberName({
                firstName: pendingPayload.firstName,
                lastName: pendingPayload.lastName,
                middleName: pendingPayload.middleName,
              })
            : ""
        }
        onCancel={() => {
          setDuplicateOpen(false);
          setPendingPayload(null);
        }}
        onConfirm={() => {
          setDuplicateOpen(false);
          if (pendingPayload) submitMember(pendingPayload, true);
        }}
      />
    </>
  );
}

function FormSection({
  step,
  title,
  icon: Icon,
  hint,
  children,
}: {
  step: number;
  title: string;
  icon: LucideIcon;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/70 px-4 py-3 sm:px-5 sm:py-3.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="min-w-0 text-base font-semibold tracking-tight text-primary sm:text-section">
          <span className="numeric mr-2 text-muted-foreground">{step}.</span>
          {title}
        </h2>
        {hint ? <span className="ml-auto type-caption">{hint}</span> : null}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  className,
  required,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className={className}>
      <Label className="label-caps mb-2 block">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="mt-1.5 type-caption text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 type-caption">{hint}</p>
      ) : null}
    </div>
  );
}

function OptionalSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value?: string | null;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <Select
      value={value || "unset"}
      onValueChange={(next) => onChange(next === "unset" ? null : next)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unset">Not specified</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function YesNoSelect({
  value,
  onChange,
}: {
  value?: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  const selected =
    value === true ? "yes" : value === false ? "no" : "unset";
  return (
    <Select
      value={selected}
      onValueChange={(next) =>
        onChange(next === "yes" ? true : next === "no" ? false : null)
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Not specified" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unset">Not specified</SelectItem>
        <SelectItem value="yes">Yes</SelectItem>
        <SelectItem value="no">No</SelectItem>
      </SelectContent>
    </Select>
  );
}
