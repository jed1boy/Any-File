"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname === "/") return null;

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="container mx-auto px-6 py-12 md:py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24">
          
          {/* Brand / Mission */}
          <div className="max-w-xs">
            <h3 className="font-bold text-black text-2xl mb-4 tracking-tighter">Any-File.</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              The professional's local-first PDF workbench. 
              Built for privacy, speed, and offline reliability.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full w-fit border border-slate-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-600 uppercase tracking-wider">
                System Online
              </span>
            </div>
          </div>

          {/* Navigation Links - Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full md:w-auto">
            
            {/* Modules */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                Modules
              </span>
              <Link href="/tools/merge" className="text-sm text-slate-600 hover:text-black transition-colors">Merge Stack</Link>
              <Link href="/tools/compress" className="text-sm text-slate-600 hover:text-black transition-colors">Compressor</Link>
              <Link href="/tools/encrypt" className="text-sm text-slate-600 hover:text-black transition-colors">Encryption</Link>
              <Link href="/tools" className="text-sm text-slate-600 hover:text-black transition-colors">Library</Link>
            </div>

            {/* Project */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                Project
              </span>
              <a href="https://github.com/jed1boy/Any-File" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-black transition-colors flex items-center gap-2">
                GitHub <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
              <a href="https://github.com/jed1boy/Any-File/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-black transition-colors flex items-center gap-2">
                Issues <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
              <a href="https://buymeacoffee.com/jzee" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-black transition-colors flex items-center gap-2">
                Sponsor <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* Engineer */}
             <div className="flex flex-col gap-4">
              <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                Engineer
              </span>
              <a href="https://x.com/jzee3_" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-black transition-colors">
                @jzee3_
              </a>
              <span className="text-sm text-slate-400">
                MIT Licensed
              </span>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-mono uppercase tracking-wider">
           <span>© {new Date().getFullYear()} Any-File.</span>
           <div className="flex items-center gap-6">
             <span>Privacy Policy</span>
             <span>Terms</span>
             <span>v1.0.0</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
