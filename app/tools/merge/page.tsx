"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown, Trash2, FileText, ArrowRight, Merge, Plus } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { mergePDFs, downloadPDF } from "@/lib/pdf-operations";
import { cn } from "@/lib/utils";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setStatus("idle");
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatus("error");
      setMessage("Please select at least 2 PDF files");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Concatenating document streams...");
      
      // UX Delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const mergedPdf = await mergePDFs(files);

      downloadPDF(mergedPdf, "merged-stack.pdf");

      setStatus("success");
      setMessage("Stack merged successfully.");
    } catch (error) {
      setStatus("error");
      setMessage("Failed to merge PDFs. Please try again.");
      console.error(error);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...files];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  return (
    <Shell
      title="Merge Stack"
      code="MOD_01"
      description="Linear concatenation of multiple PDF streams into a single unified document buffer. Drag to reorder sequence."
      status={status}
      specs={[
        { label: "Operation", value: "Concatenation" },
        { label: "Limit", value: "Memory Bound" }
      ]}
    >
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Upload Area */}
        <FileUploader
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={true}
        />

        {/* File List */}
        <AnimatePresence mode="popLayout">
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-black">
                  Stack Sequence ({files.length})
                </h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-[10px] font-mono uppercase text-red-500 hover:underline"
                >
                  Clear Stack
                </button>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex items-center gap-4 p-3 bg-white border border-slate-200 hover:border-black transition-colors"
                  >
                    {/* Index */}
                    <span className="font-mono text-xs text-slate-400 w-6 text-center">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{file.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-slate-100 disabled:opacity-20"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        className="p-1.5 hover:bg-slate-100 disabled:opacity-20"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1.5 hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleMerge}
                  isLoading={status === "processing"}
                  disabled={files.length < 2}
                  className="w-full sm:w-auto"
                >
                  Merge {files.length} Files
                </Button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Status */}
        {status !== "idle" && status !== "success" && (
           <ProcessingStatus status={status} message={message} />
        )}

      </div>
    </Shell>
  );
}