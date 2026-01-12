import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { encryptPDF as encryptPDFBytes } from "@pdfsmaller/pdf-encrypt-lite";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function extractPages(
  file: File,
  pageIndices: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  const pages = await newPdf.copyPages(pdf, pageIndices);
  pages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function rotatePDF(
  file: File,
  rotation: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  const indicesToRotate = pageIndices || pages.map((_, i) => i);

  indicesToRotate.forEach((index) => {
    if (index >= 0 && index < pages.length) {
      const page = pages[index];
      // Add rotation to existing page rotation
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation));
    }
  });

  return await pdf.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  // Remove metadata to reduce size
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("");
  pdf.setCreator("");

  return await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}

export async function addWatermark(
  file: File,
  text: string,
  options?: {
    fontSize?: number;
    opacity?: number;
    rotation?: number;
  }
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const fontSize = options?.fontSize || 48;
  const opacity = options?.opacity || 0.3;
  const rotation = options?.rotation || -45;

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(rotation),
    });
  });

  return await pdf.save();
}

export async function organizePDF(
  file: File,
  pageOrder: {
    originalIndex: number;
    rotation: 0 | 90 | 180 | 270;
  }[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // Copy pages in the specified order
  for (const { originalIndex, rotation } of pageOrder) {
    const [copiedPage] = await newPdf.copyPages(pdf, [originalIndex]);
    
    if (rotation !== 0) {
      // Add rotation to existing page rotation
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees(currentRotation + rotation));
    }
    
    newPdf.addPage(copiedPage);
  }

  return await newPdf.save();
}

export async function imagesToPDF(files: File[]): Promise<{ pdf: Uint8Array; skippedFiles: string[] }> {
  const pdf = await PDFDocument.create();
  const skippedFiles: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type === "image/png") {
      image = await pdf.embedPng(arrayBuffer);
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      image = await pdf.embedJpg(arrayBuffer);
    } else {
      skippedFiles.push(file.name);
      continue;
    }

    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return { pdf: await pdf.save(), skippedFiles };
}

export function downloadPDF(data: Uint8Array, filename: string) {
  const blob = new Blob([data as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface EncryptionOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    printing?: "lowResolution" | "highResolution" | "none";
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
    fillingForms?: boolean;
    contentAccessibility?: boolean;
    documentAssembly?: boolean;
  };
}

export async function encryptPDF(
  file: File,
  options: EncryptionOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);
  
  // Use @pdfsmaller/pdf-encrypt-lite for encryption
  // This library preserves all PDF content including metadata automatically
  // API: encryptPDF(pdfBytes, userPassword, ownerPassword?)
  const ownerPwd = options.ownerPassword || options.userPassword;
  
  try {
    const encryptedBytes = await encryptPDFBytes(
      pdfBytes,
      options.userPassword,
      ownerPwd
    );
    
    // Verify encryption worked
    if (encryptedBytes.length === 0) {
      throw new Error("Encryption failed - empty result");
    }
    
    return encryptedBytes;
  } catch (error: any) {
    throw new Error(`Failed to encrypt PDF: ${error.message || "Unknown error"}`);
  }
}

export async function decryptPDF(
  file: File,
  password: string
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Use PDF.js to decrypt and read the encrypted PDF
  // PDF.js properly supports password-protected PDFs
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  let pdfDoc: any;
  try {
    // Load encrypted PDF with password using PDF.js
    pdfDoc = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      password: password 
    }).promise;
  } catch (error: any) {
    const errorMsg = (error?.message || String(error)).toLowerCase();
    if (errorMsg.includes("password") || errorMsg.includes("incorrect") || errorMsg.includes("authentication") || errorMsg.includes("encrypted")) {
      throw new Error("Incorrect password. Please verify the password and try again.");
    }
    throw new Error(`Failed to decrypt PDF: ${error?.message || "Unknown error"}`);
  }

  // Now use pdf-lib to rebuild the PDF without encryption
  // Render each page and recreate to preserve content
  const newPdf = await PDFDocument.create();
  const numPages = pdfDoc.numPages;

  // Copy pages by rendering and recreating
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    // Render page to canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert canvas to image and embed in new PDF
    const imageData = canvas.toDataURL("image/png");
    const imageBytes = await fetch(imageData).then(res => res.arrayBuffer());
    const image = await newPdf.embedPng(imageBytes);
    
    const pdfPage = newPdf.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  // Save without encryption
  return await newPdf.save({
    useObjectStreams: true,
  });
}