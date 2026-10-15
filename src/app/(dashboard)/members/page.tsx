import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { memberDirectoryWhere } from "@/lib/member-search";
import { Button } from "@/components/ui/button";
import { MembersTable } from "@/components/members/MembersTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/Skeleton";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 10;

  const where = memberDirectoryWhere(q);

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return (
    <>
      <PageHeader title="Members" />

      <Suspense fallback={<TableSkeleton />}>
        <MembersTable
          members={members.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
          total={total}
          page={page}
          pageSize={pageSize}
          action={
            <Button asChild>
              <Link href="/members/new">Add member</Link>
            </Button>
          }
        />
      </Suspense>
    </>
  );
}
