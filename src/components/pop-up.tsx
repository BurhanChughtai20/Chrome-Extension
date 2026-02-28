import React, { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, X, Sparkles } from "lucide-react";
import { getUserUUID, useToolsConfig } from "../shared";

const STORAGE_KEY_SELECTED_TEXT = "selectedText";
const CLOSE_MODAL_ACTION = "cgpt-close-modal";
const COPIED_RESET_DELAY_MS = 2000;
const UUID_PREVIEW_LENGTH = 8;

const CARD_WIDTH = 400;
const TEXTAREA_HEIGHT = 150;

const COLOR = {
  surface: "#0f0f13",
  border: "rgba(255,255,255,0.08)",
  borderFocus: "rgba(124,58,237,0.55)",
  borderHover: "rgba(124,58,237,0.35)",
  divider: "rgba(255,255,255,0.06)",
  text: "#e5e7eb",
  textMuted: "#555",
  textDim: "#444",
  textClose: "#777",
  purple: "#c4b5fd",
  purpleExport: "#a78bfa",
  purpleBg: "rgba(124,58,237,0.14)",
  purpleBorder: "rgba(124,58,237,0.28)",
  purpleGradient: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.18))",
  logoGradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
  surfaceSubtle: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  surfaceClose: "rgba(255,255,255,0.06)",
  surfaceCloseHover: "rgba(255,255,255,0.13)",
  pillBg: "rgba(255,255,255,0.05)",
  copyActiveBg: "rgba(34,197,94,0.15)",
  copyActiveBorder: "rgba(34,197,94,0.35)",
  statusReady: "#22c55e",
  statusReadyBg: "rgba(34,197,94,0.1)",
  statusLoading: "#eab308",
  statusLoadingBg: "rgba(234,179,8,0.1)",
  white: "#fff",
} as const;

const SPRING_CARD = { type: "spring", stiffness: 420, damping: 32 } as const;
const PULSE_STATUS = { duration: 1.8, repeat: Infinity } as const;

const isChromeStorageAvailable = (): boolean =>
  typeof chrome !== "undefined" &&
  typeof chrome?.storage?.local?.get === "function";

