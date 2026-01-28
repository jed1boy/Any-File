"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import ProcessingStatus from "@/components/ProcessingStatus";
import { encryptPDF, downloadPDF, type EncryptionOptions } from "@/lib/pdf-operations";
import { cn } from "@/lib/utils";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/Button";

export default function EncryptPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  // Password states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFileSelected = (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setStatus("idle");
    setPassword("");
    setConfirmPassword("");
  };

  const calculatePasswordStrength = (pwd: string): { strength: "weak" | "medium" | "strong"; score: number } => {
    if (!pwd) return { strength: "weak", score: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    if (score <= 1) return { strength: "weak", score };
    if (score <= 3) return { strength: "medium", score };
    return { strength: "strong", score };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleEncrypt = async () => {
    if (!file || !password || password !== confirmPassword) return;

    try {
      setStatus("processing");
      setMessage("Applying AES-256 encryption header...");

      await new Promise(resolve => setTimeout(resolve, 800));

      const options: EncryptionOptions = { userPassword: password };
      const encryptedPdf = await encryptPDF(file, options);
      downloadPDF(encryptedPdf, `encrypted-${file.name}`);

      setStatus("success");
      setMessage("Document secured.");
      
      setTimeout(() => {
        setFile(null);
        setPassword("");
        setConfirmPassword("");
        setStatus("idle");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage("Encryption failed.");
      console.error(error);
    }
  };

  return (
    <Shell
      title="Encryption"
      code="SEC_01"
      description="Apply industrial-grade AES-256 encryption to your PDF document. Keys are generated and applied locally."
      status={status}
      specs={[
        { label: "Algorithm", value: "AES-256" },
        { label: "Key Exchange", value: "None (Local)" }
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

        {/* Step 2: Password */}
        {file && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  User Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-black rounded-none outline-none font-mono text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength Bar */}
                {password && (
                  <div className="flex gap-1 h-1 mt-1">
                    {[1, 2, 3].map((step) => (
                       <div key={step} className={cn(
                         "flex-1 transition-colors duration-300",
                         step === 1 && passwordStrength.strength !== "weak" ? "bg-red-400" : "bg-slate-100", // Start Red
                         step <= 2 && passwordStrength.strength === "medium" ? "bg-yellow-400" : "", // Mid Yellow
                         step <= 3 && passwordStrength.strength === "strong" ? "bg-green-500" : "" // Full Green
                       )} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Confirm
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-white border border-slate-300 focus:border-black rounded-none outline-none font-mono text-sm transition-colors",
                      confirmPassword && password !== confirmPassword && "border-red-500 text-red-500"
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                  >
                     {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleEncrypt}
                isLoading={status === "processing"}
                disabled={!password || password !== confirmPassword}
                className="w-full sm:w-auto"
              >
                Encrypt PDF
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
