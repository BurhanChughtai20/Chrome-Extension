import type { Dispatch, ReactElement, SetStateAction } from "react";

export interface ToolAction {
  id: string;
  label: string;
  icon: ReactElement;
  action: (text: string) => string;
}

export interface ExportAction {
  id: string;
  label: string;
  icon: ReactElement;
  action: (text: string) => void;
  colorPalette: string;
}

/* JSON Raw Types */

export interface RawToolConfig {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface RawExportConfig extends RawToolConfig {
  colorPalette: string;
}

export interface ToolsConfig {
  optimizationTools: RawToolConfig[];
  exportActions: RawExportConfig[];
}

export interface FloatingPopupProps {
  initialText: string;
  x: number;
  y: number;
  onClose: () => void;
}

export interface UseTextSelectionReturn {
  text: string;
  isLoading: boolean;
  fetchSelection: () => void;
  setText: Dispatch<SetStateAction<string>>;
}