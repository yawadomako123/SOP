import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold leading-none w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "border-border/50 text-muted-foreground hover:bg-accent/10 hover:text-foreground",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-xl",
      },
      size: {
        default: "px-2.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-[9px] uppercase tracking-tighter",
        lg: "px-3 py-1 text-xs uppercase tracking-widest",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
