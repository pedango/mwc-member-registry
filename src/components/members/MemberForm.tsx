"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Camera,
  Droplet,
  Loader2,
  Phone,
  Upload,
  User,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  memberFormSchema,
  type MemberFormValues,
} from "@/lib/validations/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn, fullName } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  memberId?: string;
  defaultValues?: Partial<MemberFormValues>;
};

const TRACKED_FIELDS = [
  "firstName",
  "lastName",
  "otherNames",
  "contact",
  "photoUrl",
  "location",
  "motherName",
  "fatherName",
  "position",
  "dateBaptised",
  "baptisedBy",
] as const;

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
      firstName: "",
      lastName: "",
      otherNames: "",
      sex: "MALE",
      assembly: "ENGLISH",
      contact: "",
      photoUrl: "",
      location: "",
      motherName: "",
      fatherName: "",
      position: "",
      status: "MEMBER",
      dateBaptised: "",
      baptisedBy: "",
      ...defaultValues,
    },
  });

  const values = form.watch();
  const photoUrl = values.photoUrl;
  const previewName =
    fullName({
      firstName: values.firstName ?? "",
      lastName: values.lastName ?? "",
      otherNames: values.otherNames,
    }).trim() || "New member";

  const filledCount = TRACKED_FIELDS.filter((key) => {
    const value = values[key];
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
      toast.success("Captured photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Capture upload failed");
    }
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit((v) => submitMember(v, false))}
        className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-xl border border-mwc-blue/20 bg-[linear-gradient(155deg,#2E3192_0%,#282b7d_55%,#1a1c5c_100%)] p-5 text-white shadow-card">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/25">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/50">
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
                  className="h-full rounded-full bg-mwc-gold transition-all duration-300"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="type-section text-mwc-blue">Photo</h2>
              <div className="inline-flex rounded-md border border-mwc-border bg-mwc-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setPhotoMode("upload")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-caption font-medium transition-ui",
                    photoMode === "upload"
                      ? "bg-white text-mwc-blue shadow-sm"
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
                      ? "bg-white text-mwc-blue shadow-sm"
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
              <Field label="Other names" hint="Middle or additional names">
                <Input {...form.register("otherNames")} />
              </Field>
              <Field label="Sex" required>
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
              <Field label="Status" required>
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
              <Field label="Position held" className="md:col-span-2">
                <Input
                  {...form.register("position")}
                  placeholder="e.g. Usher, Deacon"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            step={3}
            title="Baptism"
            icon={Droplet}
            hint="Optional"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Date baptised">
                <Input type="date" {...form.register("dateBaptised")} />
              </Field>
              <Field label="Baptised by">
                <Input {...form.register("baptisedBy")} />
              </Field>
            </div>
          </FormSection>

          <FormSection step={4} title="Contact & family" icon={Phone}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Contact">
                <Input {...form.register("contact")} placeholder="+233..." />
              </Field>
              <Field label="Location / residence">
                <Input {...form.register("location")} />
              </Field>
              <Field label="Mother's full name">
                <Input {...form.register("motherName")} />
              </Field>
              <Field label="Father's full name">
                <Input {...form.register("fatherName")} />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* Sticky inside the content column so it can never drift out of
            alignment with the form the way a viewport-fixed bar does. */}
        <div className="sticky bottom-0 z-20 -mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mwc-border bg-white/95 px-4 py-3 shadow-cardHover backdrop-blur lg:col-span-2">
          <p className="type-caption">
            Fields marked <span className="text-destructive">*</span> are
            required
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
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
        </div>
      </form>

      <DuplicateWarningDialog
        open={duplicateOpen}
        memberName={
          pendingPayload
            ? fullName({
                firstName: pendingPayload.firstName,
                lastName: pendingPayload.lastName,
                otherNames: pendingPayload.otherNames,
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
  icon: typeof User;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-mwc-border bg-mwc-surface/70 px-5 py-3.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-mwc-blue/10 text-mwc-blue">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="type-section text-mwc-blue">
          <span className="numeric mr-2 text-muted-foreground">{step}.</span>
          {title}
        </h2>
        {hint ? (
          <span className="ml-auto type-caption">{hint}</span>
        ) : null}
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
