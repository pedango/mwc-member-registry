import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatVisitorName, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { DeleteVisitorAction } from "./delete-visitor-action";

export const dynamic = "force-dynamic";

export default async function VisitorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const visitor = await prisma.visitor.findUnique({
    where: { id: params.id },
  });

  if (!visitor) notFound();

  const name = formatVisitorName(visitor);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Visitors", href: "/visitors" },
          { label: name },
        ]}
        title={name}
        description="Visitor registration"
        action={
          <Button asChild variant="outline">
            <Link href="/visitors">Back to visitors</Link>
          </Button>
        }
      />

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-5 md:p-6">
          <div className="mx-auto flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/15 bg-primary/10 sm:mx-0">
            {visitor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={visitor.photoUrl}
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
            <h2 className="type-section text-foreground">{name}</h2>
            <p className="type-body text-muted-foreground">{visitor.purpose}</p>
            <p className="inline-flex items-center gap-2 type-body text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {visitor.phone}
            </p>
          </div>
        </div>
        <div className="border-t border-border bg-muted/50 px-5 py-3 type-caption md:px-6">
          Registered {formatDateTime(visitor.createdAt)}
        </div>
      </div>

      <SectionCard title="Visitor details">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Detail label="First name" value={visitor.firstName} />
          <Detail label="Other names" value={visitor.otherNames} />
          <Detail label="Last name" value={visitor.lastName} />
          <Detail label="Phone number" value={visitor.phone} />
          <Detail label="Email" value={visitor.email} />
          <Detail label="Purpose for coming" value={visitor.purpose} />
        </dl>
      </SectionCard>

      <DeleteVisitorAction id={visitor.id} name={name} />
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
