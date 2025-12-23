"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || mobileMenuOpen ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-3" : "bg-transparent py-5"
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:rotate-12">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">
            PDF0
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/tools" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            All Tools
          </Link>
          <Link href="/tools/merge" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Merge
          </Link>
          <Link href="/tools/split" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Split
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/tools" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
              Get Started
            </Link>
            <a 
              href="https://buymeacoffee.com/kanavtwt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#FFDD00] text-slate-900 text-sm font-bold rounded-full hover:bg-[#FFCC00] transition-all active:scale-95 shadow-lg shadow-yellow-100 flex items-center gap-2"
            >
              <span>☕</span>
              Buy me a coffee
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/tools" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-blue-600 transition-colors py-2"
            >
              All Tools
            </Link>
            <Link 
              href="/tools/merge" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-blue-600 transition-colors py-2"
            >
              Merge
            </Link>
            <Link 
              href="/tools/split" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-blue-600 transition-colors py-2"
            >
              Split
            </Link>
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
              <Link 
                href="/tools" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-100"
              >
                Get Started
              </Link>
              <a 
                href="https://buymeacoffee.com/kanavtwt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#FFDD00] text-slate-900 text-sm font-bold rounded-full hover:bg-[#FFCC00] transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
              >
                <span>☕</span>
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
