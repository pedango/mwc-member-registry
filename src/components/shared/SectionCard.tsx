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
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={cn("surface flex flex-col overflow-hidden", className)}>
      {title ? (
        <div
          className={cn(
            "flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between md:px-6 md:pt-6",
            flush && "pb-5 md:pb-6"
          )}
        >
          <div className="min-w-0">
            <h2 className="type-section text-mwc-blue">{title}</h2>
            {description ? (
              <p className="type-body mt-1 text-muted-foreground">
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
          flush ? "" : "px-5 pb-5 md:px-6 md:pb-6",
          !flush && title && "pt-5",
          !flush && !title && "pt-5 md:pt-6",
          contentClassName
        )}
      >
        {children}
      </div>

      {footer ? (
        <div className="border-t border-mwc-border bg-mwc-surface/60 px-5 py-3 md:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
