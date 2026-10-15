import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  action,
  footer,
  /** Removes body padding so tables can sit flush against the card edges. */
  flush = false,
  compact = false,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
  compact?: boolean;
}) {
  return (
    <section className={cn("surface flex flex-col overflow-hidden", className)}>
      {title ? (
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
            compact
              ? "px-4 py-3"
              : "px-4 pt-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6",
            flush && !compact && "pb-4 md:pb-5",
            flush && compact && "pb-3"
          )}
        >
          <div className="min-w-0">
            <h2
              className={cn(
                "text-primary",
                compact ? "text-base font-semibold" : "type-section"
              )}
            >
              {title}
            </h2>
            {description ? (
              <p className="type-caption mt-0.5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? (
            <div className="flex shrink-0 flex-wrap gap-2">{action}</div>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "flex-1",
          flush ? "" : "px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6",
          !flush && title && "pt-4 sm:pt-5",
          !flush && !title && "pt-4 sm:pt-5 md:pt-6",
          contentClassName
        )}
      >
        {children}
      </div>

      {footer ? (
        <div className="border-t border-border bg-muted/50 px-5 py-3 md:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
