import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const exportPDF = (text: string) => {
  const doc = new jsPDF();
  const splitText = doc.splitTextToSize(text, 180);
  doc.text(splitText, 10, 10);
  doc.save("chatgpt-optimized.pdf");
};

export const exportDOCX = async (text: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [new Paragraph({ children: [new TextRun(text)] })],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "chatgpt-optimized.docx");
};