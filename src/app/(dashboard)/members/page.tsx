import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { memberDirectoryWhere } from "@/lib/member-search";
import {
  MEMBER_LIST_ORDER_BY,
  MEMBER_LIST_PAGE_SIZE,
  MEMBER_LIST_SELECT,
} from "@/lib/member-list";
import { Button } from "@/components/ui/button";
import { MembersTable } from "@/components/members/MembersTable";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = MEMBER_LIST_PAGE_SIZE;
  const where = memberDirectoryWhere(q);

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      orderBy: [...MEMBER_LIST_ORDER_BY],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: MEMBER_LIST_SELECT,
    }),
  ]);

  return (
    <>
      <PageHeader title="Members" />

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
    </>
  );
}
