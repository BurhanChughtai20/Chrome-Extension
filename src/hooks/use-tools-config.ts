import { useMemo } from 'react';  
import type { ExportAction, ToolAction, ToolsConfig } from '../types/popup.type'; 
import { exportActionRegistry, iconRegistry, textActionRegistry, toolsConfig } from '../shared';

export const useToolsConfig = () => {
  return useMemo(() => {
    const config = toolsConfig as ToolsConfig;

    const optimizationTools: ToolAction[] = config.optimizationTools.map((tool) => ({
      id: tool.id,
      label: tool.label,
      icon: iconRegistry[tool.icon],
      action: textActionRegistry[tool.action],
    }));

    const exportActions: ExportAction[] = config.exportActions.map((item) => ({
      id: item.id,
      label: item.label,
      icon: iconRegistry[item.icon],
      action: exportActionRegistry[item.action],
      colorPalette: item.colorPalette,
    }));

    return { optimizationTools, exportActions };
  }, []);
};
