import Link from "next/link";
import { Building2, Check, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, fullName } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { Numeric } from "@/components/shared/Numeric";
import {
  DataTable,
  TBody,
  THead,
  TableScroller,
  Td,
  Th,
  Tr,
} from "@/components/shared/DataTable";

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: { assembly?: string };
}) {
  const selected =
    searchParams.assembly === "LOCAL" || searchParams.assembly === "ENGLISH"
      ? searchParams.assembly
      : null;

  const [englishCount, localCount, members] = await Promise.all([
    prisma.member.count({ where: { assembly: "ENGLISH" } }),
    prisma.member.count({ where: { assembly: "LOCAL" } }),
    selected
      ? prisma.member.findMany({
          where: { assembly: selected },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  const total = englishCount + localCount;
  const assemblies = [
    { key: "ENGLISH", label: "English Assembly", count: englishCount },
    { key: "LOCAL", label: "Local Assembly", count: localCount },
  ] as const;

  return (
    <>
      <PageHeader
        title="Assemblies"
        description="Choose an assembly to see its membership roll"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {assemblies.map((item) => {
          const isSelected = selected === item.key;
          const share =
            total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <Link
              key={item.key}
              href={isSelected ? "/assemblies" : `/assemblies?assembly=${item.key}`}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "group flex items-start justify-between gap-4 p-5 transition-ui",
                isSelected
                  ? "surface border-primary ring-1 ring-primary"
                  : "surface-interactive"
              )}
            >
              <div className="min-w-0">
                <p className="label-caps">{item.label}</p>
                <Numeric
                  as="p"
                  className="mt-2 text-4xl font-bold leading-none tracking-tight text-foreground"
                >
                  {item.count}
                </Numeric>
                <p className="mt-2 type-caption">
                  {total > 0
                    ? `${share}% of all members`
                    : "No members recorded yet"}
                </p>
              </div>

              <span
                className={cn(
                  "rounded-xl p-2 transition-ui",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </Link>
          );
        })}
      </div>

      {selected ? (
        <SectionCard
          flush
          title={`${
            selected === "ENGLISH" ? "English" : "Local"
          } Assembly roll`}
          description={`${members.length} member${
            members.length === 1 ? "" : "s"
          } in this assembly`}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/assemblies">Clear selection</Link>
            </Button>
          }
        >
          {members.length === 0 ? (
            <div className="px-5 pb-6 md:px-6">
              <EmptyState
                variant="bare"
                icon={Users}
                title="No members in this assembly"
                description="Add a member and assign them to this assembly."
                action={
                  <Button asChild>
                    <Link href="/members/new">Add member</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <TableScroller className="border-t border-border">
              <DataTable minWidth={560}>
                <THead>
                  <tr>
                    <Th>Member</Th>
                    <Th>Contact</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </THead>
                <TBody>
                  {members.map((m) => {
                    const name = fullName(m);
                    return (
                      <Tr key={m.id}>
                        <Td>
                          <Link
                            href={`/members/${m.id}`}
                            className="flex items-center gap-3 rounded-md"
                          >
                            <Avatar src={m.photoUrl} name={name} size="sm" />
                            <span className="font-medium text-foreground">
                              {name}
                            </span>
                          </Link>
                        </Td>
                        <Td muted>{m.contact || "—"}</Td>
                        <Td align="right">
                          <StatusBadge status={m.status} />
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </DataTable>
            </TableScroller>
          )}
        </SectionCard>
      ) : (
        <EmptyState
          icon={Building2}
          title="Select an assembly"
          description="Pick English or Local above to view that assembly's members."
        />
      )}
    </>
  );
}
