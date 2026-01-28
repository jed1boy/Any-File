"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { decryptPDF, downloadPDF } from "@/lib/pdf-operations";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";
import { Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DecryptPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPassword("");
    setMessage("");
    
    // Try to detect if PDF is encrypted
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      
      try {
        await PDFDocument.load(arrayBuffer);
        setIsEncrypted(false);
        setStatus("idle");
        setMessage("File is not encrypted.");
      } catch (error: any) {
        const errorMsg = (error?.message || "").toLowerCase();
        if (errorMsg.includes("password") || errorMsg.includes("encrypted") || errorMsg.includes("decrypt")) {
          setIsEncrypted(true);
        } else {
          setIsEncrypted(null);
        }
      }
    } catch (error) {
      setIsEncrypted(null);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;

    try {
      setStatus("processing");
      setMessage("Attempting decryption...");

      await new Promise(resolve => setTimeout(resolve, 800));

      const decryptedPdf = await decryptPDF(file, password);
      downloadPDF(decryptedPdf, `decrypted-${file.name}`);

      setStatus("success");
      setMessage("Password removed successfully.");
      
      setTimeout(() => {
        setFile(null);
        setPassword("");
        setStatus("idle");
        setIsEncrypted(null);
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      if (error.message?.includes("password") || error.message?.includes("Incorrect")) {
        setMessage("Incorrect password.");
      } else {
        setMessage("Decryption failed.");
      }
      console.error(error);
    }
  };

  return (
    <Shell
      title="Decrypt"
      code="SEC_02"
      description="Remove password protection from PDF documents. Requires knowledge of the original password."
      status={status}
      specs={[
        { label: "Operation", value: "Unlock" },
        { label: "Security", value: "Local Only" }
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
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="font-mono text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {isEncrypted !== null && (
                    <span className={cn(
                      "text-[10px] font-mono uppercase font-bold px-2 py-1 border",
                      isEncrypted ? "border-red-200 bg-red-50 text-red-500" : "border-green-200 bg-green-50 text-green-500"
                    )}>
                      {isEncrypted ? "LOCKED" : "OPEN"}
                    </span>
                  )}
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

        {/* Password Input */}
        {file && isEncrypted !== false && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             
             <div className="space-y-2">
               <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                 Enter Password
               </label>
               <div className="relative group">
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-black rounded-none outline-none font-mono text-sm transition-colors"
                   placeholder="••••••••"
                   autoFocus
                 />
                 <button
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                 >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
             </div>

             <div className="flex justify-end">
               <Button
                 onClick={handleDecrypt}
                 isLoading={status === "processing"}
                 disabled={!password}
               >
                 Unlock PDF
               </Button>
             </div>
          </div>
        )}

        {/* Not Encrypted State */}
        {file && isEncrypted === false && (
          <div className="p-4 bg-green-50 border border-green-100 flex gap-4 animate-in fade-in slide-in-from-bottom-4">
            <Unlock className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 leading-relaxed">
              This file is not password protected. No decryption is required.
            </p>
          </div>
        )}

        {status !== "idle" && (
           <ProcessingStatus status={status} message={message} />
        )}
      </div>
    </Shell>
  );
}