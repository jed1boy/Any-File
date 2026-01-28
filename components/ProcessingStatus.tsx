"use client";

import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  status: "idle" | "processing" | "success" | "error";
  message?: string;
}

export default function ProcessingStatus({
  status,
  message,
}: ProcessingStatusProps) {
  if (status === "idle") return null;

  const statusConfig = {
    processing: {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-500",
      icon: <Loader2 className="w-4 h-4 animate-spin text-black" />,
      defaultMessage: "Processing...",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      defaultMessage: "Success!",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      defaultMessage: "An error occurred",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-300 font-mono text-xs uppercase tracking-wide",
        config.bg,
        // config.border, // We are using a left border indicator instead
        status === "processing" ? "border-l-black" : "",
        status === "success" ? "border-l-green-500" : "",
        status === "error" ? "border-l-red-500" : ""
      )}
    >
      {config.icon}
      <span className={cn("font-bold", config.text)}>
        {message || config.defaultMessage}
      </span>
    </div>
  );
}
