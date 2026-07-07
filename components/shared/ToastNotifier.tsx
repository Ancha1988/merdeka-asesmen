"use client";

import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

export const ToastNotifier = {
  success: (message: string) => {
    toast.success(message, {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      duration: 3000,
      className: "border-green-200 bg-green-50 text-green-900",
    });
  },
  error: (message: string) => {
    toast.error(message, {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      duration: 3000,
      className: "border-red-200 bg-red-50 text-red-900",
    });
  },
  info: (message: string) => {
    toast.info(message, {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      duration: 3000,
      className: "border-blue-200 bg-blue-50 text-blue-900",
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      duration: 4000,
      className: "border-amber-200 bg-amber-50 text-amber-900",
    });
  },
};
