"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset loading state when navigation completes
    setIsLoading(false);
    setProgress(100);
    
    const timeout = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.target && !anchor.download) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        
        // Only show loading for internal navigation to different pages
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setIsLoading(true);
          setProgress(10);
          
          // Simulate progress
          progressInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + Math.random() * 15;
            });
          }, 100);
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
                  <div 
                    className="h-full bg-slate-950 transition-all duration-300 ease-out shadow-lg shadow-slate-900/10"
                    style={{ width: `${progress}%` }}
                  />      </div>

      {/* Blur Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[99] bg-white/60 backdrop-blur-sm transition-all duration-200 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
}

