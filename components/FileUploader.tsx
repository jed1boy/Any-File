"use client";

import { useCallback, useState } from "react";
import { UploadCloud, File, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export default function FileUploader({
  onFilesSelected,
  accept = ".pdf",
  multiple = false,
  maxFiles,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      let fileArray = Array.from(files);
      if (maxFiles && fileArray.length > maxFiles) {
        fileArray = fileArray.slice(0, maxFiles);
      }
      onFilesSelected(fileArray);
    },
    [onFilesSelected, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer overflow-hidden focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2",
        "border-2 border-dashed transition-all duration-300 bg-white min-h-[320px] flex flex-col items-center justify-center",
        isDragging 
          ? "border-black bg-slate-50 scale-[0.99]" 
          : "border-slate-300 hover:border-black"
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
      />
      
      <div className="relative z-10 flex flex-col items-center text-center p-8">
        <div className={cn(
          "w-12 h-12 mb-6 flex items-center justify-center transition-all duration-300 border border-slate-200 bg-slate-50",
          isDragging 
            ? "bg-black text-white border-black" 
            : "text-slate-400 group-hover:text-black group-hover:border-black"
        )}>
          {isDragging ? (
            <Plus className="w-6 h-6" strokeWidth={1.5} />
          ) : (
            <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
          )}
        </div>
        
        <h3 className="text-lg font-bold text-black mb-2 tracking-tight uppercase">
          {isDragging ? "Drop Files" : "Upload Source"}
        </h3>
        
        <p className="text-xs font-mono text-slate-400 uppercase tracking-wide max-w-xs mx-auto">
          {multiple
            ? `[Select ${maxFiles ? `Max ${maxFiles}` : "Multi"}]`
            : "[Select Single File]"}{" "}
          PDF Format
        </p>
      </div>

      {/* Subtle Dot Pattern Overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
    </div>
  );
}
