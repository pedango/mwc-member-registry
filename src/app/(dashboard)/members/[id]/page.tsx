import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MapPin, Pencil, Phone, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  formatMaritalStatus,
  formatYesNo,
  formatMemberName,
  initials,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AssemblyBadge, StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";

export default async function MemberProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: { createdBy: { select: { name: true, email: true } } },
  });

  if (!member) notFound();

  const name = formatMemberName(member);
  const location =
    [member.addressLine1, member.city].filter(Boolean).join(", ") ||
    member.gpsAddress ||
    member.hometown;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Members", href: "/members" }, { label: name }]}
        title={name}
        description="Full membership profile"
        action={
          <>
            <Button asChild>
              <Link href="/members/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add member
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/members/${member.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit member
              </Link>
            </Button>
          </>
        }
      />

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-5 md:p-6">
          <div className="mx-auto flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/15 bg-primary/10 sm:mx-0">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {initials(name)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="type-section text-foreground">
                {member.title ? `${member.title} ${name}` : name}
              </h2>
              {member.occupation ? (
                <p className="type-body text-muted-foreground">
                  {member.occupation}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={member.status} />
              <AssemblyBadge assembly={member.assembly} />
            </div>

            <div className="flex flex-col gap-1.5 type-body text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {member.phone || "No phone on file"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {location || "No address on file"}
              </span>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-col">
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href={`/api/members/${member.id}/export?format=pdf`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export PDF
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href={`/api/members/${member.id}/export?format=xlsx`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export Excel
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-border bg-muted/50 px-5 py-3 type-caption md:px-6">
          Added on {formatDate(member.createdAt)} by{" "}
          {member.createdBy?.name || member.createdBy?.email || "unknown"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Personal details">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Title" value={member.title} />
            <Detail label="First name" value={member.firstName} />
            <Detail label="Middle name" value={member.middleName} />
            <Detail label="Last name" value={member.lastName} />
            <Detail
              label="Gender"
              value={member.sex === "FEMALE" ? "Female" : "Male"}
            />
            <Detail
              label="Date of birth"
              value={member.dateOfBirth ? formatDate(member.dateOfBirth) : null}
            />
            <Detail label="Place of birth" value={member.placeOfBirth} />
            <Detail
              label="Marital status"
              value={formatMaritalStatus(member.maritalStatus)}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Church details">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail
              label="Member type"
              value={member.status === "OFFICER" ? "Officer" : "Member"}
            />
            <Detail
              label="Assembly"
              value={
                member.assembly === "ENGLISH"
                  ? "English Assembly"
                  : "Local Assembly"
              }
            />
            <Detail label="Occupation" value={member.occupation} />
            <Detail label="Level of education" value={member.educationLevel} />
          </dl>
        </SectionCard>

        <SectionCard title="Contact & address">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Phone" value={member.phone} />
            <Detail label="Email" value={member.email} />
            <Detail label="Address line 1" value={member.addressLine1} />
            <Detail label="Street name" value={member.streetName} />
            <Detail label="City" value={member.city} />
            <Detail label="GPS address" value={member.gpsAddress} />
            <Detail label="Hometown" value={member.hometown} />
          </dl>
        </SectionCard>

        <SectionCard title="Baptism & faith">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail
              label="Holy Ghost baptism"
              value={formatYesNo(member.holyGhostBaptism)}
            />
            <Detail
              label="Date of Holy Spirit baptism"
              value={
                member.dateOfHolySpiritBaptism
                  ? formatDate(member.dateOfHolySpiritBaptism)
                  : null
              }
            />
            <Detail
              label="Water baptism"
              value={formatYesNo(member.waterBaptism)}
            />
            <Detail
              label="Date of baptism"
              value={
                member.dateOfBaptism ? formatDate(member.dateOfBaptism) : null
              }
            />
            <Detail
              label="Date of conversion"
              value={
                member.dateOfConversion
                  ? formatDate(member.dateOfConversion)
                  : null
              }
            />
            <Detail
              label="Date of joining us"
              value={
                member.dateOfJoining ? formatDate(member.dateOfJoining) : null
              }
            />
            <Detail label="Place of baptism" value={member.placeOfBaptism} />
            <Detail
              label="Officiating minister"
              value={member.officiatingMinisterBaptism}
            />
            <Detail
              label="Minister's district / church"
              value={member.officiatingMinisterDistrict}
            />
            <Detail
              label="Communicant"
              value={formatYesNo(member.communicant)}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Profile" className="lg:col-span-2">
          {member.profile ? (
            <p className="type-body whitespace-pre-wrap font-medium text-foreground">
              {member.profile}
            </p>
          ) : (
            <p className="type-body text-muted-foreground">Not recorded</p>
          )}
        </SectionCard>

        <SectionCard title="Dedication" className="lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Dedicated" value={formatYesNo(member.dedicated)} />
            <Detail
              label="Dedication date"
              value={
                member.dedicationDate ? formatDate(member.dedicationDate) : null
              }
            />
            <Detail
              label="Name of officiating minister"
              value={member.dedicationOfficiatingMinister}
            />
            <Detail
              label="Church where dedication was done"
              value={member.dedicationChurch}
            />
          </dl>
        </SectionCard>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="label-caps">{label}</dt>
      <dd
        className={
          value
            ? "type-body mt-1 font-medium text-foreground"
            : "type-body mt-1 text-muted-foreground"
        }
      >
        {value || "Not recorded"}
      </dd>
    </div>
  );
}
