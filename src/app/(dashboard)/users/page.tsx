import { UserSquare2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
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

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { members: true, logs: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="System users"
        description="Administrators with access to this console. Accounts are provisioned by seeding, not self-service."
      />

      <SectionCard
        flush
        title="Administrators"
        description={`${users.length} account${users.length === 1 ? "" : "s"}`}
      >
        {users.length === 0 ? (
          <div className="px-5 pb-6 md:px-6">
            <EmptyState
              variant="bare"
              icon={UserSquare2}
              title="No users found"
              description="Run the seed script to create the initial administrators."
            />
          </div>
        ) : (
          <TableScroller className="border-t border-mwc-border">
            <DataTable minWidth={640}>
              <THead>
                <tr>
                  <Th>Administrator</Th>
                  <Th align="right">Members added</Th>
                  <Th align="right">Audit events</Th>
                  <Th align="right">Joined</Th>
                </tr>
              </THead>
              <TBody>
                {users.map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name || u.email} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {u.name || "Unnamed admin"}
                          </p>
                          <p className="truncate type-caption">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td align="right" numeric>
                      {u._count.members}
                    </Td>
                    <Td align="right" numeric>
                      {u._count.logs}
                    </Td>
                    <Td align="right" numeric muted>
                      {formatDate(u.createdAt)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </DataTable>
          </TableScroller>
        )}
      </SectionCard>
    </>
  );
}
