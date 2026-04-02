(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  const STORAGE_KEY = "studio-ingenierie-formation-v2";

  const refs = {
    appShell: document.querySelector(".app-shell"),
    tabs: Array.from(document.querySelectorAll("[data-switch-view]")),
    generateBloomDeck: document.querySelector("#generate-bloom-deck"),
    addSlide: document.querySelector("#add-slide"),
    addSlideMenu: document.querySelector("#add-slide-menu"),
    duplicateSlide: document.querySelector("#duplicate-slide"),
    deleteSlide: document.querySelector("#delete-slide"),
    deleteSlideInline: document.querySelector("#delete-slide-inline"),
    openPresentation: document.querySelector("#open-presentation"),
    openPresentationActive: document.querySelector("#open-presentation-active"),
    exportPdf: document.querySelector("#export-pdf"),
    exportPptx: document.querySelector("#export-pptx"),
    exportHtml: document.querySelector("#export-html"),
    exportJson: document.querySelector("#export-json"),
    importJson: document.querySelector("#import-json"),
    importJsonInput: document.querySelector("#import-json-input"),
    toggleNightMode: document.querySelector("#toggle-night-mode"),
    deckTitle: document.querySelector("#deck-title"),
    deckSubtitle: document.querySelector("#deck-subtitle"),
    deckFooter: document.querySelector("#deck-footer"),
    deckTheme: document.querySelector("#deck-theme"),
    deckPalette: document.querySelector("#deck-palette"),
    deckFont: document.querySelector("#deck-font"),
    deckTransition: document.querySelector("#deck-transition"),
    taxonomyCount: document.querySelector("#taxonomy-count"),
    taxonomyRoadmap: document.querySelector("#taxonomy-roadmap"),
    slideCount: document.querySelector("#slide-count"),
    slideList: document.querySelector("#slide-list"),
    principlesList: document.querySelector("#principles-list"),
    previewPanel: document.querySelector("#preview-panel"),
    stage: document.querySelector("#stage"),
    presentationProgress: document.querySelector("#presentation-progress"),
    slideHint: document.querySelector("#slide-hint"),
    densityBadge: document.querySelector("#density-badge"),
    thumbStrip: document.querySelector("#thumb-strip"),
    pedagogyBrief: document.querySelector("#pedagogy-brief"),
    mediaUpload: document.querySelector("#media-upload"),
    mediaUploadTrigger: document.querySelector("#media-upload-trigger"),
    toggleMediaPanel: document.querySelector("#toggle-media-panel"),
    slideMediaPanelBody: document.querySelector("#slide-media-panel-body"),
    clearSlideMedia: document.querySelector("#clear-slide-media"),
    mediaLinkInput: document.querySelector("#media-link-input"),
    mediaLinkAdd: document.querySelector("#media-link-add"),
    mediaLinkFeedback: document.querySelector("#media-link-feedback"),
    mediaLibrary: document.querySelector("#media-library"),
    slideMediaSelection: document.querySelector("#slide-media-selection"),
    slideBloomLevel: document.querySelector("#slide-bloom-level"),
    slideLabel: document.querySelector("#slide-label"),
    slideNumber: document.querySelector("#slide-number"),
    slideObjective: document.querySelector("#slide-objective"),
    slideEvidence: document.querySelector("#slide-evidence"),
    slideTitle: document.querySelector("#slide-title"),
    slideSubtitle: document.querySelector("#slide-subtitle"),
    slideContentType: document.querySelector("#slide-content-type"),
    slidePaletteOverride: document.querySelector("#slide-palette-override"),
    slideDecorativeAccentOverride: document.querySelector("#slide-decorative-accent-override"),
    slideBulletsEditor: document.querySelector("#slide-bullets-editor"),
    slideTableEditor: document.querySelector("#slide-table-editor"),
    slideFreeEditor: document.querySelector("#slide-free-editor"),
    slideNoteEditor: document.querySelector("#slide-note-editor"),
    slideBulletsNumbered: document.querySelector("#slide-bullets-numbered"),
    slideBulletsProgressive: document.querySelector("#slide-bullets-progressive"),
    slideTableProgressive: document.querySelector("#slide-table-progressive"),
    slideTableProgressiveOrderWrap: document.querySelector("#slide-table-progressive-order-wrap"),
    slideTableProgressiveOrder: document.querySelector("#slide-table-progressive-order"),
    slideBullet1: document.querySelector("#slide-bullet-1"),
    slideBullet2: document.querySelector("#slide-bullet-2"),
    slideBullet3: document.querySelector("#slide-bullet-3"),
    subBulletLists: [
      document.querySelector("#sub-bullets-0"),
      document.querySelector("#sub-bullets-1"),
      document.querySelector("#sub-bullets-2"),
    ],
    addBullet: document.querySelector("#add-bullet"),
    extraBulletsList: document.querySelector("#extra-bullets-list"),
    addTableRow: document.querySelector("#add-table-row"),
    removeTableRow: document.querySelector("#remove-table-row"),
    addTableColumn: document.querySelector("#add-table-column"),
    removeTableColumn: document.querySelector("#remove-table-column"),
    tableFillTarget: document.querySelector("#table-fill-target"),
    tableFillIndex: document.querySelector("#table-fill-index"),
    tableFillColor: document.querySelector("#table-fill-color"),
    addTableFill: document.querySelector("#add-table-fill"),
    tableFillList: document.querySelector("#table-fill-list"),
    tableEditorGrid: document.querySelector("#table-editor-grid"),
    slideFreeBody: document.querySelector("#slide-free-body"),
    freeBodyMeta: document.querySelector("#free-body-meta"),
    freeLinkLabel: document.querySelector("#free-link-label"),
    freeLinkUrl: document.querySelector("#free-link-url"),
    addFreeLink: document.querySelector("#add-free-link"),
    freeLinksList: document.querySelector("#free-links-list"),
    slideNote: document.querySelector("#slide-note"),
    titleMeta: document.querySelector("#title-meta"),
    subtitleMeta: document.querySelector("#subtitle-meta"),
    noteMeta: document.querySelector("#note-meta"),
    objectiveMeta: document.querySelector("#objective-meta"),
    evidenceMeta: document.querySelector("#evidence-meta"),
  };

  let state = ns.services.storage.loadState(STORAGE_KEY);
  let draggedSlideId = null;
  let draggedListSlideId = null;
  let draggedBulletIndex = null;
  let draggedFreeLinkIndex = null;
  let isAddSlideMenuOpen = false;
  let pendingBulletFocus = null;
  let pendingSubBulletFocus = null;
  let pendingTableFocus = null;
  let pendingPreviewPanelFocus = false;
  let freeEditorRange = null;
  const isPresentationMode = new URLSearchParams(window.location.search).get("present") === "1";

  if (isPresentationMode) {
    ns.services.exporter.renderPresentationDocument(state);
    return;
  }

  function getSelectedSlide() {
    return state.slides.find((slide) => slide.id === state.selectedSlideId) || state.slides[0];
  }

  function render() {
    ns.ui.renderDashboard({ state, refs });
    ns.services.storage.saveState(STORAGE_KEY, state);
    if (pendingBulletFocus) {
      const input = refs.extraBulletsList.querySelector(`[data-extra-bullet-index="${pendingBulletFocus.index}"]`);
      if (input) {
        input.focus();
        const caret = Math.min(pendingBulletFocus.caret, input.value.length);
        input.setSelectionRange(caret, caret);
      }
      pendingBulletFocus = null;
    }
    if (pendingTableFocus) {
      const input = refs.tableEditorGrid.querySelector(`[data-table-cell="${pendingTableFocus.row}-${pendingTableFocus.column}"]`);
      if (input) {
        input.focus();
        const caret = Math.min(pendingTableFocus.caret, input.value.length);
        input.setSelectionRange(caret, caret);
      }
      pendingTableFocus = null;
    }
    if (pendingSubBulletFocus) {
      const input = document.querySelector(
        `[data-sub-bullet-parent="${pendingSubBulletFocus.parentIndex}"][data-sub-bullet-index="${pendingSubBulletFocus.subIndex}"]`
      );
      if (input) {
        input.focus();
        const caret = Math.min(pendingSubBulletFocus.caret, input.value.length);
        input.setSelectionRange(caret, caret);
      }
      pendingSubBulletFocus = null;
    }
    if (pendingPreviewPanelFocus) {
      refs.previewPanel.focus();
      pendingPreviewPanelFocus = false;
    }
  }

  async function hydrateMediaLibrary() {
    state.mediaLibrary = await ns.services.media.hydrateMediaLibrary(state.mediaLibrary);
    render();
  }

  async function importJsonProject(file) {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const nextState = ns.services.storage.sanitizeState(parsed);
    const importedMedia = await ns.services.media.importMediaDataMap(parsed.mediaDataMap || {}, nextState.mediaLibrary || []);
    nextState.mediaLibrary = importedMedia;
    state = nextState;
    closeAddSlideMenu();
    render();
  }

  function updateSettings(key, value, limit) {
    state.settings[key] = ns.utils.clampText(value, limit);
    render();
  }

  function refreshStageOnly() {
    const selectedSlide = getSelectedSlide();
    refs.stage.innerHTML = ns.ui.createSlideMarkup(selectedSlide, state.settings, {
      compact: false,
      mediaItems: state.mediaLibrary,
      mediaUrls: ns.services.media.getUrlMap(),
    });
    ns.services.storage.saveState(STORAGE_KEY, state);
  }

  function setView(view) {
    if (view !== "engineering" && view !== "presentation") {
      return;
    }
    closeAddSlideMenu();
    state.view = view;
    render();
  }

  function isPreviewPanelTarget(target) {
    if (!target || !(target instanceof HTMLElement)) {
      return false;
    }

    return refs.previewPanel.contains(target);
  }

  function toggleNightMode() {
    state.uiNightMode = !state.uiNightMode;
    render();
  }

  function toggleMediaPanel() {
    state.uiMediaPanelCollapsed = !state.uiMediaPanelCollapsed;
    render();
  }

  function updateSelectedSlide(patch) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      return Object.assign({}, slide, patch);
    });
    render();
  }

  function updateSelectedTableCell(rowIndex, columnIndex, value) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const table = normalizeTable(slide.table);
      table[rowIndex][columnIndex] = value;
      return Object.assign({}, slide, { table });
    });
    render();
  }

  function resizeSelectedTable(nextRows, nextCols) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const table = normalizeTable(slide.table, nextRows, nextCols);
      const tableHighlights = sanitizeTableHighlightsForSize(slide.tableHighlights, table.length, table[0] ? table[0].length : 0);
      return Object.assign({}, slide, { table, tableHighlights });
    });
    render();
  }

  function normalizeTable(tableInput, minRows, minCols) {
    const rowTarget = Math.max(2, Math.min(8, minRows || (Array.isArray(tableInput) ? tableInput.length : 2)));
    const colTarget = Math.max(2, Math.min(6, minCols || getTableColumnCount(tableInput) || 2));
    const table = Array.isArray(tableInput) ? tableInput.slice(0, rowTarget).map((row) => Array.isArray(row) ? row.slice(0, colTarget) : []) : [];
    while (table.length < rowTarget) {
      table.push([]);
    }
    table.forEach((row) => {
      while (row.length < colTarget) {
        row.push("");
      }
    });
    return table;
  }

  function getTableColumnCount(tableInput) {
    if (!Array.isArray(tableInput)) {
      return 0;
    }
    return tableInput.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
  }

  function sanitizeTableHighlightsForSize(tableHighlights, rowCount, colCount) {
    const sanitizeMap = (input, max) => {
      const result = {};
      if (!input || typeof input !== "object") {
        return result;
      }
      Object.keys(input).forEach((key) => {
        const index = Number(key);
        if (!Number.isInteger(index) || index < 0 || index >= max) {
          return;
        }
        result[String(index)] = input[key];
      });
      return result;
    };

    return {
      rows: sanitizeMap(tableHighlights && tableHighlights.rows, rowCount),
      columns: sanitizeMap(tableHighlights && tableHighlights.columns, colCount),
    };
  }

  function normalizeHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value || "") ? value.toLowerCase() : "#dcecff";
  }

  function getSelectedTableFillColor() {
    const slide = getSelectedSlide();
    const target = refs.tableFillTarget.value === "column" ? "columns" : "rows";
    const index = Number(refs.tableFillIndex.value);
    const tableHighlights = slide.tableHighlights || {};
    return normalizeHexColor(tableHighlights[target] && tableHighlights[target][String(index)]);
  }

  function setSelectedTableFill(target, index, color) {
    if ((target !== "row" && target !== "column") || !Number.isInteger(index) || index < 0 || !/^#[0-9a-fA-F]{6}$/.test(color || "")) {
      return;
    }
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const key = target === "row" ? "rows" : "columns";
      const tableHighlights = {
        rows: Object.assign({}, slide.tableHighlights && slide.tableHighlights.rows),
        columns: Object.assign({}, slide.tableHighlights && slide.tableHighlights.columns),
      };
      tableHighlights[key][String(index)] = color.toLowerCase();
      return Object.assign({}, slide, { tableHighlights });
    });
    render();
  }

  function removeSelectedTableFill(target, index) {
    if ((target !== "row" && target !== "column") || !Number.isInteger(index) || index < 0) {
      return;
    }
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const key = target === "row" ? "rows" : "columns";
      const tableHighlights = {
        rows: Object.assign({}, slide.tableHighlights && slide.tableHighlights.rows),
        columns: Object.assign({}, slide.tableHighlights && slide.tableHighlights.columns),
      };
      delete tableHighlights[key][String(index)];
      return Object.assign({}, slide, { tableHighlights });
    });
    render();
  }

  function assignMediaToSelectedSlide(mediaId) {
    updateSelectedSlide({ mediaId: mediaId || "" });
  }

  function updateSelectedBullet(index, value, rerender) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice() : [];
      while (bullets.length <= index) {
        bullets.push("");
      }
      bullets[index] = value;
      return Object.assign({}, slide, { bullets });
    });
    if (rerender === false) {
      refreshStageOnly();
      return;
    }
    render();
  }

  function addSelectedBullet() {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice() : ["", "", ""];
      bullets.push("");
      return Object.assign({}, slide, { bullets });
    });
    render();
  }

  function updateSelectedSubBullet(parentIndex, subIndex, value) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const subBullets = Object.assign({}, slide.subBullets || {});
      const items = Array.isArray(subBullets[parentIndex]) ? subBullets[parentIndex].slice() : [];
      while (items.length <= subIndex) {
        items.push("");
      }
      items[subIndex] = value;
      subBullets[parentIndex] = items;
      return Object.assign({}, slide, { subBullets });
    });
    render();
  }

  function addSelectedSubBullet(parentIndex) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const subBullets = Object.assign({}, slide.subBullets || {});
      const items = Array.isArray(subBullets[parentIndex]) ? subBullets[parentIndex].slice(0, 6) : [];
      items.push("");
      subBullets[parentIndex] = items.slice(0, 6);
      return Object.assign({}, slide, { subBullets });
    });
    render();
  }

  function removeSelectedSubBullet(parentIndex, subIndex) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const subBullets = Object.assign({}, slide.subBullets || {});
      const items = Array.isArray(subBullets[parentIndex]) ? subBullets[parentIndex].slice() : [];
      if (subIndex < 0 || subIndex >= items.length) {
        return slide;
      }
      items.splice(subIndex, 1);
      if (items.length) {
        subBullets[parentIndex] = items;
      } else {
        delete subBullets[parentIndex];
      }
      return Object.assign({}, slide, { subBullets });
    });
    render();
  }

  function removeSelectedBullet(index) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice() : [];
      if (index < 3 || index >= bullets.length) {
        return slide;
      }
      bullets.splice(index, 1);
      while (bullets.length < 3) {
        bullets.push("");
      }
      const subBullets = Object.assign({}, slide.subBullets || {});
      delete subBullets[index];
      Object.keys(subBullets)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((key) => {
          if (key > index) {
            subBullets[key - 1] = subBullets[key];
            delete subBullets[key];
          }
        });
      return Object.assign({}, slide, { bullets, subBullets });
    });
    render();
  }

  function updateSelectedFreeBody(value) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      return Object.assign({}, slide, { freeBody: ns.utils.sanitizeRichText(value, 1600) });
    });
    ns.services.storage.saveState(STORAGE_KEY, state);
  }

  function updateFreeBodyPreview() {
    const selectedSlide = getSelectedSlide();
    refs.stage.innerHTML = ns.ui.createSlideMarkup(selectedSlide, state.settings, {
      compact: false,
      mediaItems: state.mediaLibrary,
      mediaUrls: ns.services.media.getUrlMap(),
    });
    refs.freeBodyMeta.textContent = `${ns.utils.richTextLength(selectedSlide.freeBody || "")}/1600 caractères`;
  }

  function saveFreeEditorSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!refs.slideFreeBody.contains(range.commonAncestorContainer)) {
      return;
    }
    freeEditorRange = range.cloneRange();
  }

  function restoreFreeEditorSelection() {
    const selection = window.getSelection();
    if (!selection || !freeEditorRange) {
      return false;
    }
    selection.removeAllRanges();
    selection.addRange(freeEditorRange);
    return true;
  }

  function normalizeFreeEditorMarkup(assignToEditor) {
    const sanitized = ns.utils.sanitizeRichText(refs.slideFreeBody.innerHTML, 1600);
    if (assignToEditor) {
      refs.slideFreeBody.innerHTML = sanitized;
    }
    updateSelectedFreeBody(sanitized);
    updateFreeBodyPreview();
  }

  function applyFreeEditorFontSize(size) {
    if (!restoreFreeEditorSelection()) {
      refs.slideFreeBody.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!refs.slideFreeBody.contains(range.commonAncestorContainer)) {
      return;
    }

    const wrapper = document.createElement("span");
    wrapper.setAttribute("style", `font-size:${size}%;`);
    try {
      const content = range.extractContents();
      wrapper.appendChild(content);
      range.insertNode(wrapper);
      range.selectNodeContents(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
      saveFreeEditorSelection();
      normalizeFreeEditorMarkup(true);
    } catch (error) {
      return;
    }
  }

  function applyFreeEditorInlineTag(tagName) {
    if (!restoreFreeEditorSelection()) {
      refs.slideFreeBody.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!refs.slideFreeBody.contains(range.commonAncestorContainer)) {
      return;
    }

    const formatAncestor = findFreeEditorFormatAncestor(range.commonAncestorContainer, tagName);
    if (formatAncestor) {
      unwrapFreeEditorFormat(formatAncestor);
      saveFreeEditorSelection();
      normalizeFreeEditorMarkup(true);
      return;
    }

    const wrapper = document.createElement(tagName);
    try {
      const content = range.extractContents();
      wrapper.appendChild(content);
      range.insertNode(wrapper);
      range.selectNodeContents(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
      saveFreeEditorSelection();
      normalizeFreeEditorMarkup(true);
    } catch (error) {
      return;
    }
  }

  function findFreeEditorFormatAncestor(node, tagName) {
    let current = node && node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
    while (current && current !== refs.slideFreeBody) {
      if (current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() === tagName) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  function unwrapFreeEditorFormat(element) {
    if (!element || !element.parentNode) {
      return;
    }

    const parent = element.parentNode;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  }

  function insertFreeEditorLineBreak() {
    if (!restoreFreeEditorSelection()) {
      refs.slideFreeBody.focus();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!refs.slideFreeBody.contains(range.commonAncestorContainer)) {
      return;
    }

    const br = document.createElement("br");
    const spacer = document.createTextNode("");
    range.deleteContents();
    range.insertNode(br);
    range.setStartAfter(br);
    range.insertNode(spacer);
    range.setStartAfter(spacer);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveFreeEditorSelection();
    normalizeFreeEditorMarkup(false);
  }

  function addSelectedFreeLink(label, url) {
    const trimmedUrl = ns.utils.clampText(url, 500).trim();
    if (!trimmedUrl) {
      return;
    }

    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const freeLinks = Array.isArray(slide.freeLinks) ? slide.freeLinks.slice(0, 12) : [];
      freeLinks.push({
        label: ns.utils.clampText(label, 80),
        url: trimmedUrl,
      });
      return Object.assign({}, slide, { freeLinks: freeLinks.slice(0, 12) });
    });
    render();
  }

  function removeSelectedFreeLink(index) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const freeLinks = Array.isArray(slide.freeLinks) ? slide.freeLinks.slice() : [];
      if (index < 0 || index >= freeLinks.length) {
        return slide;
      }
      freeLinks.splice(index, 1);
      return Object.assign({}, slide, { freeLinks });
    });
    render();
  }

  function toggleSelectedFreeMedia(mediaId) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const freeMediaIds = Array.isArray(slide.freeMediaIds) ? slide.freeMediaIds.slice() : [];
      const index = freeMediaIds.indexOf(mediaId);
      if (index >= 0) {
        freeMediaIds.splice(index, 1);
      } else {
        freeMediaIds.push(mediaId);
      }
      return Object.assign({}, slide, { freeMediaIds: ns.utils.uniqueStrings(freeMediaIds).slice(0, 12) });
    });
    render();
  }

  function moveSelectedBullet(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice() : ["", "", ""];
      const origins = bullets.map((unused, index) => index);
      while (bullets.length < 3) {
        bullets.push("");
        origins.push(origins.length);
      }
      if (fromIndex >= bullets.length || toIndex >= bullets.length) {
        return slide;
      }

      const moved = bullets.splice(fromIndex, 1)[0];
      const movedOrigin = origins.splice(fromIndex, 1)[0];
      bullets.splice(toIndex, 0, moved);
      origins.splice(toIndex, 0, movedOrigin);
      const sourceSubBullets = Object.assign({}, slide.subBullets || {});
      const reorderedSubBullets = {};
      origins.forEach((originIndex, index) => {
        const items = sourceSubBullets[originIndex];
        if (Array.isArray(items) && items.length) {
          reorderedSubBullets[index] = items.slice();
        }
      });
      return Object.assign({}, slide, { bullets, subBullets: reorderedSubBullets });
    });
    render();
  }

  function updateSelectedFreeLink(index, patch) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const freeLinks = Array.isArray(slide.freeLinks) ? slide.freeLinks.slice() : [];
      if (index < 0 || index >= freeLinks.length) {
        return slide;
      }
      freeLinks[index] = Object.assign({}, freeLinks[index], patch);
      return Object.assign({}, slide, { freeLinks });
    });
    refreshStageOnly();
  }

  function moveSelectedFreeLink(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const freeLinks = Array.isArray(slide.freeLinks) ? slide.freeLinks.slice() : [];
      if (fromIndex >= freeLinks.length || toIndex >= freeLinks.length) {
        return slide;
      }

      const moved = freeLinks.splice(fromIndex, 1)[0];
      freeLinks.splice(toIndex, 0, moved);
      return Object.assign({}, slide, { freeLinks });
    });
    render();
  }

  function reindexSlides() {
    state.slides = state.slides.map((slide, index) => {
      return Object.assign({}, slide, {
        number: String(index + 1).padStart(2, "0"),
      });
    });
  }

  function createBlankSlide(bloomLevelId) {
    const selected = getSelectedSlide();
    const slide = ns.stateFactory.createBlankSlide(
      state.slides.length + 1,
      bloomLevelId || (selected && selected.bloomLevel)
    );
    slide.id = ns.utils.createId("slide");
    state.slides.push(slide);
    state.selectedSlideId = slide.id;
    reindexSlides();
    closeAddSlideMenu();
    render();
  }

  function openAddSlideMenu() {
    isAddSlideMenuOpen = true;
    refs.addSlide.setAttribute("aria-expanded", "true");
    refs.addSlideMenu.hidden = false;
    refs.addSlideMenu.classList.add("is-open");
  }

  function closeAddSlideMenu() {
    isAddSlideMenuOpen = false;
    refs.addSlide.setAttribute("aria-expanded", "false");
    refs.addSlideMenu.classList.remove("is-open");
    refs.addSlideMenu.hidden = true;
  }

  function toggleAddSlideMenu() {
    if (isAddSlideMenuOpen) {
      closeAddSlideMenu();
      return;
    }
    openAddSlideMenu();
  }

  function duplicateCurrentSlide() {
    closeAddSlideMenu();
    const selected = getSelectedSlide();
    if (!selected) {
      return;
    }

    const duplicate = ns.utils.clone(selected);
    duplicate.id = ns.utils.createId("slide");
    duplicate.label = ns.utils.clampText(`${selected.label} copie`, 24);

    const index = state.slides.findIndex((slide) => slide.id === selected.id);
    state.slides.splice(index + 1, 0, duplicate);
    state.selectedSlideId = duplicate.id;
    reindexSlides();
    render();
  }

  function deleteCurrentSlide() {
    closeAddSlideMenu();
    deleteSlideById(state.selectedSlideId);
  }

  function deleteSlideById(id) {
    closeAddSlideMenu();
    if (state.slides.length === 1) {
      return;
    }

    const index = state.slides.findIndex((slide) => slide.id === id);
    if (index < 0) {
      return;
    }

    state.slides.splice(index, 1);
    reindexSlides();
    state.selectedSlideId = state.slides[Math.max(0, index - 1)].id;
    render();
  }

  function moveSlide(id, direction) {
    closeAddSlideMenu();
    const currentIndex = state.slides.findIndex((slide) => slide.id === id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= state.slides.length) {
      return;
    }

    const moved = state.slides.splice(currentIndex, 1)[0];
    state.slides.splice(targetIndex, 0, moved);
    reindexSlides();
    render();
  }

  function moveSlideToIndex(id, targetIndex) {
    closeAddSlideMenu();
    const currentIndex = state.slides.findIndex((slide) => slide.id === id);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= state.slides.length || currentIndex === targetIndex) {
      return;
    }

    const moved = state.slides.splice(currentIndex, 1)[0];
    state.slides.splice(targetIndex, 0, moved);
    state.selectedSlideId = moved.id;
    reindexSlides();
    render();
  }

  function clearThumbDropState() {
    refs.thumbStrip.querySelectorAll(".thumb-card.is-drop-target").forEach((card) => {
      card.classList.remove("is-drop-target");
    });
  }

  function clearListDropState() {
    refs.slideList.querySelectorAll(".slide-item.is-drop-target").forEach((card) => {
      card.classList.remove("is-drop-target");
    });
  }

  function clearBulletDropState() {
    refs.slideBulletsEditor.querySelectorAll(".bullet-editor-row.is-drop-target, .bullet-editor-row.is-dragging").forEach((row) => {
      row.classList.remove("is-drop-target", "is-dragging");
    });
  }

  function selectSlide(id, options) {
    const opts = options || {};
    closeAddSlideMenu();
    if (!state.slides.some((slide) => slide.id === id)) {
      return;
    }
    state.selectedSlideId = id;
    if (opts.focusPreviewPanel) {
      pendingPreviewPanelFocus = true;
    }
    render();
  }

  function applyBloomLevel(levelId) {
    closeAddSlideMenu();
    updateSelectedSlide({ bloomLevel: levelId });
  }

  function togglePrinciple(principleId) {
    closeAddSlideMenu();
    const selected = getSelectedSlide();
    const nextPrinciples = selected.principleIds.includes(principleId)
      ? selected.principleIds.filter((id) => id !== principleId)
      : selected.principleIds.concat(principleId);
    updateSelectedSlide({ principleIds: ns.utils.uniqueStrings(nextPrinciples) });
  }

  function regenerateBloomDeck() {
    closeAddSlideMenu();
    const slides = ns.stateFactory.createBloomDeckSlides().map((slide) => {
      slide.id = ns.utils.createId("slide");
      return slide;
    });
    state.slides = slides;
    state.selectedSlideId = slides[0] ? slides[0].id : null;
    reindexSlides();
    render();
  }

  refs.deckTitle.addEventListener("input", (event) => updateSettings("title", event.target.value, 60));
  refs.deckSubtitle.addEventListener("input", (event) => updateSettings("subtitle", event.target.value, 90));
  refs.deckFooter.addEventListener("input", (event) => updateSettings("footer", event.target.value, 50));
  refs.deckPalette.addEventListener("change", (event) => updateSettings("palette", event.target.value, 24));
  refs.deckFont.addEventListener("change", (event) => updateSettings("font", event.target.value, 24));
  refs.deckTransition.addEventListener("change", (event) => updateSettings("transition", event.target.value, 12));
  refs.deckTheme.addEventListener("change", (event) => updateSettings("theme", event.target.value, 12));

  refs.slideBloomLevel.addEventListener("change", (event) => updateSelectedSlide({ bloomLevel: event.target.value }));
  refs.slideLabel.addEventListener("input", (event) => updateSelectedSlide({ label: ns.utils.clampText(event.target.value, 24) }));
  refs.slideNumber.addEventListener("input", (event) => updateSelectedSlide({ number: ns.utils.clampText(event.target.value, 8) }));
  refs.slideObjective.addEventListener("input", (event) => updateSelectedSlide({ objective: ns.utils.clampText(event.target.value, 180) }));
  refs.slideEvidence.addEventListener("input", (event) => updateSelectedSlide({ evidence: ns.utils.clampText(event.target.value, 120) }));
  refs.slideTitle.addEventListener("input", (event) => updateSelectedSlide({ title: ns.utils.clampText(event.target.value, 72) }));
  refs.slideSubtitle.addEventListener("input", (event) => updateSelectedSlide({ subtitle: ns.utils.clampText(event.target.value, 170) }));
  refs.slideContentType.addEventListener("change", (event) => updateSelectedSlide({
    contentType: event.target.value === "table" ? "table" : event.target.value === "free" ? "free" : "bullets",
  }));
  refs.slidePaletteOverride.addEventListener("change", (event) => updateSelectedSlide({
    paletteOverride: event.target.value,
  }));
  refs.slideDecorativeAccentOverride.addEventListener("change", (event) => updateSelectedSlide({
    decorativeAccentOverride: event.target.value,
  }));
  refs.slideBulletsNumbered.addEventListener("change", (event) => updateSelectedSlide({
    bulletsNumbered: Boolean(event.target.checked),
  }));
  refs.slideBulletsProgressive.addEventListener("change", (event) => updateSelectedSlide({
    bulletsProgressive: Boolean(event.target.checked),
  }));
  refs.slideTableProgressive.addEventListener("change", (event) => updateSelectedSlide({
    tableProgressive: Boolean(event.target.checked),
  }));
  refs.slideTableProgressiveOrder.addEventListener("change", (event) => updateSelectedSlide({
    tableProgressiveOrder: event.target.value === "column" ? "column" : "row",
  }));
  refs.slideBullet1.addEventListener("input", (event) => updateSelectedBullet(0, ns.utils.clampText(event.target.value, 220)));
  refs.slideBullet2.addEventListener("input", (event) => updateSelectedBullet(1, ns.utils.clampText(event.target.value, 220)));
  refs.slideBullet3.addEventListener("input", (event) => updateSelectedBullet(2, ns.utils.clampText(event.target.value, 220)));
  refs.addBullet.addEventListener("click", addSelectedBullet);
  refs.slideFreeBody.addEventListener("input", () => {
    saveFreeEditorSelection();
    if (ns.utils.richTextLength(refs.slideFreeBody.innerHTML) > 1600) {
      normalizeFreeEditorMarkup(true);
      return;
    }
    normalizeFreeEditorMarkup(false);
  });
  refs.slideFreeBody.addEventListener("mousedown", () => {
    freeEditorRange = null;
  });
  refs.slideFreeBody.addEventListener("keyup", saveFreeEditorSelection);
  refs.slideFreeBody.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      insertFreeEditorLineBreak();
    }
  });
  refs.slideFreeBody.addEventListener("mouseup", saveFreeEditorSelection);
  refs.slideFreeBody.addEventListener("click", () => {
    setTimeout(saveFreeEditorSelection, 0);
  });
  refs.slideFreeBody.addEventListener("blur", () => normalizeFreeEditorMarkup(true));
  refs.slideFreeBody.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
    if (!pastedText) {
      return;
    }
    restoreFreeEditorSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!refs.slideFreeBody.contains(range.commonAncestorContainer)) {
      return;
    }
    range.deleteContents();
    const textNode = document.createTextNode(pastedText);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveFreeEditorSelection();
    normalizeFreeEditorMarkup(true);
  });
  refs.addFreeLink.addEventListener("click", () => {
    addSelectedFreeLink(refs.freeLinkLabel.value, refs.freeLinkUrl.value);
    refs.freeLinkLabel.value = "";
    refs.freeLinkUrl.value = "";
  });
  refs.freeLinksList.addEventListener("input", (event) => {
    const labelInput = event.target.closest("[data-free-link-label]");
    if (labelInput) {
      updateSelectedFreeLink(
        Number(labelInput.getAttribute("data-free-link-label")),
        { label: ns.utils.clampText(labelInput.value, 80) }
      );
      return;
    }
    const urlInput = event.target.closest("[data-free-link-url]");
    if (urlInput) {
      updateSelectedFreeLink(
        Number(urlInput.getAttribute("data-free-link-url")),
        { url: ns.utils.clampText(urlInput.value, 500) }
      );
    }
  });
  refs.slideNote.addEventListener("input", (event) => updateSelectedSlide({ note: ns.utils.clampText(event.target.value, 180) }));
  refs.extraBulletsList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-extra-bullet-index]");
    if (!input) {
      return;
    }
    pendingBulletFocus = {
      index: Number(input.getAttribute("data-extra-bullet-index")),
      caret: input.selectionStart || 0,
    };
    updateSelectedBullet(Number(input.getAttribute("data-extra-bullet-index")), ns.utils.clampText(input.value, 220), false);
  });
  refs.slideBulletsEditor.addEventListener("input", (event) => {
    const input = event.target.closest("[data-sub-bullet-index]");
    if (!input) {
      return;
    }
    pendingSubBulletFocus = {
      parentIndex: Number(input.getAttribute("data-sub-bullet-parent")),
      subIndex: Number(input.getAttribute("data-sub-bullet-index")),
      caret: input.selectionStart || 0,
    };
    updateSelectedSubBullet(
      Number(input.getAttribute("data-sub-bullet-parent")),
      Number(input.getAttribute("data-sub-bullet-index")),
      ns.utils.clampText(input.value, 180)
    );
  });
  refs.tableEditorGrid.addEventListener("input", (event) => {
    const input = event.target.closest("[data-table-cell]");
    if (!input) {
      return;
    }
    const [rowIndex, columnIndex] = input.getAttribute("data-table-cell").split("-").map(Number);
    pendingTableFocus = { row: rowIndex, column: columnIndex, caret: input.selectionStart || 0 };
    updateSelectedTableCell(rowIndex, columnIndex, ns.utils.clampText(input.value, 120));
  });
  refs.tableFillTarget.addEventListener("change", () => render());
  refs.tableFillIndex.addEventListener("change", () => {
    refs.tableFillColor.value = getSelectedTableFillColor();
  });
  refs.tableFillColor.addEventListener("change", () => {
    refs.tableFillColor.value = normalizeHexColor(refs.tableFillColor.value);
  });
  refs.addTableRow.addEventListener("click", () => {
    const slide = getSelectedSlide();
    resizeSelectedTable((slide.table || []).length + 1, getTableColumnCount(slide.table));
  });
  refs.removeTableRow.addEventListener("click", () => {
    const slide = getSelectedSlide();
    resizeSelectedTable(Math.max(2, (slide.table || []).length - 1), getTableColumnCount(slide.table));
  });
  refs.addTableColumn.addEventListener("click", () => {
    const slide = getSelectedSlide();
    resizeSelectedTable((slide.table || []).length, getTableColumnCount(slide.table) + 1);
  });
  refs.removeTableColumn.addEventListener("click", () => {
    const slide = getSelectedSlide();
    resizeSelectedTable((slide.table || []).length, Math.max(2, getTableColumnCount(slide.table) - 1));
  });
  refs.addTableFill.addEventListener("click", () => {
    setSelectedTableFill(refs.tableFillTarget.value, Number(refs.tableFillIndex.value), normalizeHexColor(refs.tableFillColor.value));
  });
  refs.mediaUploadTrigger.addEventListener("click", () => refs.mediaUpload.click());
  refs.importJson.addEventListener("click", () => refs.importJsonInput.click());
  refs.toggleNightMode.addEventListener("click", toggleNightMode);
  refs.toggleMediaPanel.addEventListener("click", toggleMediaPanel);
  refs.importJsonInput.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      await importJsonProject(file);
    } finally {
      event.target.value = "";
    }
  });
  refs.mediaUpload.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const importedItems = await ns.services.media.importFiles(files);
    state.mediaLibrary = state.mediaLibrary.concat(importedItems);
    render();
    event.target.value = "";
  });
  refs.clearSlideMedia.addEventListener("click", () => assignMediaToSelectedSlide(""));
  refs.mediaLinkAdd.addEventListener("click", () => {
    const rawValue = refs.mediaLinkInput.value;
    refs.mediaLinkFeedback.textContent = "";

    const mediaItem = ns.services.media.isDirectMediaUrl(rawValue)
      ? ns.services.media.createExternalMedia(rawValue)
      : ns.services.media.isEmbeddableMediaUrl(rawValue)
        ? ns.services.media.createEmbedMedia(rawValue)
        : null;

    if (!mediaItem) {
      refs.mediaLinkFeedback.textContent = "Utilise un lien http/https, un code iframe, un data URL image/vidéo, ou un lien vidéo reconnu.";
      return;
    }

    ns.services.media.primeMediaUrl(mediaItem);
    state.mediaLibrary = state.mediaLibrary.concat(mediaItem);
    refs.mediaLinkInput.value = "";
    refs.mediaLinkFeedback.textContent = mediaItem.kind === "embed"
      ? "Embed YouTube ajouté."
      : "Média ajouté depuis le lien.";
    render();
    assignMediaToSelectedSlide(mediaItem.id);
  });

  refs.generateBloomDeck.addEventListener("click", regenerateBloomDeck);
  refs.addSlide.addEventListener("click", toggleAddSlideMenu);
  refs.duplicateSlide.addEventListener("click", duplicateCurrentSlide);
  refs.deleteSlide.addEventListener("click", deleteCurrentSlide);
  refs.deleteSlideInline.addEventListener("click", deleteCurrentSlide);
  refs.exportJson.addEventListener("click", () => ns.services.exporter.exportJson(state));
  refs.exportPdf.addEventListener("click", () => ns.services.exporter.exportPdf(state));
  refs.exportPptx.addEventListener("click", () => ns.services.exporter.exportPptx(state));
  refs.exportHtml.addEventListener("click", () => ns.services.exporter.exportHtml(state, false));
  refs.openPresentation.addEventListener("click", () => {
    ns.services.storage.saveState(STORAGE_KEY, state);
    const presentationUrl = new URL(window.location.href);
    presentationUrl.searchParams.set("present", "1");
    window.open(presentationUrl.toString(), "_blank", "noopener");
  });
  refs.openPresentationActive.addEventListener("click", () => {
    ns.services.storage.saveState(STORAGE_KEY, state);
    const presentationUrl = new URL(window.location.href);
    presentationUrl.searchParams.set("present", "1");
    presentationUrl.searchParams.set("start", state.selectedSlideId || "");
    window.open(presentationUrl.toString(), "_blank", "noopener");
  });
  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.getAttribute("data-switch-view")));
  });

  document.querySelectorAll("[data-free-command]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      refs.slideFreeBody.focus();
      const command = button.getAttribute("data-free-command");
      if (command === "bold") {
        applyFreeEditorInlineTag("strong");
        return;
      }
      if (command === "underline") {
        applyFreeEditorInlineTag("u");
      }
    });
  });

  document.querySelectorAll("[data-free-size]").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      saveFreeEditorSelection();
    });
    button.addEventListener("click", () => {
      refs.slideFreeBody.focus();
      applyFreeEditorFontSize(button.getAttribute("data-free-size"));
    });
  });

  document.addEventListener("selectionchange", () => {
    if (document.activeElement === refs.slideFreeBody) {
      saveFreeEditorSelection();
    }
  });

  document.addEventListener("click", (event) => {
    const slideTrigger = event.target.closest("[data-select-slide]");
    const moveTrigger = event.target.closest("[data-move-slide]");
    const deleteTrigger = event.target.closest("[data-delete-slide]");
    const mediaAssignTrigger = event.target.closest("[data-assign-media]");
    const mediaDeleteTrigger = event.target.closest("[data-delete-media]");
    const removeBulletTrigger = event.target.closest("[data-remove-bullet]");
    const addSubBulletTrigger = event.target.closest("[data-add-sub-bullet]");
    const removeSubBulletTrigger = event.target.closest("[data-remove-sub-bullet]");
    const removeFreeLinkTrigger = event.target.closest("[data-remove-free-link]");
    const removeTableFillTrigger = event.target.closest("[data-remove-table-fill]");
    const toggleFreeMediaTrigger = event.target.closest("[data-toggle-free-media]");
    const addSlideTrigger = event.target.closest("[data-add-slide-bloom]");
    const bloomTrigger = event.target.closest("[data-set-bloom]");

    if (!event.target.closest(".add-slide-group") && isAddSlideMenuOpen) {
      closeAddSlideMenu();
    }

    if (addSlideTrigger) {
      createBlankSlide(addSlideTrigger.getAttribute("data-add-slide-bloom"));
      return;
    }

    if (mediaAssignTrigger) {
      assignMediaToSelectedSlide(mediaAssignTrigger.getAttribute("data-assign-media"));
      return;
    }

    if (toggleFreeMediaTrigger) {
      toggleSelectedFreeMedia(toggleFreeMediaTrigger.getAttribute("data-toggle-free-media"));
      return;
    }

    if (mediaDeleteTrigger) {
      const mediaId = mediaDeleteTrigger.getAttribute("data-delete-media");
      state.mediaLibrary = state.mediaLibrary.filter((item) => item.id !== mediaId);
      state.slides = state.slides.map((slide) => {
        return slide.mediaId === mediaId ? Object.assign({}, slide, { mediaId: "" }) : slide;
      });
      ns.services.media.deleteMedia(mediaId).then(() => render());
      render();
      return;
    }

    if (removeBulletTrigger) {
      removeSelectedBullet(Number(removeBulletTrigger.getAttribute("data-remove-bullet")));
      return;
    }

    if (addSubBulletTrigger) {
      addSelectedSubBullet(Number(addSubBulletTrigger.getAttribute("data-add-sub-bullet")));
      return;
    }

    if (removeSubBulletTrigger) {
      const [parentIndex, subIndex] = removeSubBulletTrigger.getAttribute("data-remove-sub-bullet").split("-").map(Number);
      removeSelectedSubBullet(parentIndex, subIndex);
      return;
    }

    if (removeFreeLinkTrigger) {
      removeSelectedFreeLink(Number(removeFreeLinkTrigger.getAttribute("data-remove-free-link")));
      return;
    }

    if (removeTableFillTrigger) {
      const [target, index] = removeTableFillTrigger.getAttribute("data-remove-table-fill").split("-");
      removeSelectedTableFill(target, Number(index));
      return;
    }

    if (deleteTrigger) {
      event.stopPropagation();
      deleteSlideById(deleteTrigger.getAttribute("data-delete-slide"));
      return;
    }

    if (slideTrigger) {
      selectSlide(slideTrigger.getAttribute("data-select-slide"), {
        focusPreviewPanel: refs.slideList.contains(slideTrigger),
      });
    }

    if (moveTrigger) {
      moveSlide(
        moveTrigger.getAttribute("data-move-slide"),
        Number(moveTrigger.getAttribute("data-direction"))
      );
    }

    if (bloomTrigger) {
      applyBloomLevel(bloomTrigger.getAttribute("data-set-bloom"));
    }
  });

  refs.principlesList.addEventListener("change", (event) => {
    const target = event.target;
    if (target && target.matches("[data-toggle-principle]")) {
      togglePrinciple(target.getAttribute("data-toggle-principle"));
    }
  });

  refs.thumbStrip.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-thumb-slide]");
    if (!card) {
      return;
    }

    draggedSlideId = card.getAttribute("data-thumb-slide");
    card.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedSlideId);
    }
  });

  refs.thumbStrip.addEventListener("dragover", (event) => {
    const card = event.target.closest("[data-thumb-slide]");
    if (!card || !draggedSlideId) {
      return;
    }

    event.preventDefault();
    clearThumbDropState();
    if (card.getAttribute("data-thumb-slide") !== draggedSlideId) {
      card.classList.add("is-drop-target");
    }
  });

  refs.thumbStrip.addEventListener("drop", (event) => {
    const card = event.target.closest("[data-thumb-slide]");
    if (!card || !draggedSlideId) {
      return;
    }

    event.preventDefault();
    const targetId = card.getAttribute("data-thumb-slide");
    const targetIndex = state.slides.findIndex((slide) => slide.id === targetId);
    clearThumbDropState();
    moveSlideToIndex(draggedSlideId, targetIndex);
    draggedSlideId = null;
  });

  refs.thumbStrip.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-thumb-slide]");
    if (card) {
      card.classList.remove("is-dragging");
    }
    clearThumbDropState();
    draggedSlideId = null;
  });

  refs.slideList.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("[data-list-drag-handle]");
    if (!handle) {
      event.preventDefault();
      return;
    }

    const card = handle.closest("[data-list-slide]");
    if (!card) {
      return;
    }

    draggedListSlideId = card.getAttribute("data-list-slide");
    card.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedListSlideId);
    }
  });

  refs.slideList.addEventListener("dragover", (event) => {
    const card = event.target.closest("[data-list-slide]");
    if (!card || !draggedListSlideId) {
      return;
    }

    event.preventDefault();
    clearListDropState();
    if (card.getAttribute("data-list-slide") !== draggedListSlideId) {
      card.classList.add("is-drop-target");
    }
  });

  refs.slideList.addEventListener("drop", (event) => {
    const card = event.target.closest("[data-list-slide]");
    if (!card || !draggedListSlideId) {
      return;
    }

    event.preventDefault();
    const targetId = card.getAttribute("data-list-slide");
    const targetIndex = state.slides.findIndex((slide) => slide.id === targetId);
    clearListDropState();
    moveSlideToIndex(draggedListSlideId, targetIndex);
    draggedListSlideId = null;
  });

  refs.slideList.addEventListener("dragend", (event) => {
    const card = event.target.closest("[data-list-slide]");
    if (card) {
      card.classList.remove("is-dragging");
    }
    clearListDropState();
    draggedListSlideId = null;
  });

  refs.slideBulletsEditor.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("[data-bullet-drag-handle]");
    if (!handle) {
      return;
    }

    draggedBulletIndex = Number(handle.getAttribute("data-bullet-drag-handle"));
    const row = handle.closest("[data-bullet-row]");
    if (row) {
      row.classList.add("is-dragging");
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(draggedBulletIndex));
    }
  });

  refs.slideBulletsEditor.addEventListener("dragover", (event) => {
    const row = event.target.closest("[data-bullet-row]");
    if (!row || draggedBulletIndex === null) {
      return;
    }

    event.preventDefault();
    clearBulletDropState();
    const targetIndex = Number(row.getAttribute("data-bullet-row"));
    if (targetIndex !== draggedBulletIndex) {
      row.classList.add("is-drop-target");
    }
  });

  refs.slideBulletsEditor.addEventListener("drop", (event) => {
    const row = event.target.closest("[data-bullet-row]");
    if (!row || draggedBulletIndex === null) {
      return;
    }

    event.preventDefault();
    const targetIndex = Number(row.getAttribute("data-bullet-row"));
    clearBulletDropState();
    moveSelectedBullet(draggedBulletIndex, targetIndex);
    draggedBulletIndex = null;
  });

  refs.slideBulletsEditor.addEventListener("dragend", () => {
    clearBulletDropState();
    draggedBulletIndex = null;
  });

  refs.freeLinksList.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("[data-free-link-drag-handle]");
    if (!handle) {
      return;
    }
    draggedFreeLinkIndex = Number(handle.getAttribute("data-free-link-drag-handle"));
    const row = handle.closest("[data-free-link-row]");
    if (row) {
      row.classList.add("is-dragging");
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(draggedFreeLinkIndex));
    }
  });

  refs.freeLinksList.addEventListener("dragover", (event) => {
    const row = event.target.closest("[data-free-link-row]");
    if (!row || draggedFreeLinkIndex === null) {
      return;
    }
    event.preventDefault();
    refs.freeLinksList.querySelectorAll(".bullet-editor-row.is-drop-target").forEach((item) => {
      if (item !== row) {
        item.classList.remove("is-drop-target");
      }
    });
    row.classList.add("is-drop-target");
  });

  refs.freeLinksList.addEventListener("drop", (event) => {
    const row = event.target.closest("[data-free-link-row]");
    if (!row || draggedFreeLinkIndex === null) {
      return;
    }

    event.preventDefault();
    const targetIndex = Number(row.getAttribute("data-free-link-row"));
    refs.freeLinksList.querySelectorAll(".bullet-editor-row.is-drop-target, .bullet-editor-row.is-dragging").forEach((item) => {
      item.classList.remove("is-drop-target", "is-dragging");
    });
    moveSelectedFreeLink(draggedFreeLinkIndex, targetIndex);
    draggedFreeLinkIndex = null;
  });

  refs.freeLinksList.addEventListener("dragend", () => {
    refs.freeLinksList.querySelectorAll(".bullet-editor-row.is-drop-target, .bullet-editor-row.is-dragging").forEach((item) => {
      item.classList.remove("is-drop-target", "is-dragging");
    });
    draggedFreeLinkIndex = null;
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && isPreviewPanelTarget(event.target)) {
      event.preventDefault();
      const currentIndex = state.slides.findIndex((slide) => slide.id === state.selectedSlideId);
      if (currentIndex < 0) {
        return;
      }
      const nextIndex = event.key === "ArrowUp"
        ? Math.max(0, currentIndex - 1)
        : Math.min(state.slides.length - 1, currentIndex + 1);
      const nextSlide = state.slides[nextIndex];
      if (!nextSlide) {
        return;
      }
      selectSlide(nextSlide.id, { focusPreviewPanel: true });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateCurrentSlide();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      toggleAddSlideMenu();
    }

    if (event.key === "Escape" && isAddSlideMenuOpen) {
      closeAddSlideMenu();
    }
  });

  render();
  hydrateMediaLibrary();
})();
