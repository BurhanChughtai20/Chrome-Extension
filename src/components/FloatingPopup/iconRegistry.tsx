import type { ReactElement } from "react";
import { Sparkles, Frown, Smile, FileDown, FileText } from "lucide-react";

export const iconRegistry: Record<string, ReactElement> = {
  sparkles: <Sparkles size={14} />,
  frown:    <Frown size={14} />,
  smile:    <Smile size={14} />,
  fileDown: <FileDown size={14} />,
  fileText: <FileText size={14} />,
};