"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { htmlToPDF, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { FileCode, Type } from "lucide-react";

export default function HTMLToPDF() {
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<"paste" | "file">("paste");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState({
    format: "a4" as "a4" | "letter",
    orientation: "portrait" as "portrait" | "landscape",
    maxHeightPerPage: 0,
  });

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setHtmlFile(file);
      setStatus("idle");
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtmlContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleConvert = async () => {
    if ((inputMethod === "paste" && !htmlContent.trim()) || (inputMethod === "file" && !htmlFile)) return;

    try {
      setStatus("processing");
      setMessage("Rendering HTML layout...");

      const content = htmlContent || "";
      const pdf = await htmlToPDF(content, {
        format: options.format,
        orientation: options.orientation,
        maxHeightPerPage: options.maxHeightPerPage > 0 ? options.maxHeightPerPage : undefined,
      });

      const filename = htmlFile?.name.replace(/\.html?$/i, ".pdf") || "converted-html.pdf";
      downloadPDF(pdf, filename);

      setStatus("success");
      setMessage("Conversion complete.");
    } catch (error: any) {
      setStatus("error");
      setMessage("Render failed.");
      console.error(error);
    }
  };

  return (
    <Shell
      title="HTML to PDF"
      code="CONV_03"
      description="Convert raw HTML code or files into printable PDF documents. Supports inline CSS."
      status={status}
      specs={[
        { label: "Engine", value: "Headless Render" },
        { label: "CSS", value: "Inline Support" }
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Toggle */}
        <div className="grid grid-cols-2 border border-slate-200 bg-white">
          <button
            onClick={() => {
              setInputMethod("paste");
              setHtmlFile(null);
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors",
              inputMethod === "paste" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
            )}
          >
            <Type className="w-4 h-4" /> Code Input
          </button>
          <button
            onClick={() => {
              setInputMethod("file");
              setHtmlContent("");
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors",
              inputMethod === "file" ? "bg-black text-white" : "text-slate-500 hover:text-black hover:bg-slate-50"
            )}
          >
            <FileCode className="w-4 h-4" /> File Upload
          </button>
        </div>

        {/* Input Area */}
        {inputMethod === "paste" ? (
          <div className="space-y-2">
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<html><body><h1>Hello World</h1></body></html>"
              className="w-full h-64 p-4 border border-slate-200 bg-slate-50 font-mono text-sm resize-none focus:outline-none focus:border-black transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <FileUploader
              onFilesSelected={handleFileSelected}
              accept=".html,.htm"
              multiple={false}
            />
            {htmlFile && (
               <div className="p-4 border border-black bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm truncate max-w-[200px]">{htmlFile.name}</p>
                    <p className="font-mono text-xs text-slate-500">{(htmlFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={() => { setHtmlFile(null); setHtmlContent(""); }}
                    className="text-xs uppercase font-bold text-red-500 hover:underline"
                  >
                    Clear
                  </button>
               </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50 border border-slate-200">
           <div>
             <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-2 block">
               Format
             </label>
             <select
               value={options.format}
               onChange={(e) => setOptions({ ...options, format: e.target.value as "a4" | "letter" })}
               className="w-full px-3 py-2 border border-slate-300 rounded-none bg-white text-sm focus:outline-none focus:border-black"
             >
               <option value="a4">A4 (210x297mm)</option>
               <option value="letter">Letter (8.5x11in)</option>
             </select>
           </div>
           <div>
             <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-2 block">
               Orientation
             </label>
             <select
               value={options.orientation}
               onChange={(e) => setOptions({ ...options, orientation: e.target.value as "portrait" | "landscape" })}
               className="w-full px-3 py-2 border border-slate-300 rounded-none bg-white text-sm focus:outline-none focus:border-black"
             >
               <option value="portrait">Portrait</option>
               <option value="landscape">Landscape</option>
             </select>
           </div>
           <div>
             <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 mb-2 block">
               Max Height
             </label>
             <input
               type="number"
               min="0"
               value={options.maxHeightPerPage || ""}
               onChange={(e) => setOptions({ ...options, maxHeightPerPage: parseFloat(e.target.value) || 0 })}
               placeholder="Auto"
               className="w-full px-3 py-2 border border-slate-300 rounded-none bg-white text-sm focus:outline-none focus:border-black"
             />
           </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button
            onClick={handleConvert}
            isLoading={status === "processing"}
            disabled={inputMethod === "paste" ? !htmlContent.trim() : !htmlFile}
          >
            Render PDF
          </Button>
        </div>

        {status !== "idle" && (
           <ProcessingStatus status={status} message={message} />
        )}
      </div>
    </Shell>
  );
}