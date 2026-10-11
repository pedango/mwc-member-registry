import Link from "next/link";
import { CalendarCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  formatServiceDateLong,
  parseServiceDateParam,
  serviceDateIso,
} from "@/lib/attendance";
import { formatDateTime, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { StatCard } from "@/components/shared/StatCard";
import { AssemblyBadge } from "@/components/ui/badge";
import { Numeric } from "@/components/shared/Numeric";
import { CheckInQr } from "@/components/attendance/CheckInQr";
import {
  DataTable,
  TBody,
  THead,
  TableScroller,
  Td,
  Th,
  Tr,
} from "@/components/shared/DataTable";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const serviceDate = parseServiceDateParam(searchParams.date);
  const iso = serviceDateIso(serviceDate);

  const records = await prisma.attendance.findMany({
    where: { serviceDate },
    orderBy: { checkedInAt: "desc" },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          otherNames: true,
          assembly: true,
          photoUrl: true,
        },
      },
    },
  });

  const englishCount = records.filter((row) => row.member.assembly === "ENGLISH").length;
  const localCount = records.filter((row) => row.member.assembly === "LOCAL").length;

  return (
    <>
      <PageHeader
        title="Sunday attendance"
        description={`Members who checked in for ${formatServiceDateLong(serviceDate)}. Print the QR once and reuse it every Sunday.`}
      />

      <form className="flex flex-wrap items-end gap-3">
        <label className="space-y-1.5">
          <span className="label-caps block">Service date</span>
          <input
            type="date"
            name="date"
            defaultValue={iso}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm shadow-sm"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          View
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          accent="gold"
          label="Present"
          value={records.length}
          subtext={formatServiceDateLong(serviceDate)}
          icon={CalendarCheck}
        />
        <StatCard
          label="English Assembly"
          value={englishCount}
          icon={Users}
        />
        <StatCard
          label="Local Assembly"
          value={localCount}
          icon={Users}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-2"
          title="Door QR code"
          description="Members scan this to open the check-in form on their phone."
        >
          <CheckInQr />
        </SectionCard>

        <SectionCard
          flush
          className="lg:col-span-3"
          title="Checked in"
          description={`${records.length} member${records.length === 1 ? "" : "s"}`}
        >
          {records.length === 0 ? (
            <div className="px-5 pb-6 md:px-6">
              <EmptyState
                variant="bare"
                icon={CalendarCheck}
                title="No check-ins yet"
                description="When members scan the QR and confirm their name, they will appear here."
              />
            </div>
          ) : (
            <TableScroller className="border-t border-border">
              <DataTable minWidth={520}>
                <THead>
                  <tr>
                    <Th>Member</Th>
                    <Th>Assembly</Th>
                    <Th>Checked in</Th>
                  </tr>
                </THead>
                <TBody>
                  {records.map((row) => {
                    const name = fullName(row.member);
                    return (
                      <Tr key={row.id}>
                        <Td>
                          <Link
                            href={`/members/${row.member.id}`}
                            className="inline-flex items-center gap-3"
                          >
                            <Avatar src={row.member.photoUrl} name={name} size="sm" />
                            <span className="font-medium text-foreground">{name}</span>
                          </Link>
                        </Td>
                        <Td>
                          <AssemblyBadge assembly={row.member.assembly} />
                        </Td>
                        <Td muted>
                          <Numeric>{formatDateTime(row.checkedInAt)}</Numeric>
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </DataTable>
            </TableScroller>
          )}
        </SectionCard>
      </div>
    </>
  );
}
