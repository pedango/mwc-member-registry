import { UserSquare2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import {
  DataTable,
  TBody,
  THead,
  TableScroller,
  Td,
  Th,
  Tr,
} from "@/components/shared/DataTable";

export default async function AdminsPage() {
  const admins = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { members: true, logs: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Admins"
        description="People with access to this console. Accounts are provisioned by seeding, not self-service."
      />

      <SectionCard
        flush
        compact
        className="w-full max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl"
        title="Admin accounts"
        description={`${admins.length} account${admins.length === 1 ? "" : "s"}`}
      >
        {admins.length === 0 ? (
          <div className="px-5 pb-6 md:px-6">
            <EmptyState
              variant="bare"
              icon={UserSquare2}
              title="No admins found"
              description="Run the seed script to create the initial administrators."
            />
          </div>
        ) : (
          <>
          <ul className="divide-y divide-border border-t border-border md:hidden">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar name={admin.name || admin.email} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {admin.name || "Unnamed admin"}
                  </p>
                  <p className="truncate type-caption">{admin.email}</p>
                  <p className="mt-1 type-caption">
                    {admin._count.members} members · {admin._count.logs} events
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <TableScroller className="hidden border-t border-border md:block">
            <DataTable>
              <THead>
                <tr>
                  <Th>Admin</Th>
                  <Th>Members added</Th>
                  <Th>Audit events</Th>
                </tr>
              </THead>
              <TBody>
                {admins.map((admin) => (
                  <Tr key={admin.id}>
                    <Td>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={admin.name || admin.email} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {admin.name || "Unnamed admin"}
                          </p>
                          <p className="truncate type-caption">{admin.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td numeric>{admin._count.members}</Td>
                    <Td numeric>{admin._count.logs}</Td>
                  </Tr>
                ))}
              </TBody>
            </DataTable>
          </TableScroller>
          </>
        )}
      </SectionCard>
    </>
  );
}
