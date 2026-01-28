"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  status: "idle" | "processing" | "success" | "error";
  className?: string;
}

export default function ProgressBar({ status, className }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "processing") {
      // Fast start, then slow down as it approaches "completion"
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 2;
          if (prev < 70) return prev + 0.5;
          if (prev < 95) return prev + 0.1;
          return prev;
        });
      }, 50);
    } else if (status === "success") {
      setProgress(100);
    } else if (status === "idle" || status === "error") {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-end font-mono text-[10px] uppercase tracking-widest">
        <span className={cn(
          "transition-colors duration-300",
          status === "processing" ? "text-black font-bold" : "text-slate-400"
        )}>
          {status === "processing" ? "Processing Stream" : "Engine Standby"}
        </span>
        <span className="text-black font-bold">{Math.round(progress)}%</span>
      </div>
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out",
            status === "success" ? "bg-green-500" : "bg-black",
            status === "error" ? "bg-red-500" : ""
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
