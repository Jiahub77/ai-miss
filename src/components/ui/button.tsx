import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-serif tracking-wide transition-[opacity,transform,background-color,color,border-color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinnabar",
  {
    variants: {
      variant: {
        solid:
          "bg-ink text-paper hover:bg-ink-soft",
        outline:
          "border border-ink/20 text-ink hover:border-ink/40 bg-transparent",
        ghost: "text-muted hover:text-ink",
        cinnabar: "bg-cinnabar text-paper hover:bg-cinnabar-soft",
      },
      size: {
        md: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
