import { Skeleton, StatSkeleton, TableSkeleton } from "@/components/shared/Skeleton";

export default function AttendanceLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-44" />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
