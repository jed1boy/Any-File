"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { addWatermark, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0]);
    setStatus("idle");
  };

  const handleAddWatermark = async () => {
    if (!file || !watermarkText.trim()) return;

    try {
      setStatus("processing");
      setMessage("Stamping document pages...");

      await new Promise(resolve => setTimeout(resolve, 800));

      const watermarkedPdf = await addWatermark(file, watermarkText, {
        fontSize,
        opacity,
        rotation,
      });

      downloadPDF(watermarkedPdf, `watermarked-${file.name}`);

      setStatus("success");
      setMessage("Watermark applied successfully.");
    } catch (error) {
      setStatus("error");
      setMessage("Operation failed.");
      console.error(error);
    }
  };

  return (
    <Shell
      title="Watermark"
      code="EDIT_03"
      description="Stamp text over your PDF pages. Customize size, opacity, and rotation."
      status={status}
      specs={[
        { label: "Type", value: "Text Overlay" },
        { label: "Font", value: "Helvetica Bold" }
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

        {/* Controls */}
        {file && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             
             {/* Text Input */}
             <div>
               <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                 Watermark Text
               </label>
               <input 
                 type="text" 
                 value={watermarkText}
                 onChange={(e) => setWatermarkText(e.target.value)}
                 placeholder="CONFIDENTIAL"
                 className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-black rounded-none outline-none font-bold text-lg transition-colors placeholder:text-slate-300"
               />
             </div>

             {/* Sliders */}
             <div className="space-y-6">
                
                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Font Size</span>
                    <span>{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Opacity</span>
                    <span>{(opacity * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Rotation</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                </div>

             </div>

             {/* Action */}
             <div className="flex justify-end pt-4">
               <Button
                 onClick={handleAddWatermark}
                 isLoading={status === "processing"}
                 disabled={!watermarkText.trim()}
               >
                 Apply Watermark
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