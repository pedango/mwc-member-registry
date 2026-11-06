import { TableSkeleton } from "@/components/shared/Skeleton";
import { Skeleton } from "@/components/shared/Skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-36" />
      <TableSkeleton rows={8} />
    </div>
  );
}
