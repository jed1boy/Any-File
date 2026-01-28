import Link from "next/link";
import { 
  Files, 
  Split, 
  Minimize2, 
  RotateCw, 
  Image, 
  FileImage, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  FileText, 
  Stamp,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one",
    href: "/tools/merge",
    icon: Files,
    category: "Organize"
  },
  {
    name: "Split PDF",
    description: "Extract pages or split into multiple files",
    href: "/tools/split",
    icon: Split,
    category: "Organize"
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size",
    href: "/tools/compress",
    icon: Minimize2,
    category: "Optimize"
  },
  {
    name: "Rotate PDF",
    description: "Rotate PDF pages",
    href: "/tools/rotate",
    icon: RotateCw,
    category: "Edit"
  },
  {
    name: "PDF to Images",
    description: "Convert PDF pages to JPG or PNG",
    href: "/tools/pdf-to-images",
    icon: Image,
    category: "Convert"
  },
  {
    name: "Images to PDF",
    description: "Convert images to PDF document",
    href: "/tools/images-to-pdf",
    icon: FileImage,
    category: "Convert"
  },
  {
    name: "Organize Pages",
    description: "Reorder, rotate, or delete PDF pages",
    href: "/tools/organize",
    icon: Files,
    category: "Organize"
  },
  {
    name: "Add Watermark",
    description: "Add text watermark to PDF pages",
    href: "/tools/watermark",
    icon: Stamp,
    category: "Edit"
  },
  {
    name: "Encrypt PDF",
    description: "Add password protection.",
    href: "/tools/encrypt",
    icon: Lock,
    category: "Security",
  },
  {
    name: "Decrypt PDF",
    description: "Remove password protection.",
    href: "/tools/decrypt",
    icon: Unlock,
    category: "Security",
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML files or code.",
    href: "/tools/html-to-pdf",
    icon: FileText,
    category: "Convert"
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-dot-pattern pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12 border-b border-black pb-6">
          <h1 className="text-4xl font-bold text-black tracking-tight mb-2">Library</h1>
          <p className="text-slate-500">
            Full catalog of local PDF utilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          {/* Using gap-px with a background color creates a 'grid lines' effect */}
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group relative bg-white p-8 hover:bg-slate-50 transition-colors duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="w-10 h-10 border border-slate-200 flex items-center justify-center text-black group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <tool.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
              </div>
              
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-black mb-1 group-hover:underline underline-offset-4 decoration-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-mono text-xs uppercase tracking-wide">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}