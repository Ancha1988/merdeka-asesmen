"use client";

import { Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: "idle" | "loading" | "success";
  textIdle?: string;
  textLoading?: string;
  textSuccess?: string;
}

export const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(
  (
    {
      status = "idle",
      textIdle = "Simpan",
      textLoading = "Menyimpan...",
      textSuccess = "Tersimpan!",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={status === "loading" || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
          status === "idle" &&
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
          status === "loading" &&
            "bg-blue-400 text-white cursor-not-allowed",
          status === "success" &&
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
          className
        )}
        {...props}
      >
        {status === "idle" && (
          <>
            <Save className="mr-2 h-4 w-4" />
            {textIdle}
          </>
        )}
        {status === "loading" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {textLoading}
          </>
        )}
        {status === "success" && (
          <>
            <Check className="mr-2 h-4 w-4" />
            {textSuccess}
          </>
        )}
      </button>
    );
  }
);

SaveButton.displayName = "SaveButton";
