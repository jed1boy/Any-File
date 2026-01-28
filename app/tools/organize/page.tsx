"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { organizePDF, downloadPDF } from "@/lib/pdf-operations";
import { PDFDocument } from "pdf-lib";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { RotateCw, Trash2, Undo2, ArrowLeft, ArrowRight } from "lucide-react";

interface PageInfo {
  index: number;
  rotation: 0 | 90 | 180 | 270;
  deleted: boolean;
  imageUrl: string | null;
}

export default function OrganizePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();

      setPages(
        Array.from({ length: pageCount }, (_, i) => ({
          index: i,
          rotation: 0,
          deleted: false,
          imageUrl: null,
        }))
      );

      await loadThumbnails(selectedFile, pageCount);
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
          const viewport = page.getViewport({ scale: 0.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return { index: i, imageUrl: null };

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL("image/png");
          return { index: i, imageUrl };
        } catch (error) {
          console.error(`Failed to render page ${i + 1}:`, error);
          return { index: i, imageUrl: null };
        }
      });

      const thumbnails = await Promise.all(thumbnailPromises);
      
      setPages((prev) =>
        prev.map((page) => {
          const thumbnail = thumbnails.find((t) => t.index === page.index);
          return thumbnail ? { ...page, imageUrl: thumbnail.imageUrl } : page;
        })
      );
    } catch (error) {
      console.error("Failed to load thumbnails:", error);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.index === index
          ? { ...page, rotation: ((page.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : page
      )
    );
  };

  const deletePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) => (page.index === index ? { ...page, deleted: true } : page))
    );
  };

  const restorePage = (index: number) => {
    setPages((prev) =>
      prev.map((page) => (page.index === index ? { ...page, deleted: false } : page))
    );
  };

  const movePage = (index: number, direction: "up" | "down") => {
    const currentPos = pages.findIndex((p) => p.index === index);
    const newPos = direction === "up" ? currentPos - 1 : currentPos + 1;

    if (newPos >= 0 && newPos < pages.length) {
      const newPages = [...pages];
      [newPages[currentPos], newPages[newPos]] = [newPages[newPos], newPages[currentPos]];
      setPages(newPages);
    }
  };

  const handleOrganize = async () => {
    if (!file) return;

    try {
      setStatus("processing");
      setMessage("Restructuring document...");

      await new Promise(resolve => setTimeout(resolve, 800));

      const pageOrder = pages
        .filter((page) => !page.deleted)
        .map((page) => ({
          originalIndex: page.index,
          rotation: page.rotation,
        }));

      const organizedPdf = await organizePDF(file, pageOrder);

      downloadPDF(organizedPdf, `organized-${file.name}`);

      setStatus("success");
      setMessage("Organization complete.");
    } catch (error) {
      setStatus("error");
      setMessage("Organization failed.");
      console.error(error);
    }
  };

  const activePages = pages.filter((p) => !p.deleted);

  return (
    <Shell
      title="Organize"
      code="EDIT_02"
      description="Visual editor for your PDF. Reorder, rotate, or delete individual pages."
      status={status}
      specs={[
        { label: "Pages", value: activePages.length.toString() },
        { label: "Original", value: file ? (file.size/1024).toFixed(0)+"KB" : "-" }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {!file && (
           <FileUploader
             onFilesSelected={handleFileSelected}
             accept=".pdf"
             multiple={false}
           />
        )}

        {file && pages.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             {/* Toolbar */}
             <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-black">{file.name}</p>
                  <div className="h-4 w-px bg-slate-300" />
                  <p className="text-xs font-mono text-slate-500 uppercase">
                    {activePages.length} Pages Active
                  </p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs font-mono font-bold uppercase text-red-500 hover:underline"
                >
                  Reset
                </button>
             </div>

             {/* Grid */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {pages.map((page, idx) => (
                 <div
                   key={page.index}
                   className={cn(
                     "relative p-4 border transition-all group bg-white",
                     page.deleted 
                       ? "border-red-100 opacity-50 bg-red-50/10" 
                       : "border-slate-200 hover:border-black hover:shadow-lg"
                   )}
                 >
                   {/* Thumbnail Container */}
                   <div className="relative mb-4 aspect-[3/4] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                     <div 
                       className="w-full h-full flex items-center justify-center transition-transform duration-300"
                       style={{ transform: `rotate(${page.rotation}deg)` }}
                     >
                        {page.imageUrl ? (
                          <img
                            src={page.imageUrl}
                            alt={`Page ${page.index + 1}`}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="font-mono text-xs text-slate-300">Loading...</span>
                        )}
                     </div>
                     
                     <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                       {page.index + 1}
                     </div>
                   </div>

                   {/* Controls */}
                   <div className="grid grid-cols-4 gap-2">
                     <button
                       onClick={() => movePage(page.index, "up")}
                       disabled={idx === 0 || page.deleted}
                       className="flex items-center justify-center p-2 bg-slate-100 hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-slate-100 disabled:hover:text-current transition-colors rounded-sm"
                       title="Move Left"
                     >
                       <ArrowLeft className="w-3 h-3" />
                     </button>
                     <button
                       onClick={() => movePage(page.index, "down")}
                       disabled={idx === pages.length - 1 || page.deleted}
                       className="flex items-center justify-center p-2 bg-slate-100 hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-slate-100 disabled:hover:text-current transition-colors rounded-sm"
                       title="Move Right"
                     >
                       <ArrowRight className="w-3 h-3" />
                     </button>
                     <button
                       onClick={() => rotatePage(page.index)}
                       disabled={page.deleted}
                       className="flex items-center justify-center p-2 bg-slate-100 hover:bg-black hover:text-white disabled:opacity-20 transition-colors rounded-sm"
                       title="Rotate"
                     >
                       <RotateCw className="w-3 h-3" />
                     </button>
                     <button
                       onClick={() => page.deleted ? restorePage(page.index) : deletePage(page.index)}
                       className={cn(
                         "flex items-center justify-center p-2 transition-colors rounded-sm",
                         page.deleted 
                           ? "bg-green-100 text-green-600 hover:bg-green-200" 
                           : "bg-red-50 text-red-500 hover:bg-red-100"
                       )}
                       title={page.deleted ? "Restore" : "Delete"}
                     >
                       {page.deleted ? <Undo2 className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                     </button>
                   </div>
                 </div>
               ))}
             </div>

             {/* Action */}
             <div className="flex justify-end pt-4">
               <Button
                 onClick={handleOrganize}
                 isLoading={status === "processing"}
                 disabled={activePages.length === 0}
               >
                 Apply Changes
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