import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MapPin, Pencil, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fullName, formatDate, initials } from "@/lib/utils";
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

  const name = fullName(member);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Members", href: "/members" }, { label: name }]}
        title={name}
        description="Full membership profile"
        action={
          <Button asChild>
            <Link href={`/members/${member.id}/edit`}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit member
            </Link>
          </Button>
        }
      />

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center md:p-6">
          <div className="h-40 w-32 shrink-0 overflow-hidden rounded-lg border border-mwc-border bg-mwc-surface">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-semibold text-mwc-blue/40">
                {initials(name)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="type-section text-foreground">{name}</h2>
              {member.position ? (
                <p className="type-body text-muted-foreground">
                  {member.position}
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
                {member.contact || "No contact on file"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {member.location || "No location on file"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
            <Button asChild variant="outline" size="sm">
              <a href={`/api/members/${member.id}/export?format=pdf`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export PDF
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/api/members/${member.id}/export?format=xlsx`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export Excel
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-mwc-border bg-mwc-surface/60 px-5 py-3 type-caption md:px-6">
          Added {formatDate(member.createdAt)} by{" "}
          {member.createdBy?.name || member.createdBy?.email || "unknown"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Personal details">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="First name" value={member.firstName} />
            <Detail label="Last name" value={member.lastName} />
            <Detail label="Other names" value={member.otherNames} />
            <Detail
              label="Sex"
              value={member.sex === "FEMALE" ? "Female" : "Male"}
            />
            <Detail label="Contact" value={member.contact} />
            <Detail label="Location" value={member.location} />
          </dl>
        </SectionCard>

        <SectionCard title="Church details">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail
              label="Assembly"
              value={
                member.assembly === "ENGLISH"
                  ? "English Assembly"
                  : "Local Assembly"
              }
            />
            <Detail
              label="Status"
              value={member.status === "OFFICER" ? "Officer" : "Member"}
            />
            <Detail label="Position held" value={member.position} />
            <Detail
              label="Date baptised"
              value={
                member.dateBaptised ? formatDate(member.dateBaptised) : null
              }
            />
            <Detail label="Baptised by" value={member.baptisedBy} />
          </dl>
        </SectionCard>

        <SectionCard title="Family" className="lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Mother's name" value={member.motherName} />
            <Detail label="Father's name" value={member.fatherName} />
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
