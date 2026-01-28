"use client";

import { useState, useEffect, useRef } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { extractPages, downloadPDF } from "@/lib/pdf-operations";
import { PDFDocument } from "pdf-lib";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2 } from "lucide-react";

interface PageThumbnail {
  pageNum: number;
  imageUrl: string | null;
  selected: boolean;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setPageCount(count);

      setPages(
        Array.from({ length: count }, (_, i) => ({
          pageNum: i + 1,
          imageUrl: null,
          selected: false,
        }))
      );

      await loadThumbnails(selectedFile, count);
    } catch (error) {
      console.error("Failed to load PDF:", error);
    }
  };

  const loadThumbnails = async (pdfFile: File, count: number) => {
    setLoadingThumbnails(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const thumbnailPromises = Array.from({ length: count }, async (_, i) => {
        try {
          const pageNum = i + 1;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.5 }); // Lower scale for thumbnails

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return { pageNum, imageUrl: null };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL("image/png");
          return { pageNum, imageUrl };
        } catch (error) {
          console.error(`Failed to render page ${i + 1}:`, error);
          return { pageNum: i + 1, imageUrl: null };
        }
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      
      setPages((prev) =>
        prev.map((page) => {
          const thumbnail = thumbnails.find((t) => t.pageNum === page.pageNum);
          return thumbnail ? { ...page, imageUrl: thumbnail.imageUrl } : page;
        })
      );
    } catch (error) {
      console.error("Failed to load thumbnails:", error);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const togglePage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNum === pageNum ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const handleMouseDown = (pageNum: number) => {
    setIsDragging(true);
    setDragStart(pageNum);
    togglePage(pageNum);
  };

  const handleMouseEnter = (pageNum: number) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, pageNum);
      const end = Math.max(dragStart, pageNum);

      setPages((prev) =>
        prev.map((page) => {
          if (page.pageNum >= start && page.pageNum <= end) {
            return { ...page, selected: true };
          }
          return page;
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  const selectAll = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAll = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const handleSplit = async () => {
    if (!file) return;

    const selectedIndices = pages
      .filter((p) => p.selected)
      .map((p) => p.pageNum - 1);

    if (selectedIndices.length === 0) return;

    try {
      setStatus("processing");
      setMessage("Extracting pages...");
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdf = await extractPages(file, selectedIndices);
      downloadPDF(pdf, `extracted-${file.name}`);

      setStatus("success");
      setMessage(`Extracted ${selectedIndices.length} pages.`);
    } catch (error) {
      setStatus("error");
      setMessage("Extraction failed.");
      console.error(error);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <Shell
      title="Split PDF"
      code="MOD_03"
      description="Select specific pages to extract into a new document. Click and drag to select multiple pages."
      status={status}
      specs={[
        { label: "Mode", value: "Extraction" },
        { label: "Quality", value: "Lossless" }
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {!file && (
           <FileUploader
             onFilesSelected={handleFileSelected}
             accept=".pdf"
             multiple={false}
           />
        )}

        {file && pageCount > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
               <div className="flex items-center gap-4">
                 <p className="text-sm font-bold text-black">{file.name}</p>
                 <div className="h-4 w-px bg-slate-300" />
                 <p className="text-xs font-mono text-slate-500 uppercase">{selectedCount} Selected</p>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={selectAll}
                   className="text-xs font-mono font-bold uppercase hover:text-black text-slate-500 transition-colors"
                 >
                   All
                 </button>
                 <span className="text-slate-300">/</span>
                 <button 
                   onClick={deselectAll}
                   className="text-xs font-mono font-bold uppercase hover:text-black text-slate-500 transition-colors"
                 >
                   None
                 </button>
                 <span className="text-slate-300">/</span>
                 <button 
                   onClick={() => setFile(null)}
                   className="text-xs font-mono font-bold uppercase text-red-500 hover:underline"
                 >
                   Reset
                 </button>
               </div>
            </div>

            {/* Grid */}
            <div
              ref={containerRef}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 select-none"
              onMouseUp={handleMouseUp}
            >
              {pages.map((page) => (
                <div
                  key={page.pageNum}
                  onMouseDown={() => handleMouseDown(page.pageNum)}
                  onMouseEnter={() => handleMouseEnter(page.pageNum)}
                  className={cn(
                    "relative aspect-[3/4] border transition-all cursor-pointer group",
                    page.selected 
                      ? "border-black bg-slate-50 shadow-md ring-1 ring-black" 
                      : "border-slate-200 bg-white hover:border-slate-400"
                  )}
                >
                  {page.imageUrl ? (
                    <img
                      src={page.imageUrl}
                      alt={`Page ${page.pageNum}`}
                      className="w-full h-full object-contain p-2"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-mono text-xs text-slate-300">{page.pageNum}</span>
                    </div>
                  )}
                  
                  {/* Selection Indicator */}
                  <div className={cn(
                    "absolute top-2 right-2 w-4 h-4 border flex items-center justify-center transition-colors",
                    page.selected ? "bg-black border-black" : "bg-white border-slate-200"
                  )}>
                    {page.selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-1 text-center">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {page.pageNum}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSplit}
                isLoading={status === "processing"}
                disabled={selectedCount === 0}
              >
                Extract {selectedCount} Pages
              </Button>
            </div>
          </div>
        )}

        {status !== "idle" && status !== "success" && (
           <ProcessingStatus status={status} message={message} />
        )}

      </div>
    </Shell>
  );
}