import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Server-rendered pagination. */
  hrefFor?: (page: number) => string;
  /** Client-rendered pagination. */
  onPageChange?: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between",
        className
      )}
    >
      <p className="numeric type-caption tabular-nums">
        Showing {first}–{last} of {total}
      </p>

      <div className="flex items-center gap-2">
        <PageButton
          label="Previous"
          icon="left"
          targetPage={page - 1}
          disabled={page <= 1}
          hrefFor={hrefFor}
          onPageChange={onPageChange}
        />
        <span className="numeric px-1 type-caption tabular-nums">
          Page {page} of {totalPages}
        </span>
        <PageButton
          label="Next"
          icon="right"
          targetPage={page + 1}
          disabled={page >= totalPages}
          hrefFor={hrefFor}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function PageButton({
  label,
  icon,
  targetPage,
  disabled,
  hrefFor,
  onPageChange,
}: {
  label: string;
  icon: "left" | "right";
  targetPage: number;
  disabled: boolean;
  hrefFor?: (page: number) => string;
  onPageChange?: (page: number) => void;
}) {
  const Icon = icon === "left" ? ChevronLeft : ChevronRight;
  const content = (
    <>
      {icon === "left" ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      <span className="hidden sm:inline">{label}</span>
      {icon === "right" ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
    </>
  );

  // An anchor ignores `disabled`, so out-of-range steps render as real buttons.
  if (disabled || !hrefFor) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={disabled ? undefined : () => onPageChange?.(targetPage)}
        aria-label={label}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={hrefFor(targetPage)} aria-label={label}>
        {content}
      </Link>
    </Button>
  );
}
