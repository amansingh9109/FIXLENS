(() => {
  // Prevent duplicate script injection
  if (window.__FIXLENS_INITIALIZED__) {
    return;
  }
  window.__FIXLENS_INITIALIZED__ = true;

  const BACKEND_URL = "http://localhost:8000/api/v1/quick-analyze";

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_SELECTION") {
      startSelection();
      sendResponse({ status: "started" });
    }
  });

  function removeElement(id) {
    const el = document.getElementById(id);
    if (el) {
      el.remove();
    }
  }

  function showToast(text, duration = 2500) {
    removeElement("fixlens-toast");
    const toast = document.createElement("div");
    toast.id = "fixlens-toast";
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }

  function startSelection() {
    // Clean up any existing elements
    removeElement("fixlens-overlay");
    removeElement("fixlens-panel");
    removeElement("fixlens-toast");

    let startX = 0;
    let startY = 0;
    let isSelecting = false;

    const overlay = document.createElement("div");
    overlay.id = "fixlens-overlay";

    const selectionBox = document.createElement("div");
    selectionBox.id = "fixlens-selection-box";
    selectionBox.style.display = "none";

    const badge = document.createElement("div");
    badge.className = "fixlens-dimension-badge";
    selectionBox.appendChild(badge);

    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);

    function cleanup() {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
      removeElement("fixlens-overlay");
    }

    function onMouseDown(e) {
      if (e.button !== 0) return; // Left click only
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;

      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = "0px";
      selectionBox.style.height = "0px";
      selectionBox.style.display = "block";
      badge.textContent = "0 × 0 px";
    }

    function onMouseMove(e) {
      if (!isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.style.left = `${left}px`;
      selectionBox.style.top = `${top}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
      badge.textContent = `${width} × ${height} px`;
    }

    function onMouseUp(e) {
      if (!isSelecting) return;
      isSelecting = false;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      cleanup();

      if (width < 10 || height < 10) {
        showToast("Selection too small. Please select the problem area again.");
        return;
      }

      const bounds = {
        x: left,
        y: top,
        width: width,
        height: height,
        dpr: window.devicePixelRatio || 1,
      };

      captureAndAnalyze(bounds);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        cleanup();
        showToast("Selection cancelled.");
      }
    }

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);
  }

  function createPanel() {
    removeElement("fixlens-panel");
    const panel = document.createElement("div");
    panel.id = "fixlens-panel";
    document.body.appendChild(panel);
    return panel;
  }

  function showLoadingPanel() {
    const panel = createPanel();
    panel.innerHTML = `
      <div class="fixlens-header">
        <div class="fixlens-header-title">
          🔍 <span>FixLens</span>
        </div>
        <button class="fixlens-close-btn" id="fixlens-close">✕</button>
      </div>
      <div class="fixlens-body">
        <div class="fixlens-loading-container">
          <div class="fixlens-spinner"></div>
          <div class="fixlens-loading-text">Analyzing selected area...</div>
        </div>
      </div>
    `;

    document.getElementById("fixlens-close").addEventListener("click", () => {
      removeElement("fixlens-panel");
    });
  }

  function showErrorPanel(title, description, retryCallback) {
    const panel = createPanel();
    panel.innerHTML = `
      <div class="fixlens-header">
        <div class="fixlens-header-title">
          🔍 <span>FixLens</span>
        </div>
        <button class="fixlens-close-btn" id="fixlens-close">✕</button>
      </div>
      <div class="fixlens-body">
        <div class="fixlens-error-container">
          <div class="fixlens-error-title">${escapeHtml(title)}</div>
          <div class="fixlens-error-desc">${escapeHtml(description)}</div>
        </div>
      </div>
      <div class="fixlens-footer">
        ${retryCallback ? '<button class="fixlens-btn fixlens-btn-primary" id="fixlens-retry">↻ Retry</button>' : ""}
        <button class="fixlens-btn fixlens-btn-secondary" id="fixlens-reselect">Select Again</button>
      </div>
    `;

    document.getElementById("fixlens-close").addEventListener("click", () => {
      removeElement("fixlens-panel");
    });

    if (retryCallback) {
      document.getElementById("fixlens-retry").addEventListener("click", retryCallback);
    }

    document.getElementById("fixlens-reselect").addEventListener("click", () => {
      startSelection();
    });
  }

  function showResultPanel(data, reanalyzeBlob) {
    const panel = createPanel();

    const confidencePct = Math.round((data.confidence || 0.8) * 100);
    const solutions = Array.isArray(data.solution) ? data.solution : [];

    const solutionHtml = solutions.length > 0
      ? `<ol class="fixlens-solution-list">${solutions.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
      : '<p class="fixlens-section-content">No specific steps suggested.</p>';

    panel.innerHTML = `
      <div class="fixlens-header">
        <div class="fixlens-header-title">
          🔍 <span>FixLens</span>
        </div>
        <button class="fixlens-close-btn" id="fixlens-close">✕</button>
      </div>
      <div class="fixlens-body">
        <div class="fixlens-section">
          <div class="fixlens-section-label">What I See</div>
          <div class="fixlens-section-content">${escapeHtml(data.problem || "Issue detected.")}</div>
        </div>
        
        <div class="fixlens-section">
          <div class="fixlens-section-label">Possible Cause</div>
          <div class="fixlens-section-content">${escapeHtml(data.possible_cause || "Not specified.")}</div>
        </div>
        
        <div class="fixlens-section">
          <div class="fixlens-section-label">How to Fix</div>
          ${solutionHtml}
        </div>
        
        <div class="fixlens-meta-row">
          <div class="fixlens-confidence-badge">
            <span>Confidence:</span>
            <strong>${confidencePct}%</strong>
          </div>
        </div>
      </div>
      <div class="fixlens-footer">
        <button class="fixlens-btn fixlens-btn-primary" id="fixlens-reselect">🎯 Select Again</button>
      </div>
    `;

    document.getElementById("fixlens-close").addEventListener("click", () => {
      removeElement("fixlens-panel");
    });

    document.getElementById("fixlens-reselect").addEventListener("click", () => {
      startSelection();
    });
  }

  async function captureAndAnalyze(bounds) {
    showLoadingPanel();

    chrome.runtime.sendMessage({ action: "CAPTURE_VISIBLE_TAB" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success || !response.dataUrl) {
        showErrorPanel(
          "Capture Error",
          "Couldn't capture this area. Please select it again.",
          () => startSelection()
        );
        return;
      }

      cropAndSend(response.dataUrl, bounds);
    });
  }

  function cropAndSend(dataUrl, bounds) {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const dpr = bounds.dpr || 1;

        const cropX = Math.max(0, Math.min(img.naturalWidth, bounds.x * dpr));
        const cropY = Math.max(0, Math.min(img.naturalHeight, bounds.y * dpr));
        const cropW = Math.max(1, Math.min(img.naturalWidth - cropX, bounds.width * dpr));
        const cropH = Math.max(1, Math.min(img.naturalHeight - cropY, bounds.height * dpr));

        canvas.width = cropW;
        canvas.height = cropH;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        canvas.toBlob((blob) => {
          if (!blob) {
            showErrorPanel(
              "Processing Error",
              "Couldn't process the selected screenshot. Please try again.",
              () => startSelection()
            );
            return;
          }
          sendImageToBackend(blob);
        }, "image/png");
      } catch (err) {
        showErrorPanel(
          "Image Processing Failed",
          "An error occurred while cropping the image. Please select again.",
          () => startSelection()
        );
      }
    };

    img.onerror = () => {
      showErrorPanel(
        "Capture Error",
        "Couldn't load tab capture for cropping. Please retry.",
        () => startSelection()
      );
    };

    img.src = dataUrl;
  }

  async function sendImageToBackend(blob) {
    showLoadingPanel();

    const formData = new FormData();
    formData.append("image", blob, "screenshot.png");
    formData.append("question", "Explain what appears to be wrong in this selected area and how I can fix it.");
    formData.append("page_url", window.location.href);
    formData.append("page_title", document.title || "");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMessage = "FixLens couldn't analyze this area.";
        try {
          const errData = await response.json();
          if (errData && errData.detail && typeof errData.detail === "object" && errData.detail.message) {
            errMessage = errData.detail.message;
          } else if (errData && typeof errData.detail === "string") {
            errMessage = errData.detail;
          }
        } catch (_) {}

        showErrorPanel(
          "Analysis Failed",
          errMessage,
          () => sendImageToBackend(blob)
        );
        return;
      }

      const data = await response.json();
      showResultPanel(data, blob);
    } catch (netErr) {
      showErrorPanel(
        "Backend Unavailable",
        "FixLens backend is unavailable. Ensure the backend server is running on http://localhost:8000.",
        () => sendImageToBackend(blob)
      );
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
