import { cn } from "@/lib/utils";

type NumericProps = React.HTMLAttributes<HTMLElement> & {
  as?: "span" | "p" | "div";
  children: React.ReactNode;
};

/** Renders values with tabular figures so columns and stats line up. */
export function Numeric({
  as: Comp = "span",
  className,
  children,
  ...props
}: NumericProps) {
  return (
    <Comp className={cn("numeric tabular-nums", className)} {...props}>
      {children}
    </Comp>
  );
}
