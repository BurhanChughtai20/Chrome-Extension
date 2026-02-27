import { useState, useCallback } from 'react';
import type { UseTextSelectionReturn } from '../types/popup.type';

export const useTextSelection = (): UseTextSelectionReturn => {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSelection = useCallback(() => {
    if (!chrome?.tabs || !chrome.scripting) return;

    setIsLoading(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs?.[0];
      if (!activeTab?.id) {
        setIsLoading(false);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: () => window.getSelection()?.toString(),
        },
        (result) => {
          const selectedText = result?.[0]?.result;
          if (typeof selectedText === 'string' && selectedText.trim()) {
            setText(selectedText);
          }
          setIsLoading(false);
        }
      );
    });
  }, []);

  return { text, isLoading, fetchSelection, setText };
};