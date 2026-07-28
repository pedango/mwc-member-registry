import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
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

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { otherNames: { contains: q, mode: "insensitive" as const } },
          { contact: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

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
      <PageHeader
        title="Members"
        description="Search, view, and manage church member records"
        action={
          <Button asChild>
            <Link href="/members/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add member
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TableSkeleton />}>
        <MembersTable
          members={members.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      </Suspense>
    </>
  );
}
