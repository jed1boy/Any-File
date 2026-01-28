"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "@/components/ProgressBar";

// --- Swiss Components ---

function GridLine({ vertical = false }: { vertical?: boolean }) {
  return (
    <div 
      className={cn(
        "absolute bg-slate-200 pointer-events-none",
        vertical ? "w-px h-full top-0" : "h-px w-full left-0"
      )} 
    />
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-6 border-r border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
      <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-4 group-hover:text-black transition-colors">{label}</div>
      <div className="text-3xl font-bold tracking-tighter text-black mb-1">{value}</div>
      <div className="text-xs font-mono text-slate-500">{sub}</div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-6 p-6 md:p-8 border-b border-slate-200 hover:bg-slate-50 transition-colors group">
      <div className="w-12 h-12 border border-slate-200 flex items-center justify-center bg-white group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300 shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-wide group-hover:underline underline-offset-4 decoration-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-black selection:text-white pt-16">
      
      {/* --- HERO SECTION --- */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-end">
            
            {/* Left: Headline */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                System Online v1.0
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
                Local<br/>
                First<br/>
                <span className="text-slate-300">Privacy.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                Professional document workbench powered by client-side processing. 
                Zero data egress. Native performance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/tools">
                  <button className="px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2 group">
                    Initialize Workbench <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a 
                  href="https://github.com/jed1boy/Any-File" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-slate-200 text-black font-bold text-sm uppercase tracking-widest hover:border-black transition-colors flex items-center gap-2"
                >
                  Source Code
                </a>
              </div>
            </div>

            {/* Right: Technical Monitor */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-slate-100 p-6 border border-slate-200 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                   <span className="font-mono text-xs font-bold uppercase">System Status</span>
                   <Terminal className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="space-y-4">
                  <ProgressBar status="success" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">Engine</div>
                      <div className="font-bold text-sm">V8 / JS</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">Network</div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        Offline <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">Encryption</div>
                      <div className="font-bold text-sm">AES-256</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">License</div>
                      <div className="font-bold text-sm">MIT Open</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="container mx-auto max-w-7xl border-l border-r border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4">
             <StatCard label="Processing" value="0ms" sub="Latency (Local)" />
             <StatCard label="Privacy" value="100%" sub="Data Retention" />
             <StatCard label="Availability" value="Offline" sub="No Internet Req" />
             <StatCard label="Cost" value="$0.00" sub="Open Source" />
          </div>
        </div>
      </div>

      {/* --- MANIFESTO / FEATURES --- */}
      <div className="bg-white">
        <div className="container mx-auto max-w-7xl border-l border-r border-slate-200">
          
          <div className="grid md:grid-cols-2">
            
            {/* Left: Manifesto */}
            <div className="p-8 md:p-16 border-b md:border-b-0 md:border-r border-slate-200">
               <span className="font-mono text-xs text-red-500 font-bold uppercase tracking-widest mb-6 block">
                 // THE PROBLEM
               </span>
               <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8 tracking-tight">
                 Stop sending your passport to random servers.
               </h2>
               <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed">
                 <p className="mb-6">
                   Most "Free PDF Tools" are data harvesting operations. You upload your sensitive documents to a black box server. You have no guarantee they are deleted.
                 </p>
                 <p className="font-bold text-black">
                   Any-File is different.
                 </p>
                 <p>
                   It runs entirely in your browser. Your files never leave your device. Once the application is loaded, all document processing happens locally on your machine—ensuring maximum privacy.
                 </p>
               </div>
            </div>

            {/* Right: Feature List */}
            <div className="flex flex-col">
              <FeatureRow 
                icon={ShieldCheck}
                title="Client-Side Only"
                desc="Logic executes in your browser's V8 engine. No file uploads, no API latency, no server logs."
              />
              <FeatureRow 
                icon={Cpu}
                title="Browser Native"
                desc="Powered by modern browser APIs and advanced JavaScript libraries for optimal performance."
              />
              <FeatureRow 
                icon={Lock}
                title="Zero Knowledge"
                desc="We cannot see your files even if we wanted to. The architecture is physically incapable of data egress."
              />
            </div>

          </div>
        </div>
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="bg-black text-white py-24">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">
              Take Control
            </h2>
            <Link href="/tools">
              <button className="px-10 py-5 bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors inline-flex items-center gap-3">
                Launch Workbench <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
         </div>
      </div>

    </div>
  );
}
