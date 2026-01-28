"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { compressPDF, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { Download, RefreshCw } from "lucide-react";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedPdfData, setCompressedPdfData] = useState<Uint8Array | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("idle");
    setCompressedSize(0);
    setCompressedPdfData(null);
  };

  const handleCompress = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setStatus("processing");
      setMessage("Optimizing object streams...");

      // Artificial delay for UX (feeling the weight of processing)
      await new Promise(resolve => setTimeout(resolve, 800));

      const compressedPdf = await compressPDF(file);
      setCompressedPdfData(compressedPdf);
      setCompressedSize(compressedPdf.length);

      const reduction = ((1 - compressedPdf.length / file.size) * 100).toFixed(1);
      setStatus("success");
      setMessage(`Optimization Complete. Reduced by ${reduction}%`);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to compress PDF. Please try again.");
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (compressedPdfData && file) {
       downloadPDF(compressedPdfData, `compressed-${file.name}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Shell
      title="Compressor"
      code="MOD_02"
      description="Reduce PDF file size by removing redundant object streams and compressing internal assets. Lossless by default."
      status={status}
      specs={[
        { label: "Algorithm", value: "Flate / RLE" },
        { label: "Quality", value: "High (Lossless)" }
      ]}
    >
      <div className="w-full max-w-xl mx-auto space-y-8">
        
        {/* Step 1: Upload */}
        <div className="space-y-4">
           {!file ? (
             <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".pdf"
              multiple={false}
            />
           ) : (
             <div className="p-6 border border-black bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                  <p className="font-mono text-xs text-slate-500">{formatSize(originalSize)}</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs uppercase font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
             </div>
           )}
        </div>

        {/* Step 2: Action */}
        {file && status !== "success" && (
          <div className="flex justify-end">
            <Button 
              onClick={handleCompress} 
              isLoading={status === "processing"}
              className="w-full sm:w-auto"
            >
              Run Compression
            </Button>
          </div>
        )}

        {/* Step 3: Result */}
        {status === "success" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            
            <div className="p-6 bg-black text-white space-y-4">
               <div className="flex items-center justify-between border-b border-white/20 pb-4">
                 <span className="font-mono text-xs uppercase tracking-widest text-white/60">Result</span>
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
               </div>
               
               <div className="grid grid-cols-2 gap-8">
                 <div>
                   <p className="font-mono text-xs text-white/60 uppercase">Original</p>
                   <p className="text-xl font-bold">{formatSize(originalSize)}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-mono text-xs text-green-400 uppercase">Optimized</p>
                   <p className="text-xl font-bold text-green-400">{formatSize(compressedSize)}</p>
                 </div>
               </div>
               
               <div className="pt-4">
                 <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={handleDownload}
                  >
                   <Download className="w-4 h-4 mr-2" /> Download Optimized File
                 </Button>
               </div>
            </div>

            <div className="text-center">
               <button 
                 onClick={() => {
                   setFile(null);
                   setStatus("idle");
                 }}
                 className="text-xs font-mono text-slate-400 hover:text-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
               >
                 <RefreshCw className="w-3 h-3" /> Process Another File
               </button>
            </div>

          </div>
        )}

        {/* Status Indicator (Error/Processing) */}
        {status === "error" && (
           <ProcessingStatus status={status} message={message} />
        )}
      </div>
    </Shell>
  );
}

import { CheckCircle2 } from "lucide-react";