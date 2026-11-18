import type { Prisma } from "@prisma/client";
import { Handshake, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseServiceDateParam } from "@/lib/attendance";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { VisitorQr } from "@/components/visitors/VisitorQr";
import { VisitorsTable } from "./visitors-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function visitorSearchWhere(q: string): Prisma.VisitorWhereInput {
  const term = q.trim();
  if (!term) return {};
  return {
    OR: [
      { firstName: { contains: term, mode: "insensitive" } },
      { otherNames: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { purpose: { contains: term, mode: "insensitive" } },
    ],
  };
}

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page || 1));
  const where = visitorSearchWhere(q);
  const todayStart = parseServiceDateParam();
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  const [total, todayCount, weekCount, allCount, visitors] = await Promise.all([
    prisma.visitor.count({ where }),
    prisma.visitor.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.visitor.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.visitor.count(),
    prisma.visitor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Visitors"
        description="Display the QR code at the door. Guests scan it, fill the welcome form, and appear in this list."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          accent="gold"
          label="Today"
          value={todayCount}
          subtext="Registered today"
          icon={Handshake}
        />
        <StatCard
          label="Last 7 days"
          value={weekCount}
          icon={Users}
        />
        <StatCard label="All visitors" value={allCount} icon={Users} />
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-5">
        <SectionCard
          className="2xl:col-span-2"
          title="Visitor QR code"
          description="Guests scan this to open the welcome form on their phone."
        >
          <VisitorQr />
        </SectionCard>

        <SectionCard
          flush
          className="2xl:col-span-3"
          title="Visitor records"
          description={`${total} visitor${total === 1 ? "" : "s"}`}
        >
          <div className="px-5 pb-5 md:px-6">
            <VisitorsTable
              visitors={visitors.map((visitor) => ({
                ...visitor,
                createdAt: visitor.createdAt.toISOString(),
              }))}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
            />
          </div>
        </SectionCard>
      </div>
    </>
  );
}
