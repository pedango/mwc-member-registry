import Link from "next/link";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Rendered above the title; spacing is owned by the header. */
  breadcrumbs?: Crumb[];
  /** Renders a short gold rule under the title — reserve for the landing page. */
  accent?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  accent = false,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="type-title text-mwc-blue">{title}</h1>
          {accent ? (
            <span
              className="block h-1 w-12 rounded-full bg-mwc-gold"
              aria-hidden="true"
            />
          ) : null}
          {description ? (
            <p className="type-body max-w-2xl text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 type-caption">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <span className="text-mwc-border" aria-hidden="true">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded transition-ui hover:text-mwc-blue focus-visible:text-mwc-blue"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast && "font-semibold text-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
