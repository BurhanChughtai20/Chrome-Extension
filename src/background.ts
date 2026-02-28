// src/background.ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "openPopup") {
    // Text is saved by content.ts directly — nothing needed here anymore
    sendResponse({ ok: true });
  }
  return true;
});