"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon aria-hidden="true" className="size-4" />,
        info: <InfoIcon aria-hidden="true" className="size-4" />,
        warning: <TriangleAlertIcon aria-hidden="true" className="size-4" />,
        error: <OctagonXIcon aria-hidden="true" className="size-4" />,
        loading: <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "border border-white/10 bg-slate-950 text-white shadow-2xl",
          title: "text-sm font-medium",
          description: "text-sm text-slate-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
