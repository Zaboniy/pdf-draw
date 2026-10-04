// Chrome Extension Service Worker (Manifest V3)
// Handles toolbar icon clicks: detects active tab PDF, opens extension tab.

const CHROME_PDF_VIEWER_PREFIX = 'chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai';
const TAB_PDF_HINT_KEY = 'tabPDFHint';
const HINT_TTL_MS = 30_000;

function isPDFUrl(url) {
  if (!url) return false;
  try {
    const lower = url.toLowerCase();
    // Bare .pdf URL
    if (lower.endsWith('.pdf')) return true;
    // .pdf with query string / fragment
    const parsed = new URL(url);
    if (parsed.pathname.toLowerCase().endsWith('.pdf')) return true;
    // Chrome built-in PDF viewer wraps the URL
    if (url.startsWith(CHROME_PDF_VIEWER_PREFIX)) return true;
  } catch {
    // Invalid URL — not a PDF
  }
  return false;
}

async function fetchPDFBytes(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  } catch {
    return null;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  const extensionUrl = chrome.runtime.getURL('index.html');

  if (isPDFUrl(tab.url)) {
    // Attempt to pre-fetch the PDF bytes so the extension tab can load immediately
    const pdfBytes = await fetchPDFBytes(tab.url);
    await chrome.storage.session.set({
      [TAB_PDF_HINT_KEY]: {
        url: tab.url,
        pdfBytes,          // Array<number> | null
        timestamp: Date.now(),
      },
    });
  } else {
    // Clear any stale hint so the extension tab shows the file upload prompt
    await chrome.storage.session.remove(TAB_PDF_HINT_KEY);
  }

  chrome.tabs.create({ url: extensionUrl });
});
