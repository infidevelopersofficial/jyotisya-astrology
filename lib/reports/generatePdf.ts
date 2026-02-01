import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generates a PDF from a hidden DOM element.
 * 
 * @param elementId The ID of the root element containing PdfPage components
 * @param fileName The name of the output file (e.g., 'chart.pdf')
 */
export async function generatePdf(elementId: string, fileName: string = "report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID '${elementId}' not found`);
  }

  // 1. Setup jsPDF (A4, Portrait, Millimeters)
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // 2. Find all 'PdfPage' children
  // We assume the strict structure: Root -> PdfPage -> Content
  // Actually, html2canvas works best if we capture each page individually.
  // We rely on the structure of having div children that represent pages.
  const pages = Array.from(element.children) as HTMLElement[];

  if (pages.length === 0) {
     // If no specific page structure, try capturing the whole thing (fallback)
     // But our design strictly uses PdfPage
     console.warn("No pages found in PDF root. Attempting full capture.");
  }

  // 3. Loop and Capture
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    // Skip if not an HTML element
    if (!(page instanceof HTMLElement)) continue;

    // Add new page for subsequent iterations
    if (i > 0) pdf.addPage();

    // Capture
    // scale: 2 improves quality (Retina-like) but increases size
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true, // For external images
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    // Add to PDF
    // We strictly match A4 size, so no scaling logic needed if CSS matches 210mm x 297mm
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  }

  // 4. Save
  pdf.save(fileName);
}
