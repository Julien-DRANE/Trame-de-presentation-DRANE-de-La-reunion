(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.services = ns.services || {};

  const DB_NAME = "studio-ingenierie-html-assets";
  const DB_VERSION = 1;
  const STORE_NAME = "htmlAssets";
  const sourceCache = new Map();
  const urlCache = new Map();

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function withStore(mode, run) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const result = run(store, tx);

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async function getRecord(id) {
    if (!id) {
      return null;
    }

    try {
      return await withStore("readonly", (store) => new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      }));
    } catch (error) {
      return null;
    }
  }

  function sanitizeAssetMeta(input) {
    if (!input || typeof input !== "object") {
      return null;
    }

    return {
      id: typeof input.id === "string" && input.id ? input.id : ns.utils.createId("html-asset"),
      name: ns.utils.clampText(input.name, 180) || "Animation HTML",
      mimeType: ns.utils.clampText(input.mimeType, 120) || "text/html",
      size: Number.isFinite(Number(input.size)) ? Math.max(0, Number(input.size)) : 0,
    };
  }

  function isHtmlFile(file) {
    if (!file) {
      return false;
    }

    const mimeType = String(file.type || "").toLowerCase();
    const name = String(file.name || "").toLowerCase();
    return mimeType === "text/html" || /\.html?$/i.test(name);
  }

  function createBridgeScript() {
    return `<script>
(function () {
  if (window.__studioHtmlBridge) {
    return;
  }

  function getAnimZones() {
    return Array.from(document.querySelectorAll(".anim-zone"));
  }

  function countHiddenZones() {
    return getAnimZones().filter((item) => Number(window.getComputedStyle(item).opacity || "1") < 0.98).length;
  }

  function createKeyboardPayload(command) {
    if (command === "arrow-left") {
      return { key: "ArrowLeft", code: "ArrowLeft" };
    }
    if (command === "arrow-up") {
      return { key: "ArrowUp", code: "ArrowUp" };
    }
    if (command === "arrow-down") {
      return { key: "ArrowDown", code: "ArrowDown" };
    }
    return command === "arrow-right"
      ? { key: "ArrowRight", code: "ArrowRight" }
      : { key: " ", code: "Space" };
  }

  function commandFromKeyboardEvent(event) {
    if (!event || !event.isTrusted) {
      return "";
    }
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " " || event.code === "Space") {
      return event.key === "ArrowRight"
        ? "arrow-right"
        : event.key === "PageDown"
          ? "arrow-down"
          : "space";
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
      return event.key === "ArrowLeft" ? "arrow-left" : "arrow-up";
    }
    return "";
  }

  function dispatchCommand(command) {
    if (command === "click") {
      const target = document.querySelector("#stage") || document.body;
      if (!target) {
        return;
      }
      target.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }));
      return;
    }

    const payload = createKeyboardPayload(command);
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key: payload.key,
      code: payload.code,
      bubbles: true,
      cancelable: true,
    }));
  }

  function handleCommand(command) {
    var startedBefore = typeof started === "boolean" ? started : false;
    var stepBefore = typeof currentStepIndex === "number" ? currentStepIndex : 0;
    const before = countHiddenZones();
    dispatchCommand(command);
    const after = countHiddenZones();
    return {
      command: command,
      consumed:
        (before > 0 && after < before) ||
        (typeof started === "boolean" && started !== startedBefore) ||
        (typeof currentStepIndex === "number" && currentStepIndex > stepBefore),
      remaining: after,
      total: getAnimZones().length,
      started: typeof started === "boolean" ? started : false,
      stepIndex: typeof currentStepIndex === "number" ? currentStepIndex : 0,
    };
  }

  window.addEventListener("keydown", function (event) {
    const command = commandFromKeyboardEvent(event);
    if (!command) {
      return;
    }
    if (event.target && event.target.matches && event.target.matches("input, textarea, select, [contenteditable='true']")) {
      return;
    }
    const result = handleCommand(command);
    event.preventDefault();
    event.stopPropagation();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "studio-html-forward",
        command: command,
        consumed: Boolean(result.consumed),
      }, "*");
    }
  }, true);

  window.__studioHtmlBridge = { handleCommand: handleCommand };

  function notifyReady() {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "studio-html-ready",
      }, "*");
    }
  }

  window.addEventListener("message", function (event) {
    const data = event && event.data && typeof event.data === "object" ? event.data : null;
    if (!data || data.type !== "studio-html-command") {
      return;
    }

    const result = handleCommand(data.command);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "studio-html-command-result",
        requestId: data.requestId || "",
        consumed: Boolean(result.consumed),
        remaining: Number(result.remaining) || 0,
        total: Number(result.total) || 0,
      }, "*");
    }
  });

  if (document.readyState === "complete") {
    notifyReady();
  } else {
    window.addEventListener("load", notifyReady, { once: true });
  }
})();
</script>`;
  }

  function prepareRuntimeSource(source) {
    const raw = String(source || "");
    if (!raw.trim()) {
      return "";
    }
    if (raw.includes("window.__studioHtmlBridge")) {
      return raw;
    }

    const bridgeScript = createBridgeScript();
    if (/<\/body>/i.test(raw)) {
      return raw.replace(/<\/body>/i, `${bridgeScript}\n</body>`);
    }
    if (/<\/html>/i.test(raw)) {
      return raw.replace(/<\/html>/i, `${bridgeScript}\n</html>`);
    }
    return `${raw}\n${bridgeScript}`;
  }

  function updateRuntimeUrl(id, source) {
    const previousUrl = urlCache.get(id);
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    const runtimeSource = prepareRuntimeSource(source);
    const blob = new Blob([runtimeSource], { type: "text/html;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    urlCache.set(id, objectUrl);
    sourceCache.set(id, String(source || ""));
    return objectUrl;
  }

  async function importFile(file) {
    if (!isHtmlFile(file)) {
      throw new Error("unsupported-html-file");
    }

    const source = await file.text();
    const record = {
      id: ns.utils.createId("html-asset"),
      name: ns.utils.clampText(file.name || "animation.html", 180) || "animation.html",
      mimeType: ns.utils.clampText(file.type || "text/html", 120) || "text/html",
      size: Number(file.size) || source.length,
      source,
    };

    updateRuntimeUrl(record.id, record.source);
    try {
      await withStore("readwrite", (store) => {
        store.put(record);
      });
    } catch (error) {
      // Fallback session-only when IndexedDB is unavailable.
    }
    return sanitizeAssetMeta(record);
  }

  async function ensureRuntimeUrl(id) {
    if (!id) {
      return "";
    }
    if (urlCache.has(id)) {
      return urlCache.get(id) || "";
    }

    const record = await getRecord(id);
    if (!record || typeof record.source !== "string") {
      return "";
    }

    return updateRuntimeUrl(id, record.source);
  }

  async function hydrateSlides(slides) {
    const assetIds = (slides || [])
      .map((slide) => slide && slide.htmlEmbed && slide.htmlEmbed.assetId)
      .filter(Boolean);

    for (const assetId of assetIds) {
      await ensureRuntimeUrl(assetId);
    }
  }

  async function resolveExportSourceMap(slides) {
    const result = {};
    const assetIds = Array.from(new Set((slides || [])
      .map((slide) => slide && slide.htmlEmbed && slide.htmlEmbed.assetId)
      .filter(Boolean)));

    for (const assetId of assetIds) {
      const source = sourceCache.has(assetId)
        ? sourceCache.get(assetId)
        : ((await getRecord(assetId)) || {}).source;
      if (!source) {
        continue;
      }
      sourceCache.set(assetId, source);
      result[assetId] = prepareRuntimeSource(source);
    }

    return result;
  }

  async function exportRawSourceMap(slides) {
    const result = {};
    const assetIds = Array.from(new Set((slides || [])
      .map((slide) => slide && slide.htmlEmbed && slide.htmlEmbed.assetId)
      .filter(Boolean)));

    for (const assetId of assetIds) {
      const source = sourceCache.has(assetId)
        ? sourceCache.get(assetId)
        : ((await getRecord(assetId)) || {}).source;
      if (!source) {
        continue;
      }
      sourceCache.set(assetId, source);
      result[assetId] = source;
    }

    return result;
  }

  async function importSourceDataMap(dataMap, slides) {
    const assetIds = new Set((slides || [])
      .map((slide) => slide && slide.htmlEmbed && slide.htmlEmbed.assetId)
      .filter(Boolean));

    for (const assetId of assetIds) {
      const source = dataMap && typeof dataMap[assetId] === "string" ? dataMap[assetId] : "";
      if (!source) {
        continue;
      }

      const slide = (slides || []).find((item) => item && item.htmlEmbed && item.htmlEmbed.assetId === assetId);
      const record = {
        id: assetId,
        name: ns.utils.clampText(slide && slide.htmlEmbed && slide.htmlEmbed.name, 180) || "Animation HTML",
        mimeType: "text/html",
        size: source.length,
        source,
      };

      try {
        await withStore("readwrite", (store) => {
          store.put(record);
        });
      } catch (error) {
        updateRuntimeUrl(assetId, source);
        continue;
      }
      updateRuntimeUrl(assetId, source);
    }
  }

  async function deleteAsset(id) {
    if (!id) {
      return;
    }

    const existingUrl = urlCache.get(id);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      urlCache.delete(id);
    }
    sourceCache.delete(id);

    try {
      await withStore("readwrite", (store) => {
        store.delete(id);
      });
    } catch (error) {
      return;
    }
  }

  function getUrlMap() {
    return Object.fromEntries(urlCache.entries());
  }

  ns.services.htmlAssets = {
    sanitizeAssetMeta,
    isHtmlFile,
    importFile,
    ensureRuntimeUrl,
    hydrateSlides,
    resolveExportSourceMap,
    exportRawSourceMap,
    importSourceDataMap,
    deleteAsset,
    getUrlMap,
  };
})();
