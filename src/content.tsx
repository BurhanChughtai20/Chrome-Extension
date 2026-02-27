import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Copy, Check, Type } from "lucide-react";
import { Button } from "@chakra-ui/react";
import { cleanText } from "./shared";

interface ContentPopupProps {
  delay?: number;
}

const ContentPopup: React.FC<ContentPopupProps> = ({ delay = 100 }) => {
  const [selection, setSelection] = useState<string>("");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    
    if (!sel || sel.rangeCount === 0) {
      if (!popupRef.current?.contains(document.activeElement)) {
        setIsVisible(false);
      }
      return;
    }

    const text = sel.toString().trim();
    if (!text) {
      setIsVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelection(text);
    setCoords({
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let timeoutId: number;
    
    const debouncedHandle = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleSelection, delay);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mouseup", debouncedHandle);
    document.addEventListener("keyup", debouncedHandle);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", debouncedHandle);
      document.removeEventListener("keyup", debouncedHandle);
      document.removeEventListener("mousedown", handleClickOutside);
      window.clearTimeout(timeoutId);
    };
  }, [handleSelection, delay]);

  const handleClean =async (): Promise<void> =>{
  if (!selection.trim()) return;

  try {
    const cleaned = await cleanText(selection);
    setSelection(cleaned);
  } catch (err) {
    console.error("Failed to clean text", err);
  }
};

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(selection);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #444",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: "#262626",
    color: "white",
    transition: "all 0.2s ease",
    outline: "none",
  };

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: coords.y,
        left: coords.x,
        background: "#121212",
        color: "#ffffff",
        padding: "12px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
        zIndex: 9999,
        minWidth: "240px",
        maxWidth: "380px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #333",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: 0.8 }}>
        <Type size={14} />
        <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Text Optimizer
        </span>
      </div>

      <textarea
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
        style={{
          width: "100%",
          height: "90px",
          resize: "none",
          background: "#1e1e1e",
          border: "1px solid #444",
          color: "#e0e0e0",
          borderRadius: "6px",
          padding: "8px",
          fontSize: "13px",
          lineHeight: "1.4",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "8px" }}>
        <Button type="button" onClick={handleClean} style={buttonStyle}>
          <Sparkles size={14} style={{ color: "#a78bfa" }} />
          Clean
        </Button>
        <Button type="button" onClick={handleCopy} style={buttonStyle}>
          {isCopied ? (
            <Check size={14} style={{ color: "#4ade80" }} />
          ) : (
            <Copy size={14} style={{ color: "#60a5fa" }} />
          )}
          {isCopied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
};

export default ContentPopup;