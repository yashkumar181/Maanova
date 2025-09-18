"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

// A simple container to wrap charts and provide consistent styling.
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-y-4", className)} {...props} />
))
ChartContainer.displayName = "ChartContainer"


// A simple, unstyled component to satisfy the ChartConfig import.
// We are not using it, but it prevents an error.
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    color?: string
    icon?: React.ComponentType
  }
}

export { ChartContainer }
export type { ChartConfig }