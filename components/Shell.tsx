"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import ProgressBar from "./ProgressBar";

interface TechSpecProps {
  label: string;
  value: string;
}

function TechSpec({ label, value }: TechSpecProps) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-slate-200 font-mono text-[10px] sm:text-xs">
      <span className="text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-black font-medium">{value}</span>
    </div>
  );
}

interface ShellProps {
  title: string;
  code: string;
  description: string;
  children: React.ReactNode;
  specs?: { label: string; value: string }[];
  status?: "idle" | "processing" | "success" | "error";
}

export default function Shell({ title, code, description, children, specs = [], status = "idle" }: ShellProps) {
  // Default specs if none provided
  const defaultSpecs = [
    { label: "Engine", value: "V8 / JS" },
    { label: "Privacy", value: "Strict / Local" },
    { label: "Latency", value: "< 50ms" },
    ...specs
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* --- LEFT PANEL (Context) --- */}
      <div className="lg:w-1/3 xl:w-1/4 bg-white border-r border-slate-200 p-6 flex flex-col justify-between h-auto lg:h-screen lg:sticky lg:top-0">
        
        {/* Top: Nav */}
        <div className="mb-8 lg:mb-0">
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Return to Library
          </Link>
        </div>

        {/* Middle: Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-sm">
              {code}
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black mt-4">
              {title}
            </h1>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Bottom: Progress & Stats */}
        <div className="mt-8 lg:mt-0 pt-8 border-t border-slate-100 space-y-6">
          <ProgressBar status={status} />
          
          <div className="space-y-1">
            {defaultSpecs.slice(0, 3).map((spec, i) => (
              <TechSpec key={i} {...spec} />
            ))}
          </div>
        </div>

      </div>

      {/* --- RIGHT PANEL (Workspace) --- */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full flex flex-col justify-center">
          {children}
        </div>
        
        {/* Footer for workspace */}
        <div className="p-4 border-t border-slate-200 text-center lg:text-right">
           <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
             Any-File Workspace // v1.0
           </span>
        </div>
      </div>

    </div>
  );
}
