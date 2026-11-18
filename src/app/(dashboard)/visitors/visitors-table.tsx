"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleUser, Handshake, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { Pagination } from "@/components/shared/Pagination";
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
import { formatDateTime, formatVisitorName } from "@/lib/utils";
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

type VisitorRow = {
  id: string;
  firstName: string;
  otherNames?: string | null;
  lastName: string;
  phone: string;
  email?: string | null;
  purpose: string;
  photoUrl?: string | null;
  createdAt: string;
};

export function VisitorsTable({
  visitors,
  total,
  page,
  pageSize,
}: {
  visitors: VisitorRow[];
  total: number;
  page: number;
  pageSize: number;
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
    router.push(query ? `/visitors?${query}` : "/visitors");
  }

  async function deleteVisitor(id: string, name: string) {
    const res = await fetch(`/api/visitors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to delete visitor");
      return;
    }
    toast.success(`${name} deleted`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form
        className="flex min-w-0 w-full items-center gap-2"
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
            placeholder="Search by name, phone, email, or purpose"
            className="pl-9 pr-9"
            aria-label="Search visitors"
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
        <p className="type-caption">
          <span className="numeric tabular-nums">{total}</span> result
          {total === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{q}&rdquo;
          </span>
        </p>
      ) : null}

      {visitors.length === 0 ? (
        <EmptyState
          variant="bare"
          icon={Handshake}
          title={q ? "No visitors match your search" : "No visitors yet"}
          description={
            q
              ? "Try a different name, phone, email, or purpose."
              : "When guests scan the QR code and submit the welcome form, they will appear here."
          }
          action={
            q ? (
              <Button
                variant="outline"
                onClick={() => updateQuery({ q: null, page: null })}
              >
                Clear search
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden">
          <ul className="divide-y divide-border border-t border-border md:hidden">
            {visitors.map((visitor) => {
              const name = formatVisitorName(visitor);
              return (
                <li key={visitor.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/visitors/${visitor.id}`} className="shrink-0">
                      <Avatar src={visitor.photoUrl} name={name} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/visitors/${visitor.id}`}
                        className="block truncate font-medium text-foreground"
                      >
                        {name}
                      </Link>
                      <p className="mt-0.5 truncate type-caption">
                        {visitor.phone}
                      </p>
                      <p className="mt-0.5 truncate type-caption">
                        {visitor.purpose}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        aria-label={`View ${name}`}
                      >
                        <Link href={`/visitors/${visitor.id}`}>
                          <CircleUser className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteVisitorButton
                        name={name}
                        onConfirm={() => deleteVisitor(visitor.id, name)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <TableScroller className="hidden border-t border-border md:block">
            <DataTable>
              <THead>
                <tr>
                  <Th align="center">Visitor</Th>
                  <Th align="center">Phone</Th>
                  <Th align="center" className="hidden lg:table-cell">
                    Purpose
                  </Th>
                  <Th align="center">Arrived</Th>
                  <Th align="center">Actions</Th>
                </tr>
              </THead>
              <TBody>
                {visitors.map((visitor) => {
                  const name = formatVisitorName(visitor);
                  return (
                    <Tr key={visitor.id}>
                      <Td>
                        <Link
                          href={`/visitors/${visitor.id}`}
                          className="inline-flex max-w-full items-center gap-3"
                        >
                          <Avatar src={visitor.photoUrl} name={name} size="sm" />
                          <span className="truncate font-medium leading-none text-foreground">
                            {name}
                          </span>
                        </Link>
                      </Td>
                      <Td align="center" muted>
                        {visitor.phone}
                      </Td>
                      <Td
                        align="center"
                        muted
                        className="hidden lg:table-cell"
                      >
                        {visitor.purpose}
                      </Td>
                      <Td align="center" muted>
                        <Numeric>{formatDateTime(visitor.createdAt)}</Numeric>
                      </Td>
                      <Td align="center">
                        <div className="inline-flex justify-center gap-0.5">
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            aria-label={`View ${name}`}
                          >
                            <Link href={`/visitors/${visitor.id}`}>
                              <CircleUser className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteVisitorButton
                            name={name}
                            onConfirm={() => deleteVisitor(visitor.id, name)}
                          />
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

function DeleteVisitorButton({
  name,
  onConfirm,
}: {
  name: string;
  onConfirm: () => void;
}) {
  return (
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
            This can&apos;t be undone. The visitor record will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
