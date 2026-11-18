"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import { Logo } from "@/components/shared/Logo";
import { VisitorPhotoField } from "@/components/visitors/VisitorPhotoField";
import {
  VISITOR_PURPOSES,
  visitorFormSchema,
  type VisitorPurpose,
} from "@/lib/validations/visitor";

export function VisitForm() {
  const [firstName, setFirstName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<VisitorPurpose | "">("");
  const [purposeOther, setPurposeOther] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneName, setDoneName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = visitorFormSchema.safeParse({
      firstName,
      otherNames,
      lastName,
      phone,
      email,
      purpose,
      purposeOther,
      photoUrl,
      website,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check the form.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not submit. Please try again.");
        return;
      }
      setDoneName(parsed.data.firstName);
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (doneName) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5">
        <div className="mb-8 flex justify-center">
          <Logo className="h-auto w-32" alt="Mamprobi Worship Center" />
        </div>
        <div className="surface p-6 text-center">
          <CheckCircle2
            className="mx-auto h-12 w-12 text-success"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-section font-semibold text-primary">
            Thank you, {doneName}
          </h1>
          <p className="mt-2 type-body text-muted-foreground">
            We are glad you are here. Someone from Mamprobi Worship Center will
            follow up with you.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              setDoneName(null);
              setFirstName("");
              setOtherNames("");
              setLastName("");
              setPhone("");
              setEmail("");
              setPurpose("");
              setPurposeOther("");
              setPhotoUrl("");
              setWebsite("");
              setError(null);
            }}
          >
            Register another visitor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-10">
      <div className="mb-6 flex justify-center">
        <Logo className="h-auto w-28" alt="Mamprobi Worship Center" />
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome to Mamprobi Worship Center
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We&apos;re glad you&apos;re here! Please fill in the form below so we
          can follow up with you.
        </p>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-5 p-5 sm:p-6">
        <Field label="First name" htmlFor="visitor-first-name" required>
          <Input
            id="visitor-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
        </Field>

        <Field label="Other names" htmlFor="visitor-other-names">
          <Input
            id="visitor-other-names"
            value={otherNames}
            onChange={(e) => setOtherNames(e.target.value)}
            autoComplete="additional-name"
          />
        </Field>

        <Field label="Last name" htmlFor="visitor-last-name" required>
          <Input
            id="visitor-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />
        </Field>

        <Field label="Phone number" htmlFor="visitor-phone" required>
          <Input
            id="visitor-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            placeholder="024..."
            required
          />
        </Field>

        <Field label="Email" htmlFor="visitor-email">
          <Input
            id="visitor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field label="Purpose for coming" htmlFor="visitor-purpose" required>
          <Select
            value={purpose || undefined}
            onValueChange={(value) => setPurpose(value as VisitorPurpose)}
          >
            <SelectTrigger id="visitor-purpose">
              <SelectValue placeholder="Select a purpose" />
            </SelectTrigger>
            <SelectContent>
              {VISITOR_PURPOSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {purpose === "Other" ? (
          <Field label="Tell us more" htmlFor="visitor-purpose-other" required>
            <Input
              id="visitor-purpose-other"
              value={purposeOther}
              onChange={(e) => setPurposeOther(e.target.value)}
              placeholder="Why are you visiting today?"
              required
            />
          </Field>
        ) : null}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Photo <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <VisitorPhotoField photoUrl={photoUrl} onUploaded={setPhotoUrl} />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="visitor-website">Website</label>
          <input
            id="visitor-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
