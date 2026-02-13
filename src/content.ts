import { cleanFormatting } from "./utils/textUtils";

// -----------------------------
// Type-safe Debounce Utility
// -----------------------------
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 150): T {
  let timeoutId: number | undefined;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn.apply(this, args), delay);
  } as T;
}

// -----------------------------
// Helper: Apply multiple styles
// -----------------------------
function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

// -----------------------------
// Helper: Create button with icon
// -----------------------------
function createButton(
  label: string,
  svgPath: string,
  onClick: () => void
): HTMLButtonElement {
  const btn = document.createElement("button");
  applyStyles(btn, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    flex: "1",
    padding: "5px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
  });

  // Create icon
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "16");
  icon.setAttribute("height", "16");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", svgPath);
  icon.appendChild(path);

  btn.appendChild(icon);
  btn.appendChild(document.createTextNode(label));
  btn.addEventListener("click", onClick);

  return btn;
}

// -----------------------------
// Floating Popup DOM
// -----------------------------
let popup: HTMLDivElement | null = null;

function createPopup(text: string, x: number, y: number): void {
  popup?.remove();

  popup = document.createElement("div");
  popup.id = "textpro-popup";
  applyStyles(popup, {
    position: "fixed",
    top: `${y + 10}px`,
    left: `${x + 10}px`,
    background: "#1a202c",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    zIndex: "999999",
    minWidth: "200px",
    maxWidth: "400px",
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  });

  const textarea = document.createElement("textarea");
  textarea.value = text;
  applyStyles(textarea, {
    width: "100%",
    height: "80px",
    resize: "none",
  });
  popup.appendChild(textarea);

  const buttons = document.createElement("div");
  applyStyles(buttons, {
    display: "flex",
    justifyContent: "space-between",
    gap: "5px",
  });

  // Lucide icon paths for Sparkles and Copy
  const SPARKLES_PATH =
    "M5 15l4 4L19 7M12 5h0M12 19h0M5 5h0M19 19h0"; // replace with actual path from lucide
  const COPY_PATH =
    "M16 4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2h-8c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V6c0-2.21-1.79-4-4-4z";

  const cleanBtn = createButton("Clean", SPARKLES_PATH, () => {
    textarea.value = cleanFormatting(textarea.value);
  });

  const copyBtn = createButton("Copy", COPY_PATH, async () => {
    await navigator.clipboard.writeText(textarea.value);
    copyBtn.childNodes[1].textContent = "Copied! ✓";
    setTimeout(() => (copyBtn.childNodes[1].textContent = "Copy"), 1500);
  });

  buttons.appendChild(cleanBtn);
  buttons.appendChild(copyBtn);
  popup.appendChild(buttons);

  document.body.appendChild(popup);
}

// -----------------------------
// Close popup if click outside
// -----------------------------
document.addEventListener("mousedown", (event: MouseEvent) => {
  if (popup && !popup.contains(event.target as Node)) {
    popup.remove();
    popup = null;
  }
});

// -----------------------------
// Auto-popup on text selection
// -----------------------------
const handleSelection = debounce(() => {
  const selection = window.getSelection()?.toString().trim();
  if (!selection) {
    popup?.remove();
    popup = null;
    return;
  }

  const range = window.getSelection()?.getRangeAt(0);
  const rect = range?.getBoundingClientRect();
  if (!rect) return;

  createPopup(selection, rect.left + window.scrollX, rect.bottom + window.scrollY);
}, 100);

document.addEventListener("mouseup", handleSelection);
document.addEventListener("keyup", handleSelection);
