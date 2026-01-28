"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { imagesToPDF, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { ArrowUp, ArrowDown, Trash2, Image as ImageIcon } from "lucide-react";

export default function ImagesToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setStatus("idle");
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    try {
      setStatus("processing");
      setMessage("Compiling image sequence...");

      await new Promise(resolve => setTimeout(resolve, 600));

      const { pdf, skippedFiles } = await imagesToPDF(files);
      
      const convertedCount = files.length - skippedFiles.length;
      
      if (convertedCount === 0) {
        setStatus("error");
        setMessage("Invalid format. Use PNG/JPG.");
        return;
      }

      downloadPDF(pdf, "compiled-images.pdf");
      setStatus("success");
      setMessage(`Compiled ${convertedCount} images.`);

    } catch (error) {
      setStatus("error");
      setMessage("Conversion failed.");
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
      title="Images to PDF"
      code="CONV_02"
      description="Compile a sequence of images into a single PDF document. Supports PNG and JPG formats."
      status={status}
      specs={[
        { label: "Input", value: "PNG / JPG" },
        { label: "Layout", value: "1 Image/Page" }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        
        <FileUploader
          onFilesSelected={handleFilesSelected}
          accept="image/jpeg,image/jpg,image/png"
          multiple={true}
        />

        {files.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-black">
                  Sequence ({files.length})
                </h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-[10px] font-mono uppercase text-red-500 hover:underline"
                >
                  Clear All
                </button>
             </div>

             <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-4 p-3 bg-white border border-slate-200 hover:border-black transition-colors group"
                  >
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">{file.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

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
                  </div>
                ))}
             </div>

             <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleConvert}
                  isLoading={status === "processing"}
                  disabled={files.length === 0}
                >
                  Create PDF
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