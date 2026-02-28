(() => {
  // ── Constants ────────────────────────────────────────────────────────────
  const FLOATING_BTN_ID     = "__cgpt-formatter-btn__";
  const MODAL_OVERLAY_ID    = "__cgpt-modal-overlay__";
  const STYLES_ID           = "__cgpt-formatter-styles__";
  const STORAGE_KEY_TEXT    = "selectedText";
  const STORAGE_KEY_TIME    = "selectedAt";
  const CLOSE_MODAL_ACTION  = "cgpt-close-modal";
  const MIN_SELECTION_LENGTH = 2;
  const BTN_EDGE_MARGIN_PX   = 60;
  const BTN_OFFSET_BELOW_PX  = 10;
  const IFRAME_WIDTH_PX      = 420;
  const IFRAME_HEIGHT_PX     = 560;
  const Z_INDEX_OVERLAY      = 2147483646;
  const Z_INDEX_BTN          = 2147483647;

  // ── State ────────────────────────────────────────────────────────────────
  let floatingBtn:   HTMLElement | null = null;
  let modalOverlay:  HTMLElement | null = null;
  let capturedText   = "";

  // Kept so we can removeEventListener with the exact same reference.
  let modalMessageHandler: ((e: MessageEvent) => void) | null = null;

  // ── Styles ───────────────────────────────────────────────────────────────
  function injectStyles(): void {
    if (document.getElementById(STYLES_ID)) return;

    const style = document.createElement("style");
    style.id = STYLES_ID;
    style.textContent = `
      @keyframes __cgpt-fadein__ {
        from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.95); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1);    }
      }
      #${FLOATING_BTN_ID} {
        position: fixed;
        z-index: ${Z_INDEX_BTN};
        transform: translateX(-50%);
        animation: __cgpt-fadein__ 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        pointer-events: auto;
      }
      #${FLOATING_BTN_ID} .inner {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 13px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        border-radius: 999px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(109,40,217,0.45), 0 1px 3px rgba(0,0,0,0.2);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        user-select: none;
        letter-spacing: 0.01em;
        border: 1px solid rgba(255,255,255,0.15);
        transition: box-shadow 0.15s, transform 0.1s;
      }
      #${FLOATING_BTN_ID} .inner:hover {
        box-shadow: 0 6px 20px rgba(109,40,217,0.6), 0 2px 6px rgba(0,0,0,0.25);
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }
      #${FLOATING_BTN_ID} .inner:active { transform: scale(0.96); }
      #${FLOATING_BTN_ID} svg { flex-shrink: 0; }

      #${MODAL_OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: ${Z_INDEX_OVERLAY};
        background: rgba(0, 0, 0, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: __cgpt-overlay-in__ 0.15s ease forwards;
        /* Ensure the overlay itself captures pointer events for click-outside */
        pointer-events: auto;
      }
      @keyframes __cgpt-overlay-in__ {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      #${MODAL_OVERLAY_ID} iframe {
        width: ${IFRAME_WIDTH_PX}px;
        height: ${IFRAME_HEIGHT_PX}px;
        border: none;
        border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        animation: __cgpt-modal-in__ 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        /* Prevent the iframe from swallowing backdrop clicks */
        pointer-events: auto;
      }
      @keyframes __cgpt-modal-in__ {
        from { opacity: 0; transform: scale(0.92) translateY(12px); }
        to   { opacity: 1; transform: scale(1)    translateY(0);     }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Floating button ───────────────────────────────────────────────────────
  function destroyFloatingBtn(): void {
    floatingBtn?.remove();
    floatingBtn = null;
  }

  function createFloatingBtn(x: number, y: number, text: string): void {
    destroyFloatingBtn();
    capturedText = text;
    injectStyles();

    const btn = document.createElement("div");
    btn.id = FLOATING_BTN_ID;

    const clampedX = Math.max(BTN_EDGE_MARGIN_PX, Math.min(x, window.innerWidth - BTN_EDGE_MARGIN_PX));
    btn.style.left = `${clampedX}px`;
    btn.style.top  = `${y}px`;

    btn.innerHTML = `
      <div class="inner">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Format with AI
      </div>
    `;

    // Prevent mousedown from immediately triggering the outside-click handler.
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      destroyFloatingBtn();
      openModal(capturedText);
    });

    document.body.appendChild(btn);
    floatingBtn = btn;
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  function destroyModal(): void {
    if (modalMessageHandler) {
      window.removeEventListener("message", modalMessageHandler);
      modalMessageHandler = null;
    }
    modalOverlay?.remove();
    modalOverlay = null;
  }

  function openModal(text: string): void {
    // Always destroy any existing modal before creating a new one.
    destroyModal();

    // Persist text BEFORE the iframe loads so PopupPage can read it immediately.
    chrome.storage.local.set({
      [STORAGE_KEY_TEXT]: text,
      [STORAGE_KEY_TIME]: Date.now(),
    });

    const overlay = document.createElement("div");
    overlay.id = MODAL_OVERLAY_ID;

    const iframe = document.createElement("iframe");
    iframe.src   = chrome.runtime.getURL("index.html");
    iframe.allow = "clipboard-write";

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    modalOverlay = overlay;

    // Click on the dark backdrop (not the iframe card) → close.
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) destroyModal();
    });

    // The iframe sends this message when the user closes from inside the card.
    // Store the reference so we can remove it when the modal is destroyed.
    modalMessageHandler = (e: MessageEvent) => {
      if (e.data?.action === CLOSE_MODAL_ACTION) destroyModal();
    };
    window.addEventListener("message", modalMessageHandler);
  }

  // ── Page-level event listeners ────────────────────────────────────────────

  // Show floating button after a text selection.
  document.addEventListener("mouseup", (e) => {
    // Ignore clicks on the floating button itself.
    if (floatingBtn?.contains(e.target as Node)) return;

    requestAnimationFrame(() => {
      const selection   = window.getSelection();
      const selectedText = selection?.toString().trim() ?? "";

      if (selectedText.length >= MIN_SELECTION_LENGTH && selection!.rangeCount > 0) {
        const range = selection!.getRangeAt(0);
        const rect  = range.getBoundingClientRect();
        createFloatingBtn(
          rect.left + rect.width / 2,
          rect.bottom + BTN_OFFSET_BELOW_PX,
          selectedText
        );
      } else {
        destroyFloatingBtn();
      }
    });
  });

  // Clicking anywhere outside the floating button dismisses it.
  document.addEventListener("mousedown", (e) => {
    if (floatingBtn && !floatingBtn.contains(e.target as Node)) {
      destroyFloatingBtn();
    }
  });

  // Escape key closes both the button and the modal.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      destroyFloatingBtn();
      destroyModal();
    }
  });

  // Scrolling dismisses the floating button (it would drift from the selection).
  window.addEventListener("scroll", () => destroyFloatingBtn(), { passive: true });
})();