import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  /** `bare` drops the dashed frame — use when already inside a card. */
  variant = "card",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "card" | "bare";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        variant === "card" &&
          "rounded-xl border border-dashed border-mwc-border bg-white",
        className
      )}
    >
      {Icon ? (
        <span className="mb-4 rounded-full bg-mwc-blue/10 p-3 text-mwc-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="type-body mt-1.5 max-w-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
