import { cn, initials } from "@/lib/utils";

const SIZES = {
  sm: "h-8 w-8 text-[0.6875rem]",
  md: "h-10 w-10 text-caption",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mwc-blue/10 font-semibold uppercase text-mwc-blue ring-1 ring-inset ring-mwc-blue/10",
        SIZES[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
