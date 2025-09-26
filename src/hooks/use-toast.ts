"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "destructive"

interface Toast {
  title: string
  description?: string
  variant?: ToastVariant
}

export const useToast = () => {
  const toast = React.useCallback(({ title, description, variant }: Toast) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description
      })
    } else {
      sonnerToast.success(title, {
        description
      })
    }
  }, [])

  return { toast }
}