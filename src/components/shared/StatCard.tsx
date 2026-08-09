import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Numeric } from "@/components/shared/Numeric";

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  accent = "default",
  className,
}: {
  label: string;
  value: number | string;
  subtext?: string;
  icon?: LucideIcon;
  href?: string;
  /** `gold` highlights a single primary metric — use once per screen. */
  accent?: "default" | "gold";
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "h-full border-t-2 p-6",
        href ? "surface-interactive" : "surface",
        accent === "gold"
          ? "border-t-gold bg-gradient-to-br from-card to-gold/10"
          : "border-t-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="label-caps">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "rounded-xl p-2.5",
              accent === "gold"
                ? "bg-gold-soft text-gold-soft-fg"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <Numeric
        as="p"
        className="mt-3 text-4xl font-bold leading-none tracking-tight text-foreground"
      >
        {value}
      </Numeric>

      {subtext ? <p className="mt-2 type-caption">{subtext}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
