import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        gold: "border-transparent bg-gold-soft text-gold-soft-fg",
        member:
          "border-transparent bg-primary/10 text-primary",
        neutral: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border bg-card text-foreground",
        success: "border-transparent bg-success-soft text-success-soft-fg",
        destructive:
          "border-transparent bg-destructive/10 text-destructive",
        warning: "border-transparent bg-warning-soft text-warning-soft-fg",
        info: "border-transparent bg-info-soft text-info-soft-fg",
        english: "border-transparent bg-info-soft text-info-soft-fg",
        local: "border-transparent bg-success-soft text-success-soft-fg",
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
    <Badge variant={isOfficer ? "gold" : "member"}>
      {isOfficer ? "Officer" : "Member"}
    </Badge>
  );
}

export function AssemblyBadge({ assembly }: { assembly: string }) {
  const isEnglish = assembly === "ENGLISH";
  return (
    <Badge variant={isEnglish ? "english" : "local"}>
      {isEnglish ? "English" : "Local"}
    </Badge>
  );
}

export function LogTypeBadge({
  type,
}: {
  type: "LOGIN" | "EXPORT_SINGLE" | "EXPORT_BULK" | string;
}) {
  if (type === "LOGIN") return <Badge variant="info">Login</Badge>;
  if (type === "EXPORT_BULK") return <Badge variant="warning">Bulk export</Badge>;
  return <Badge variant="success">Export</Badge>;
}

export { Badge, badgeVariants };
