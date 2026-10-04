document.addEventListener("DOMContentLoaded", () => {
  const selectBtn = document.getElementById("select-btn");
  const errorBox = document.getElementById("error-box");

  selectBtn.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showError("No active tab found.");
        return;
      }

      const url = tab.url || "";
      if (
        url.startsWith("chrome://") ||
        url.startsWith("edge://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("about:") ||
        url.startsWith("view-source:") ||
        url.startsWith("chrome-search://")
      ) {
        showError("FixLens cannot inspect this browser page.");
        return;
      }

      try {
        await chrome.tabs.sendMessage(tab.id, { action: "START_SELECTION" });
        window.close();
      } catch (err) {
        // Content script might need dynamic injection (e.g. if loaded before extension)
        try {
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["style.css"],
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          await chrome.tabs.sendMessage(tab.id, { action: "START_SELECTION" });
          window.close();
        } catch (injectErr) {
          showError("FixLens cannot inspect this page.");
        }
      }
    } catch (e) {
      showError("An unexpected error occurred.");
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  }
});
