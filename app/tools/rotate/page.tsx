"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { rotatePDF, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { RotateCw, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleRotate = async () => {
    if (!file) return;

    try {
      setStatus("processing");
      setMessage("Rotating pages...");
      
      await new Promise(resolve => setTimeout(resolve, 600));

      const rotatedPdf = await rotatePDF(file, rotation);
      downloadPDF(rotatedPdf, `rotated-${file.name}`);

      setStatus("success");
      setMessage(`Document rotated ${rotation}° clockwise.`);
    } catch (error) {
      setStatus("error");
      setMessage("Rotation failed.");
      console.error(error);
    }
  };

  return (
    <Shell
      title="Rotate"
      code="EDIT_01"
      description="Permanently rotate all pages in your PDF document. Operation is lossless and preserves quality."
      status={status}
      specs={[
        { label: "Direction", value: "Clockwise" },
        { label: "Scope", value: "All Pages" }
      ]}
    >
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Step 1: Upload */}
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

        {/* Step 2: Controls */}
        {file && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
             
             <div className="grid grid-cols-3 gap-4">
               {[90, 180, 270].map((angle) => (
                 <button
                   key={angle}
                   onClick={() => setRotation(angle as 90 | 180 | 270)}
                   className={cn(
                     "flex flex-col items-center justify-center p-6 border transition-all duration-300",
                     rotation === angle 
                       ? "bg-black border-black text-white" 
                       : "bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black"
                   )}
                 >
                   <RotateCw className={cn(
                     "w-8 h-8 mb-4 transition-transform duration-500",
                     rotation === angle ? "rotate-90" : ""
                   )} strokeWidth={1} />
                   <span className="font-mono text-lg font-bold">{angle}°</span>
                 </button>
               ))}
             </div>

             <div className="flex justify-end">
               <Button
                 onClick={handleRotate}
                 isLoading={status === "processing"}
               >
                 Apply Rotation
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