import Link from "next/link";
import { LogType } from "@prisma/client";
import { FileDown, FileSpreadsheet, LogIn, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatDateTime } from "@/lib/utils";
import { AUDIT_LABELS, describeAuditTarget } from "@/lib/audit-format";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { Pagination } from "@/components/shared/Pagination";
import {
  DataTable,
  TBody,
  THead,
  TableScroller,
  Td,
  Th,
  Tr,
} from "@/components/shared/DataTable";

const LOG_ICONS: Record<LogType, LucideIcon> = {
  LOGIN: LogIn,
  EXPORT_SINGLE: FileDown,
  EXPORT_BULK: FileSpreadsheet,
};

const FILTERS = [
  { label: "All activity", value: "" },
  { label: "Logins", value: "LOGIN" },
  { label: "Single exports", value: "EXPORT_SINGLE" },
  { label: "Bulk exports", value: "EXPORT_BULK" },
];

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { type?: string; page?: string };
}) {
  const type =
    searchParams.type &&
    Object.values(LogType).includes(searchParams.type as LogType)
      ? (searchParams.type as LogType)
      : undefined;
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 20;
  const where = type ? { type } : {};

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/logs?${query}` : "/logs";
  };

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="An immutable record of administrator logins and data exports"
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (type ?? "") === filter.value;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/logs?type=${filter.value}` : "/logs"}
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-caption font-medium transition-ui",
                active
                  ? "border-primary bg-primary text-primary-foreground ring-2 ring-gold/50 ring-offset-2 ring-offset-background"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <SectionCard
        flush
        title="Activity"
        description={`${total} recorded event${total === 1 ? "" : "s"}`}
      >
        {logs.length === 0 ? (
          <div className="px-5 pb-6 md:px-6">
            <EmptyState
              variant="bare"
              icon={ScrollText}
              title="Nothing logged yet"
              description="Logins and exports will show up here as admins use the system."
            />
          </div>
        ) : (
          <>
            <TableScroller className="border-t border-border">
              <DataTable minWidth={720}>
                <THead>
                  <tr>
                    <Th>Event</Th>
                    <Th>Administrator</Th>
                    <Th>Details</Th>
                    <Th align="right">When</Th>
                  </tr>
                </THead>
                <TBody>
                  {logs.map((log) => {
                    const Icon = LOG_ICONS[log.type];
                    const who = log.user.name || log.user.email;
                    return (
                      <Tr key={log.id}>
                        <Td>
                          <span className="inline-flex items-center gap-2.5 font-medium text-foreground">
                            <span
                              className={cn(
                                "rounded-xl p-1.5",
                                log.type === "LOGIN"
                                  ? "bg-info-soft text-info-soft-fg"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            {AUDIT_LABELS[log.type]}
                          </span>
                        </Td>
                        <Td>
                          <span className="inline-flex items-center gap-2.5">
                            <Avatar name={who} size="sm" />
                            <span className="truncate">{who}</span>
                          </span>
                        </Td>
                        <Td muted>
                          {describeAuditTarget(log.type, log.targetInfo)}
                        </Td>
                        <Td align="right" numeric muted>
                          {formatDateTime(log.createdAt)}
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
                pageSize={pageSize}
                total={total}
                hrefFor={hrefFor}
              />
            </div>
          </>
        )}
      </SectionCard>
    </>
  );
}
