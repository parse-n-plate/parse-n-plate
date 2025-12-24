"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
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
          maxWidth: '400px',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        },
        classNames: {
          toast: 'sonner-toast',
          title: 'sonner-toast-title',
          description: 'sonner-toast-description',
          actionButton: 'sonner-toast-action-button',
          cancelButton: 'sonner-toast-cancel-button',
          closeButton: 'sonner-toast-close-button',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
