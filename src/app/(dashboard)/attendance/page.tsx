import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  formatServiceDateLong,
  parseServiceDateParam,
  serviceDateIso,
} from "@/lib/attendance";
import { formatTime, fullName } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { StatCard } from "@/components/shared/StatCard";
import { Pagination } from "@/components/shared/Pagination";
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

const PAGE_SIZE = 50;

const attendanceSelect = {
  id: true,
  checkedInAt: true,
  assembly: true,
  member: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      otherNames: true,
      photoUrl: true,
    },
  },
} satisfies Prisma.AttendanceSelect;

type AttendanceRecord = Prisma.AttendanceGetPayload<{
  select: typeof attendanceSelect;
}>;

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string; page?: string };
}) {
  const serviceDate = parseServiceDateParam(searchParams.date);
  const iso = serviceDateIso(serviceDate);
  const page = Math.max(1, Number(searchParams.page || 1));
  const where = { serviceDate };

  const [total, englishCount, localCount, records] = (await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.count({ where: { ...where, assembly: "ENGLISH" } }),
    prisma.attendance.count({ where: { ...where, assembly: "LOCAL" } }),
    prisma.attendance.findMany({
      where,
      orderBy: { checkedInAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: attendanceSelect,
    }),
  ])) as [
    number,
    number,
    number,
    AttendanceRecord[],
  ];

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("date", iso);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/attendance?${params.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Sunday attendance"
        description={`Recorded attendance for ${formatServiceDateLong(serviceDate)}`}
        className="sm:items-center"
        action={
          <form className="flex w-full flex-col gap-2 min-[480px]:flex-row min-[480px]:items-center sm:w-auto">
            <label className="flex min-w-0 w-full items-center gap-2 min-[480px]:w-auto">
              <span className="label-caps whitespace-nowrap">Select date</span>
              <input
                type="date"
                name="date"
                defaultValue={iso}
                className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm shadow-sm min-[480px]:w-auto min-[480px]:flex-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground min-[480px]:w-auto"
            >
              View
            </button>
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          accent="gold"
          label="Present"
          value={total}
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

      <div className="grid items-start gap-4 2xl:grid-cols-5">
        <SectionCard
          className="2xl:col-span-2"
          title="Door QR code"
          description="Members scan this to open the attendance form on their phone."
        >
          <CheckInQr />
        </SectionCard>

        <SectionCard
          flush
          className="2xl:col-span-3"
          title="Recorded Attendance"
          description={`${total} member${total === 1 ? "" : "s"}`}
        >
          {total === 0 ? (
            <div className="px-5 pb-6 md:px-6">
              <EmptyState
                variant="bare"
                icon={CalendarCheck}
                title="No attendance recorded yet"
                description="When members scan the QR and confirm their name, they will appear here."
              />
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border border-t border-border md:hidden">
                {records.map((row) => {
                  const name = fullName(row.member);
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/members/${row.member.id}`}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Avatar
                          src={row.member.photoUrl}
                          name={name}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">
                            {name}
                          </span>
                          <span className="mt-1 inline-flex">
                            <AssemblyBadge assembly={row.assembly} />
                          </span>
                        </span>
                        <Numeric className="shrink-0 type-caption">
                          {formatTime(row.checkedInAt)}
                        </Numeric>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <TableScroller className="hidden border-t border-border md:block">
                <DataTable>
                  <THead>
                    <tr>
                      <Th align="center">Member</Th>
                      <Th align="center">Assembly</Th>
                      <Th align="center">Time</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {records.map((row) => {
                      const name = fullName(row.member);
                      return (
                        <Tr key={row.id}>
                          <Td align="center">
                            <Link
                              href={`/members/${row.member.id}`}
                              className="inline-flex max-w-full items-center justify-center gap-3"
                            >
                              <Avatar
                                src={row.member.photoUrl}
                                name={name}
                                size="sm"
                              />
                              <span className="truncate font-medium leading-none text-foreground">
                                {name}
                              </span>
                            </Link>
                          </Td>
                          <Td align="center">
                            <AssemblyBadge assembly={row.assembly} />
                          </Td>
                          <Td align="center" muted>
                            <Numeric>{formatTime(row.checkedInAt)}</Numeric>
                          </Td>
                        </Tr>
                      );
                    })}
                  </TBody>
                </DataTable>
              </TableScroller>
              <div className="border-t border-border bg-muted/50 px-5 py-3 md:px-6">
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  hrefFor={hrefFor}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </>
  );
}
