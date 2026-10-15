"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleUser, Pencil, Trash2, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssemblyBadge, StatusBadge } from "@/components/ui/badge";
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
import { fullName } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  otherNames?: string | null;
  assembly: string;
  status: string;
  contact?: string | null;
  photoUrl?: string | null;
  createdAt: string;
};

export function MembersTable({
  members,
  total,
  page,
  pageSize,
  action,
}: {
  members: MemberRow[];
  total: number;
  page: number;
  pageSize: number;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  function updateQuery(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `/members?${query}` : "/members");
  }

  async function deleteMember(id: string, name: string) {
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to delete member");
      return;
    }
    toast.success(`${name} deleted`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <form
          className="flex min-w-0 w-full flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            updateQuery({ q: String(data.get("q") || "") || null, page: null });
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              key={q}
              name="q"
              defaultValue={q}
              placeholder="Search by name, contact, or location"
              className="pl-9 pr-9"
              aria-label="Search members"
            />
            {q ? (
              <button
                type="button"
                onClick={() => updateQuery({ q: null, page: null })}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-ui hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {q ? (
          <p className="type-caption sm:hidden">
            <span className="numeric tabular-nums">{total}</span> result
            {total === 1 ? "" : "s"} for{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{q}&rdquo;
            </span>
          </p>
        ) : null}

        {action ? (
          <div className="w-full shrink-0 sm:ml-auto sm:w-auto [&_a]:flex [&_a]:w-full [&_a]:justify-center sm:[&_a]:w-auto">
            {action}
          </div>
        ) : null}
      </div>

      {q ? (
        <p className="hidden type-caption sm:block">
          <span className="numeric tabular-nums">{total}</span> result
          {total === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{q}&rdquo;
          </span>
        </p>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "No members match your search" : "No members yet"}
          description={
            q
              ? "Try a different name, contact, or location — or clear the search."
              : "Add your first member to start building the church directory."
          }
          action={
            q ? (
              <Button
                variant="outline"
                onClick={() => updateQuery({ q: null, page: null })}
              >
                Clear search
              </Button>
            ) : (
              <Button asChild>
                <Link href="/members/new">Add member</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="surface overflow-hidden">
          <ul className="divide-y divide-border md:hidden">
            {members.map((m) => {
              const name = fullName(m);
              return (
                <li key={m.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/members/${m.id}`} className="shrink-0">
                      <Avatar src={m.photoUrl} name={name} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/members/${m.id}`}
                        className="block truncate font-medium text-foreground"
                      >
                        {name}
                      </Link>
                      <p className="mt-0.5 truncate type-caption">
                        {m.contact || "No contact"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <AssemblyBadge assembly={m.assembly} />
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        aria-label={`View profile for ${name}`}
                      >
                        <Link href={`/members/${m.id}`}>
                          <CircleUser className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${name}`}
                      >
                        <Link href={`/members/${m.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Delete ${name}`}
                            className="text-muted-foreground hover:bg-red-50 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This can&apos;t be undone. The member record will
                              be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMember(m.id, name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <TableScroller className="hidden md:block">
            <DataTable>
              <THead>
                <tr>
                  <Th align="center">Member</Th>
                  <Th align="center">Assembly</Th>
                  <Th align="center">Status</Th>
                  <Th align="center" className="hidden lg:table-cell">
                    Contact
                  </Th>
                  <Th align="center">Actions</Th>
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
                          className="member-cell flex min-h-10 min-w-0 items-center gap-3 rounded-md"
                        >
                          <Avatar src={m.photoUrl} name={name} size="sm" />
                          <span className="truncate font-medium leading-none text-foreground">
                            {name}
                          </span>
                        </Link>
                      </Td>
                      <Td align="center">
                        <AssemblyBadge assembly={m.assembly} />
                      </Td>
                      <Td align="center">
                        <StatusBadge status={m.status} />
                      </Td>
                      <Td align="center" muted className="hidden lg:table-cell">
                        {m.contact || "—"}
                      </Td>
                      <Td align="center">
                        <div className="inline-flex justify-center gap-0.5">
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            aria-label={`View profile for ${name}`}
                          >
                            <Link href={`/members/${m.id}`}>
                              <CircleUser className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${name}`}
                          >
                            <Link href={`/members/${m.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Delete ${name}`}
                                className="text-muted-foreground hover:bg-red-50 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete {name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This can&apos;t be undone. The member record
                                  will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteMember(m.id, name)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </DataTable>
          </TableScroller>

          <div className="border-t border-border bg-muted/50 px-4 py-3">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(next) => updateQuery({ page: String(next) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
