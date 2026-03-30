(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.services = ns.services || {};

  const themeOptions = ["random", "mix", "circles", "waves", "clean"];
  const viewOptions = ["engineering", "presentation"];
  const paletteOptions = ((ns.data && ns.data.colorPalettes) || []).map((item) => item.id);
  const fontOptions = ((ns.data && ns.data.fontOptions) || []).map((item) => item.id);
  const transitionOptions = ["fade", "slide", "zoom", "rise", "none"];

  function safeRead(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function sanitizeState(input) {
    const utils = ns.utils;
    const bloomLevels = (ns.data && ns.data.bloomLevels) || [];
    const principles = (ns.data && ns.data.cognitivePrinciples) || [];
    const allowedBloomIds = bloomLevels.map((item) => item.id);
    const allowedPrincipleIds = principles.map((item) => item.id);

    const slides = Array.isArray(input.slides)
      ? input.slides.map((slide, index) => sanitizeSlide(slide, index, allowedBloomIds, allowedPrincipleIds)).filter(Boolean)
      : [];

    const fallbackState = ns.stateFactory.createDefaultState();

    if (slides.length === 0) {
      return fallbackState;
    }

    const selectedSlideId = slides.some((slide) => slide.id === input.selectedSlideId)
      ? input.selectedSlideId
      : slides[0].id;
    const hasFooterValue = Boolean(input.settings) && typeof input.settings.footer === "string";

    return {
      view: viewOptions.includes(input.view) ? input.view : fallbackState.view,
      uiNightMode: Boolean(input.uiNightMode),
      uiMediaPanelCollapsed: Boolean(input.uiMediaPanelCollapsed),
      settings: {
        title: utils.clampText(input.settings && input.settings.title, 60) || fallbackState.settings.title,
        subtitle: utils.clampText(input.settings && input.settings.subtitle, 90) || fallbackState.settings.subtitle,
        footer: hasFooterValue ? utils.clampText(input.settings.footer, 50) : fallbackState.settings.footer,
        theme: themeOptions.includes(input.settings && input.settings.theme) ? input.settings.theme : fallbackState.settings.theme,
        palette: paletteOptions.includes(input.settings && input.settings.palette) ? input.settings.palette : fallbackState.settings.palette,
        font: fontOptions.includes(input.settings && input.settings.font) ? input.settings.font : fallbackState.settings.font,
        transition: transitionOptions.includes(input.settings && input.settings.transition) ? input.settings.transition : fallbackState.settings.transition,
      },
      mediaLibrary: Array.isArray(input.mediaLibrary)
        ? input.mediaLibrary.map((item) => ns.services.media.sanitizeMediaItem(item)).filter(Boolean)
        : [],
      selectedSlideId,
      slides,
    };
  }

  function sanitizeSlide(slide, index, allowedBloomIds, allowedPrincipleIds) {
    if (!slide || typeof slide !== "object") {
      return null;
    }

    const utils = ns.utils;
    const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice(0, 12) : [];
    while (bullets.length < 3) {
      bullets.push("");
    }
    const table = sanitizeTable(slide.table);
    const tableHighlights = sanitizeTableHighlights(slide.tableHighlights, table);
    const freeLinks = sanitizeFreeLinks(slide.freeLinks);
    const freeMediaIds = sanitizeFreeMediaIds(slide.freeMediaIds);
    const subBullets = sanitizeSubBullets(slide.subBullets);

    const principleIds = utils.uniqueStrings(slide.principleIds || []).filter((id) => allowedPrincipleIds.includes(id));

    return {
      id: typeof slide.id === "string" && slide.id ? slide.id : utils.createId("slide"),
      label: utils.clampText(slide.label, 24) || `Slide ${index + 1}`,
      number: utils.clampText(slide.number, 8) || String(index + 1).padStart(2, "0"),
      contentType: slide.contentType === "table" ? "table" : slide.contentType === "free" ? "free" : "bullets",
      bulletsNumbered: Boolean(slide.bulletsNumbered),
      bulletsProgressive: Boolean(slide.bulletsProgressive),
      tableProgressive: Boolean(slide.tableProgressive),
      tableProgressiveOrder: slide.tableProgressiveOrder === "column" ? "column" : "row",
      paletteOverride: paletteOptions.includes(slide.paletteOverride) ? slide.paletteOverride : "",
      tableHighlights,
      table,
      freeBody: utils.sanitizeRichText(slide.freeBody, 1600),
      freeLinks,
      freeMediaIds,
      subBullets,
      mediaId: utils.clampText(slide.mediaId, 80),
      bloomLevel: allowedBloomIds.includes(slide.bloomLevel) ? slide.bloomLevel : allowedBloomIds[0],
      objective: utils.clampText(slide.objective, 180),
      evidence: utils.clampText(slide.evidence, 120),
      principleIds,
      title: utils.clampText(slide.title, 72),
      subtitle: utils.clampText(slide.subtitle, 170),
      bullets: bullets.map((item) => utils.clampText(item, 220)),
      note: utils.clampText(slide.note, 180),
    };
  }

  function sanitizeTable(input) {
    const utils = ns.utils;
    const rows = Array.isArray(input) ? input.slice(0, 8) : [];
    const sanitizedRows = rows
      .map((row) => Array.isArray(row) ? row.slice(0, 6).map((cell) => utils.clampText(cell, 120)) : null)
      .filter(Boolean);

    const rowCount = Math.max(2, sanitizedRows.length);
    const colCount = Math.max(2, sanitizedRows.reduce((max, row) => Math.max(max, row.length), 0));
    while (sanitizedRows.length < rowCount) {
      sanitizedRows.push([]);
    }
    sanitizedRows.forEach((row) => {
      while (row.length < colCount) {
        row.push("");
      }
    });
    return sanitizedRows;
  }

  function sanitizeTableHighlights(input, table) {
    const rowCount = Array.isArray(table) ? table.length : 0;
    const colCount = Array.isArray(table) && table[0] ? table[0].length : 0;
    const sanitizeMap = (mapInput, maxIndex) => {
      const result = {};
      if (!mapInput || typeof mapInput !== "object") {
        return result;
      }
      Object.keys(mapInput).forEach((key) => {
        const index = Number(key);
        const value = typeof mapInput[key] === "string" ? mapInput[key].trim() : "";
        if (!Number.isInteger(index) || index < 0 || index >= maxIndex) {
          return;
        }
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
          return;
        }
        result[String(index)] = value.toLowerCase();
      });
      return result;
    };

    return {
      rows: sanitizeMap(input && input.rows, rowCount),
      columns: sanitizeMap(input && input.columns, colCount),
    };
  }

  function sanitizeSubBullets(input) {
    const utils = ns.utils;
    const result = {};
    if (!input || typeof input !== "object") {
      return result;
    }

    Object.keys(input).forEach((key) => {
      const index = Number(key);
      if (!Number.isInteger(index) || index < 0 || index > 11) {
        return;
      }
      const items = Array.isArray(input[key]) ? input[key].slice(0, 6) : [];
      const sanitized = items.map((item) => utils.clampText(item, 180)).filter(Boolean);
      if (sanitized.length) {
        result[String(index)] = sanitized;
      }
    });

    return result;
  }

  function sanitizeFreeLinks(input) {
    const utils = ns.utils;
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .slice(0, 12)
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const label = utils.clampText(item.label, 80);
        const url = utils.clampText(item.url, 500);
        if (!url) {
          return null;
        }
        return { label, url };
      })
      .filter(Boolean);
  }

  function sanitizeFreeMediaIds(input) {
    const utils = ns.utils;
    if (!Array.isArray(input)) {
      return [];
    }
    return utils.uniqueStrings(input.map((id) => utils.clampText(id, 80)).filter(Boolean)).slice(0, 12);
  }

  function loadState(key) {
    const raw = safeRead(key);
    if (!raw) {
      return ns.stateFactory.createDefaultState();
    }

    try {
      return sanitizeState(JSON.parse(raw));
    } catch (error) {
      return ns.stateFactory.createDefaultState();
    }
  }

  function saveState(key, value) {
    safeWrite(key, JSON.stringify(value));
  }

  ns.services.storage = {
    loadState,
    saveState,
    sanitizeState,
  };
})();
