import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        gold: "border-mwc-gold/40 bg-mwc-gold/20 text-[#7A5300]",
        neutral: "border-mwc-border bg-mwc-surface text-muted-foreground",
        outline: "border-mwc-border bg-white text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        destructive: "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Member status has one meaning across the app: officers are highlighted. */
export function StatusBadge({ status }: { status: string }) {
  const isOfficer = status === "OFFICER";
  return (
    <Badge variant={isOfficer ? "gold" : "neutral"}>
      {isOfficer ? "Officer" : "Member"}
    </Badge>
  );
}

export function AssemblyBadge({ assembly }: { assembly: string }) {
  return (
    <Badge variant="outline">
      {assembly === "ENGLISH" ? "English" : "Local"}
    </Badge>
  );
}

export { Badge, badgeVariants };
