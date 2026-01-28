"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { Github, Coffee, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/tools", label: "Library" },
  ];

  const isLandingPage = pathname === "/";

  return (
    <nav className="z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 shrink-0 fixed top-0 left-0 right-0">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8 h-full">
          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-70">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-mono text-xs font-bold pt-1">
              _
            </div>
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-black">
              Any-File
            </span>
          </Link>

          {/* Left: Navigation */}
          <div className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-black relative flex items-center h-full",
                pathname === link.href ? "text-black" : "text-slate-500"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-black"
                />
              )}
            </Link>
          ))}
          </div>
        </div>

        {/* Right: Actions & Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-2">
            <a
              href="https://github.com/jed1boy/Any-File"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-black transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://buymeacoffee.com/jzee"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-black hover:text-white hover:border-black transition-all duration-300 group"
              aria-label="Support"
            >
              <Coffee className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Support</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <MotionConfig transition={{ type: "spring", stiffness: 170, damping: 26 }}>
            <motion.button 
              className="md:hidden p-2 text-black relative w-10 h-10 flex items-center justify-center active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
              animate={mobileOpen ? "open" : "closed"}
            >
               <div className="relative w-6 h-6">
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ 
                      rotate: mobileOpen ? 90 : 0, 
                      opacity: mobileOpen ? 0 : 1,
                      scale: mobileOpen ? 0.5 : 1
                    }}
                  >
                    <Menu className="w-6 h-6" strokeWidth={1.5} />
                  </motion.span>
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ 
                      rotate: mobileOpen ? 0 : -90, 
                      opacity: mobileOpen ? 1 : 0,
                      scale: mobileOpen ? 1 : 0.5
                    }}
                  >
                    <X className="w-6 h-6" strokeWidth={1.5} />
                  </motion.span>
               </div>
            </motion.button>
          </MotionConfig>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 26, mass: 1 }}
            className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
             {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-base font-medium py-3 border-b border-slate-100 last:border-0",
                  pathname === link.href ? "text-black" : "text-slate-500"
                )}
              >
                {link.label}
              </Link>
            ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