const PopupPage = (): ReactNode => {
  const uuid = useMemo(() => getUserUUID(), []);
  const { optimizationTools, exportActions } = useToolsConfig();

  const [text, setText] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => isChromeStorageAvailable());
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isChromeStorageAvailable()) return;

    chrome.storage.local.get([STORAGE_KEY_SELECTED_TEXT], (result: Record<string, unknown>) => {
      const stored = result[STORAGE_KEY_SELECTED_TEXT];
      startTransition(() => {
        if (typeof stored === "string" && stored.trim().length > 0) {
          setText(stored);
        }
        setIsLoading(false);
      });
    });

    const onStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      const updated = changes[STORAGE_KEY_SELECTED_TEXT]?.newValue;
      if (typeof updated === "string") {
        startTransition(() => setText(updated));
      }
    };

    chrome.storage.onChanged.addListener(onStorageChange);
    return () => chrome.storage.onChanged.removeListener(onStorageChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = useCallback(() => {
    window.parent.postMessage({ action: CLOSE_MODAL_ACTION }, "*");
  }, []);

  useEffect(() => {
    const onEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onEscapeKey);
    return () => window.removeEventListener("keydown", onEscapeKey);
  }, [closeModal]);

  const copyToClipboard = useCallback(async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_RESET_DELAY_MS);
  }, [text]);

  const applyTextTool = useCallback((transform: (t: string) => string) => {
    setText((prev) => transform(prev));
  }, []);

  const runExportAction = useCallback((exportFn: (t: string) => void) => {
    if (!text.trim()) return;
    exportFn(text);
  }, [text]);

  const isTextEmpty = !text.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div style={s.root}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={SPRING_CARD}
        style={s.card}
      >
        <div style={s.header}>
          <div style={s.row}>
            <div style={s.logoBox}>
              <Sparkles size={13} color={COLOR.white} />
            </div>
            <div>
              <div style={s.logoText}>TextPro</div>
              <div style={s.version}>v1.0</div>
            </div>
          </div>

          <div style={s.row}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={PULSE_STATUS}
              style={{
                ...s.statusDot,
                background: isLoading ? COLOR.statusLoading : COLOR.statusReady,
              }}
            />
            <button
              onClick={closeModal}
              style={s.closeBtn}
              onMouseEnter={(e) =>
                Object.assign((e.currentTarget as HTMLButtonElement).style, {
                  background: COLOR.surfaceCloseHover,
                  color: COLOR.white,
                })
              }
              onMouseLeave={(e) =>
                Object.assign((e.currentTarget as HTMLButtonElement).style, {
                  background: COLOR.surfaceClose,
                  color: COLOR.textClose,
                })
              }
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div style={s.body}>
          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isLoading ? "Loading selected text…" : "Selected text will appear here…"}
              style={s.textarea}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLOR.borderFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLOR.border; }}
            />

            <motion.button
              whileTap={!isTextEmpty ? { scale: 0.92 } : {}}
              onClick={copyToClipboard}
              disabled={isTextEmpty}
              style={{
                ...s.copyBtn,
                background: isCopied ? COLOR.copyActiveBg : COLOR.surfaceHover,
                borderColor: isCopied ? COLOR.copyActiveBorder : COLOR.border,
                color: isCopied ? COLOR.statusReady : "#aaa",
                opacity: isTextEmpty ? 0.35 : 1,
                cursor: isTextEmpty ? "not-allowed" : "pointer",
              }}
            >
              <AnimatePresence mode="wait">
                {isCopied ? (
                  <motion.span key="check" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} style={s.btnInner}>
                    <Check size={11} /> Copied!
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} style={s.btnInner}>
                    <Copy size={11} /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          <div>
            <p style={s.sectionLabel}>Optimization Tools</p>
            <div style={s.twoCol}>
              {optimizationTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={!isTextEmpty ? { scale: 1.02 } : {}}
                  whileTap={!isTextEmpty ? { scale: 0.96 } : {}}
                  onClick={() => applyTextTool(tool.action)}
                  disabled={isTextEmpty}
                  style={{ ...s.toolBtn, opacity: isTextEmpty ? 0.35 : 1, cursor: isTextEmpty ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => {
                    if (isTextEmpty) return;
                    Object.assign((e.currentTarget as HTMLButtonElement).style, {
                      background: COLOR.purpleBg,
                      borderColor: COLOR.borderHover,
                    });
                  }}
                  onMouseLeave={(e) => {
                    Object.assign((e.currentTarget as HTMLButtonElement).style, {
                      background: COLOR.surfaceSubtle,
                      borderColor: COLOR.border,
                    });
                  }}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.twoCol}>
            {exportActions.map((item) => (
              <motion.button
                key={item.id}
                whileHover={!isTextEmpty ? { scale: 1.02 } : {}}
                whileTap={!isTextEmpty ? { scale: 0.96 } : {}}
                onClick={() => runExportAction(item.action)}
                disabled={isTextEmpty}
                style={{ ...s.exportBtn, opacity: isTextEmpty ? 0.35 : 1, cursor: isTextEmpty ? "not-allowed" : "pointer" }}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          <div style={s.footer}>
            <span style={s.sessionText}>Session: {uuid.slice(0, UUID_PREVIEW_LENGTH)}</span>
            <div style={s.row}>
              <span style={s.pill}>{wordCount} words</span>
              <span style={{
                ...s.pill,
                fontWeight: 600,
                color: isLoading ? COLOR.statusLoading : COLOR.statusReady,
                background: isLoading ? COLOR.statusLoadingBg : COLOR.statusReadyBg,
              }}>
                {isLoading ? "Loading…" : "Ready"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const s = {
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    width: CARD_WIDTH,
    background: COLOR.surface,
    borderRadius: 20,
    border: `1px solid ${COLOR.border}`,
    boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 18px 12px",
    borderBottom: `1px solid ${COLOR.divider}`,
  },
  row: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: COLOR.logoGradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { fontSize: 14, fontWeight: 700, color: COLOR.white, letterSpacing: "-0.01em" },
  version: { fontSize: 10, color: COLOR.textMuted, marginTop: -1 },
  statusDot: { width: 7, height: 7, borderRadius: "50%" },
  closeBtn: {
    background: COLOR.surfaceClose,
    border: "none",
    borderRadius: 8,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: COLOR.textClose,
    transition: "background 0.15s, color 0.15s",
  },
  body: {
    padding: "15px 18px 18px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  textarea: {
    width: "100%",
    height: TEXTAREA_HEIGHT,
    background: COLOR.surfaceSubtle,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 12,
    padding: "11px 13px 42px",
    color: COLOR.text,
    fontSize: 13,
    lineHeight: 1.6,
    resize: "none" as const,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  },
  copyBtn: {
    position: "absolute" as const,
    bottom: 9,
    right: 9,
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 10px",
    border: "1px solid",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.15s",
  },
  btnInner: { display: "flex", alignItems: "center", gap: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: COLOR.textMuted,
    marginBottom: 8,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 },
  toolBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 11px",
    background: COLOR.surfaceSubtle,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 10,
    color: COLOR.purple,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "inherit",
    textAlign: "left" as const,
    transition: "background 0.15s, border-color 0.15s",
  },
  divider: { height: 1, background: COLOR.divider },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "9px 11px",
    background: COLOR.purpleGradient,
    border: `1px solid ${COLOR.purpleBorder}`,
    borderRadius: 10,
    color: COLOR.purpleExport,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTop: `1px solid ${COLOR.divider}`,
  },
  sessionText: { fontSize: 10, color: COLOR.textDim, fontFamily: "monospace" },
  pill: {
    fontSize: 10,
    color: COLOR.textMuted,
    background: COLOR.pillBg,
    padding: "2px 8px",
    borderRadius: 999,
  },
} satisfies Record<string, React.CSSProperties>;

export default PopupPage;