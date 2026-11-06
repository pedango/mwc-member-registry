import { cn, initials } from "@/lib/utils";
import { cloudinaryThumbUrl } from "@/lib/cloudinary-url";

const SIZES = {
  sm: "h-8 w-8 text-[0.6875rem]",
  md: "h-10 w-10 text-caption",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
} as const;

const THUMB_PX = {
  sm: 64,
  md: 80,
  lg: 112,
  xl: 192,
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
  const thumb = cloudinaryThumbUrl(src, THUMB_PX[size]);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold uppercase leading-none text-primary ring-1 ring-inset ring-primary/10",
        SIZES[size],
        className
      )}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
