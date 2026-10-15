import { cn } from "@/lib/utils";

/**
 * Horizontal scroll lives here so tables never nest a second vertical
 * scrollbar inside the page scroller.
 */
export function TableScroller({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DataTable({
  children,
  minWidth,
  className,
}: {
  children: React.ReactNode;
  minWidth?: number;
  className?: string;
}) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-sm", className)}
      style={minWidth ? { minWidth } : undefined}
    >
      {children}
    </table>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 border-b border-border bg-muted/80 backdrop-blur-sm">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "bg-card transition-ui hover:bg-muted/60",
        className
      )}
    >
      {children}
    </tr>
  );
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function Th({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: keyof typeof alignClass;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-3 py-2.5 text-caption font-semibold uppercase tracking-wide text-muted-foreground sm:px-4",
        alignClass[align],
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  numeric = false,
  muted = false,
  className,
}: {
  children: React.ReactNode;
  align?: keyof typeof alignClass;
  numeric?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 align-middle sm:px-4",
        alignClass[align],
        numeric && "numeric tabular-nums",
        muted && "text-muted-foreground",
        className
      )}
    >
      {children}
    </td>
  );
}
