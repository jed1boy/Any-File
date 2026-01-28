"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { downloadImage } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleConvert = async () => {
    if (!file) return;

    try {
      setStatus("processing");
      setMessage("Rasterizing vectors to bitmaps...");

      // Dynamic import of pdfjs-dist to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist");
      // Use the worker from node_modules
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High res

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            format === "png" ? "image/png" : "image/jpeg",
            0.95
          );
        });

        downloadImage(blob, `page-${pageNum}.${format}`);
      }

      setStatus("success");
      setMessage(`Extraction Complete: ${numPages} Pages.`);
    } catch (error) {
      setStatus("error");
      setMessage("Extraction failed.");
      console.error(error);
    }
  };

  return (
    <Shell
      title="Extraction"
      code="CONV_01"
      description="Rasterize vector PDF pages into high-fidelity bitmaps (JPG/PNG). Perfect for recovering slides or diagrams."
      status={status}
      specs={[
        { label: "Render", value: "Canvas API" },
        { label: "DPI", value: "300 (2.0x)" }
      ]}
    >
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Upload */}
        <div className="space-y-4">
           {!file ? (
             <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />
           ) : (
             <div className="p-4 border border-black bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                  <p className="font-mono text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs uppercase font-bold text-red-500 hover:underline"
                >
                  Change
                </button>
             </div>
           )}
        </div>

        {/* Settings */}
        {file && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                Output Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(["png", "jpeg"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={cn(
                      "p-4 border text-left transition-colors",
                      format === fmt 
                        ? "border-black bg-black text-white" 
                        : "border-slate-200 bg-white text-slate-500 hover:border-black hover:text-black"
                    )}
                  >
                    <div className="text-sm font-bold uppercase">{fmt}</div>
                    <div className={cn("text-[10px] uppercase tracking-wider mt-1", format === fmt ? "text-slate-400" : "text-slate-400")}>
                      {fmt === "png" ? "Lossless" : "Compressed"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleConvert} isLoading={status === "processing"}>
                Extract Images
              </Button>
            </div>
          </div>
        )}

        {status !== "idle" && (
           <ProcessingStatus status={status} message={message} />
        )}

      </div>
    </Shell>
  );
}