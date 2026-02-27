import { exportDOCX, exportPDF } from "../../shared";

 export const exportActionRegistry: Record<string, (text: string) => void> = {
  exportPDF,
  exportDOCX,
};