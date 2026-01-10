"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
        },
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border",
          success: "group-[.toaster]:bg-emerald-500/10 group-[.toaster]:text-emerald-400 group-[.toaster]:border group-[.toaster]:border-emerald-500/20",
          error: "group-[.toaster]:bg-red-500/10 group-[.toaster]:text-red-400 group-[.toaster]:border group-[.toaster]:border-red-500/20",
          warning: "group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-amber-400 group-[.toaster]:border group-[.toaster]:border-amber-500/20",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:text-blue-400 group-[.toaster]:border group-[.toaster]:border-blue-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
