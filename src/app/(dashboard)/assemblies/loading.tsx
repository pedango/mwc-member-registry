import { Skeleton, TableSkeleton } from "@/components/shared/Skeleton";

export default function AssembliesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}
