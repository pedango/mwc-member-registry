import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  FileDown,
  FileSpreadsheet,
  LogIn,
  ScrollText,
  UserCheck,
  Users,
  UserSquare2,
  type LucideIcon,
} from "lucide-react";
import type { LogType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCachedCount, setCachedCount } from "@/lib/redis";
import { AUDIT_LABELS, describeAuditTarget } from "@/lib/audit-format";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { Numeric } from "@/components/shared/Numeric";
import { Button } from "@/components/ui/button";

async function getMemberCount() {
  const cached = await getCachedCount("member:count");
  if (cached !== null) return cached;
  const count = await prisma.member.count();
  await setCachedCount("member:count", count);
  return count;
}

const LOG_ICONS: Record<LogType, LucideIcon> = {
  LOGIN: LogIn,
  EXPORT_SINGLE: FileDown,
  EXPORT_BULK: FileSpreadsheet,
};

const QUICK_ACTIONS: Array<{
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}> = [
  {
    href: "/members",
    label: "Browse members",
    hint: "Search & edit",
    icon: Users,
  },
  {
    href: "/attendance",
    label: "Sunday attendance",
    hint: "QR check-in list",
    icon: CalendarCheck,
  },
  {
    href: "/bulk",
    label: "Bulk import",
    hint: "Upload a sheet",
    icon: FileSpreadsheet,
  },
  {
    href: "/assemblies",
    label: "Assemblies",
    hint: "English & Local",
    icon: Building2,
  },
  {
    href: "/users",
    label: "System users",
    hint: "Admin accounts",
    icon: UserSquare2,
  },
];

export default async function DashboardPage() {
  const [totalMembers, englishCount, localCount, officerCount, recentLogs] =
    await Promise.all([
      getMemberCount(),
      prisma.member.count({ where: { assembly: "ENGLISH" } }),
      prisma.member.count({ where: { assembly: "LOCAL" } }),
      prisma.member.count({ where: { status: "OFFICER" } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const share = (count: number) =>
    totalMembers > 0
      ? `${Math.round((count / totalMembers) * 100)}% of members`
      : "No members yet";

  return (
    <>
      <PageHeader
        accent
        title="Dashboard"
        description="Overview of membership records at Mamprobi Worship Center"
        action={
          <Button asChild>
            <Link href="/members/new">Add member</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="gold"
          label="Total members"
          value={totalMembers}
          subtext="Across both assemblies"
          icon={Users}
          href="/members"
        />
        <StatCard
          label="English Assembly"
          value={englishCount}
          subtext={share(englishCount)}
          icon={Building2}
          href="/assemblies?assembly=ENGLISH"
        />
        <StatCard
          label="Local Assembly"
          value={localCount}
          subtext={share(localCount)}
          icon={Building2}
          href="/assemblies?assembly=LOCAL"
        />
        <StatCard
          label="Officers"
          value={officerCount}
          subtext={share(officerCount)}
          icon={UserCheck}
          href="/members"
        />
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-3"
          title="Recent activity"
          description="Latest logins and exports"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/logs">
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                View logs
              </Link>
            </Button>
          }
        >
          {recentLogs.length === 0 ? (
            <p className="type-body text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentLogs.map((log) => {
                const Icon = LOG_ICONS[log.type];
                return (
                  <li
                    key={log.id}
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-ui hover:bg-muted/70"
                  >
                    <span
                      className={
                        log.type === "LOGIN"
                          ? "shrink-0 rounded-xl bg-info-soft p-2 text-info-soft-fg"
                          : "shrink-0 rounded-xl bg-primary/10 p-2 text-primary"
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {AUDIT_LABELS[log.type]}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {log.user.name || log.user.email}
                        </span>
                      </p>
                      <p className="truncate type-caption">
                        {describeAuditTarget(log.type, log.targetInfo)}
                      </p>
                    </div>

                    <Numeric className="shrink-0 type-caption text-right">
                      {formatDateTime(log.createdAt)}
                    </Numeric>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          className="lg:col-span-2"
          title="Quick actions"
          description="Common admin tasks"
          contentClassName="flex flex-col gap-3"
        >
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-ui hover:-translate-y-px hover:border-primary/30 hover:bg-card hover:shadow-md"
                >
                  <span className="w-fit rounded-xl bg-card p-2 text-primary shadow-sm transition-ui group-hover:bg-primary/10">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {action.label}
                    </span>
                    <span className="block type-caption">{action.hint}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <a
            href="/api/members/template"
            className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 transition-ui hover:border-primary/40 hover:bg-muted/50"
          >
            <FileDown
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                Download import template
              </span>
              <span className="block type-caption">
                Spreadsheet with all member columns
              </span>
            </span>
          </a>
        </SectionCard>
      </div>
    </>
  );
}
