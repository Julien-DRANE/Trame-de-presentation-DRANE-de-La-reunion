(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.ui = ns.ui || {};

  function getBloomMeta(id) {
    const bloomLevels = (ns.data && ns.data.bloomLevels) || [];
    return bloomLevels.find((level) => level.id === id) || bloomLevels[0] || { title: "Bloom" };
  }

  function getSlideLogoSources(options) {
    const opts = options || {};
    const logoSources = opts.logoSources || {};

    return {
      region: logoSources.region || "assets/images/8K 18_logo_REGIONS ACA_REUNION fb.png",
      drane: logoSources.drane || "assets/images/LOGO_DRANE.png",
    };
  }

  function resolveThemeName(slide, settings) {
    const theme = settings.theme || "mix";
    if (theme !== "random") {
      return theme;
    }

    const variants = ["circles", "waves", "mix"];
    const seedSource = String((slide && (slide.id || slide.number || slide.title)) || "slide");
    let hash = 0;
    for (let index = 0; index < seedSource.length; index += 1) {
      hash = ((hash * 31) + seedSource.charCodeAt(index)) >>> 0;
    }
    return variants[hash % variants.length];
  }

  function getColorPalette(paletteId) {
    const palettes = (ns.data && ns.data.colorPalettes) || [];
    return palettes.find((item) => item.id === paletteId) || palettes[0] || {
      id: "ocean",
      bgStart: "#ffffff",
      bgEnd: "#eef5fd",
      accent: "#2c73da",
      accentStrong: "#17478b",
      accentSoft: "rgba(44, 115, 218, 0.22)",
      accentSofter: "rgba(44, 115, 218, 0.08)",
      accentWave: "rgba(44, 115, 218, 0.2)",
      accentWaveSoft: "rgba(44, 115, 218, 0.08)",
      accentDeepSoft: "rgba(23, 71, 139, 0.14)",
      surface: "rgba(255, 255, 255, 0.72)",
      surfaceStrong: "rgba(255, 255, 255, 0.76)",
      text: "#122033",
      textMuted: "#5d6c81",
      textSoft: "rgba(18, 32, 51, 0.44)",
      line: "rgba(18, 32, 51, 0.12)",
    };
  }

  function getSlidePalette(slide, settings) {
    return getColorPalette((slide && slide.paletteOverride) || (settings && settings.palette) || "ocean");
  }

  function getFontOption(fontId) {
    const fonts = (ns.data && ns.data.fontOptions) || [];
    return fonts.find((item) => item.id === fontId) || fonts[0] || {
      id: "studio",
      body: '"Aptos", "Segoe UI", "Trebuchet MS", sans-serif',
      heading: '"Iowan Old Style", "Georgia", serif',
      pptBody: "Aptos",
      pptHeading: "Georgia",
    };
  }

  function getDeckFont(settings) {
    return getFontOption((settings && settings.font) || "studio");
  }

  function createSlidePaletteStyle(slide, settings) {
    const palette = getSlidePalette(slide, settings);
    const font = getDeckFont(settings);
    return [
      `--slide-bg-start:${palette.bgStart}`,
      `--slide-bg-end:${palette.bgEnd}`,
      `--slide-accent:${palette.accent}`,
      `--slide-accent-strong:${palette.accentStrong}`,
      `--slide-accent-soft:${palette.accentSoft}`,
      `--slide-accent-softer:${palette.accentSofter}`,
      `--slide-accent-wave:${palette.accentWave}`,
      `--slide-accent-wave-soft:${palette.accentWaveSoft}`,
      `--slide-accent-deep-soft:${palette.accentDeepSoft}`,
      `--slide-surface:${palette.surface}`,
      `--slide-surface-strong:${palette.surfaceStrong}`,
      `--slide-text:${palette.text}`,
      `--slide-text-muted:${palette.textMuted}`,
      `--slide-text-soft:${palette.textSoft}`,
      `--slide-line:${palette.line}`,
      `--slide-font-body:${font.body}`,
      `--slide-font-heading:${font.heading}`,
    ].join(";");
  }

  function normalizeTable(tableInput) {
    const rows = Array.isArray(tableInput) ? tableInput.slice(0, 8).map((row) => Array.isArray(row) ? row.slice(0, 6) : []) : [];
    const rowCount = Math.max(2, rows.length);
    const colCount = Math.max(2, rows.reduce((max, row) => Math.max(max, row.length), 0));
    while (rows.length < rowCount) {
      rows.push([]);
    }
    rows.forEach((row) => {
      while (row.length < colCount) {
        row.push("");
      }
    });
    return rows;
  }

  function getSlideMedia(slide, options) {
    return getResolvedMediaById(slide && slide.mediaId, options);
  }

  function getResolvedMediaById(mediaId, options) {
    const opts = options || {};
    const mediaItems = Array.isArray(opts.mediaItems) ? opts.mediaItems : [];
    const mediaUrls = opts.mediaUrls || {};
    if (!mediaId) {
      return null;
    }

    const mediaItem = mediaItems.find((item) => item.id === mediaId);
    if (!mediaItem || !mediaUrls[mediaId]) {
      return null;
    }

    return {
      id: mediaItem.id,
      kind: mediaItem.kind,
      name: mediaItem.name,
      src: mediaUrls[mediaId],
      embedUrl: mediaItem.embedUrl,
      externalUrl: mediaItem.externalUrl,
      provider: mediaItem.provider,
      pdfLinkHref: opts.mediaLinks ? opts.mediaLinks[mediaId] : "",
    };
  }

  function createResolvedMediaMarkup(media, options) {
    const utils = ns.utils;
    const isCompact = Boolean(options && options.compact);
    if (!media) {
      return "";
    }

    if (options && options.pdfMode && (media.kind === "video" || media.kind === "embed")) {
      return `
        <div class="slide-media-print-card">
          <img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />
          ${media.pdfLinkHref ? `<a class="slide-media-link" href="${utils.escapeHtml(media.pdfLinkHref)}" target="_blank" rel="noopener noreferrer">${utils.escapeHtml(media.pdfLinkHref)}</a>` : ""}
        </div>
      `;
    }

    if (options && options.exportMode === "html" && media.kind === "embed") {
      return `
        <div class="slide-media-print-card">
          <img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />
          ${media.pdfLinkHref ? `<a class="slide-media-link" href="${utils.escapeHtml(media.pdfLinkHref)}" target="_blank" rel="noopener noreferrer">Ouvrir la vidÃ©o</a>` : ""}
        </div>
      `;
    }

    if (media.kind === "embed" && media.provider === "apps-education") {
      const linkHref = media.externalUrl || media.embedUrl || "";
      return `
        <div class="slide-media-print-card">
          ${linkHref ? `
            <a class="slide-media-external-link" href="${utils.escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la vidÃ©o ${utils.escapeHtml(media.name)}">
              <img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />
            </a>
          ` : `<img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />`}
          ${linkHref ? `<a class="slide-media-link" href="${utils.escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer">Ouvrir la vidÃ©o</a>` : ""}
        </div>
      `;
    }

    if (media.kind === "embed") {
      return `
        <div class="slide-media-embed-wrap">
          <iframe
            class="slide-media-embed"
            src="${utils.escapeHtml(media.embedUrl || media.src)}"
            title="${utils.escapeHtml(media.name)}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }

    if (media.kind === "video") {
      return `
        <video class="slide-media-video" src="${utils.escapeHtml(media.src)}" ${isCompact ? 'muted playsinline preload="metadata"' : 'controls preload="metadata"'}>
          Votre navigateur ne peut pas lire cette vidÃ©o.
        </video>
      `;
    }

    return `<img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />`;
  }

  function createSlideMediaMarkup(slide, options) {
    return createResolvedMediaMarkup(getSlideMedia(slide, options), options);
  }

  function createBulletListMarkup(items, options) {
    const utils = ns.utils;
    const opts = options || {};
    const numbered = Boolean(opts.numbered);
    const startAt = Math.max(1, Number(opts.startAt) || 1);
    const className = opts.className || "slide-bullets";
    const progressive = Boolean(opts.progressive);

    return `
      <ul class="${className}${numbered ? " is-numbered" : ""}">
        ${items
          .map((item, index) => {
            const bulletItem = typeof item === "string" ? { text: item, children: [] } : item;
            const marker = numbered
              ? `<span class="slide-bullet-marker">${String(startAt + index).padStart(2, "0")}</span>`
              : "";
            const revealAttrs = progressive
              ? ` data-reveal-step="${startAt + index}" class="slide-reveal-item"`
              : "";
            const childrenMarkup = Array.isArray(bulletItem.children) && bulletItem.children.length
              ? `
                <ul class="slide-sub-bullets">
                  ${bulletItem.children.map((child) => `<li>${utils.escapeHtml(child)}</li>`).join("")}
                </ul>
              `
              : "";
            return `<li${revealAttrs}>${marker}<div class="slide-bullet-text">${utils.escapeHtml(bulletItem.text || "")}${childrenMarkup}</div></li>`;
          })
          .join("")}
      </ul>
    `;
  }

  function buildBulletItems(slide) {
    const bullets = Array.isArray(slide && slide.bullets)
      ? slide.bullets.filter((item) => item && item.trim())
      : [];
    const subBullets = slide && slide.subBullets && typeof slide.subBullets === "object"
      ? slide.subBullets
      : {};

    return bullets.map((text, index) => ({
      text,
      children: Array.isArray(subBullets[index]) ? subBullets[index].filter((item) => item && item.trim()) : [],
    }));
  }

  function splitBulletsForLayout(bulletsInput) {
    const bullets = Array.isArray(bulletsInput) ? bulletsInput : [];

    if (bullets.length > 3) {
      const leftCount = Math.ceil(bullets.length / 2);
      return {
        mainBullets: bullets.slice(0, leftCount),
        extraBullets: bullets.slice(leftCount),
      };
    }

    return {
      mainBullets: bullets.slice(0, 3),
      extraBullets: bullets.slice(3),
    };
  }

  function getTableCellFillStyle(tableHighlights, rowIndex, columnIndex) {
    const rowColor = tableHighlights && tableHighlights.rows ? tableHighlights.rows[String(rowIndex)] : "";
    const columnColor = tableHighlights && tableHighlights.columns ? tableHighlights.columns[String(columnIndex)] : "";
    const color = rowColor || columnColor;
    return color ? `background:${ns.utils.escapeHtml(color)};` : "";
  }

  function createTableMarkup(tableInput, tableHighlights, options) {
    const table = normalizeTable(tableInput);
    const columnCount = table[0] ? table[0].length : 0;
    const opts = options || {};
    const progressive = Boolean(opts.progressive);
    const progressiveOrder = opts.progressiveOrder === "column" ? "column" : "row";
    const bodyRowCount = Math.max(0, table.length - 1);
    const densityClass = table.length >= 7
      ? " slide-table-dense-3"
      : table.length >= 6
        ? " slide-table-dense-2"
        : table.length >= 5
          ? " slide-table-dense-1"
          : "";
    return `
      <div class="slide-table${densityClass}">
        ${table.map((row, rowIndex) => `
          <div class="slide-table-row${progressive && rowIndex > 0 && columnCount > 2 ? " slide-reveal-item" : ""}" style="grid-template-columns: repeat(${row.length}, minmax(0, 1fr));"${progressive && rowIndex > 0 && columnCount > 2 ? ` data-reveal-step="${rowIndex}"` : ""}>
            ${row.map((cell, columnIndex) => {
              const isHeaderCell = rowIndex === 0 || (columnCount > 2 && columnIndex === 0);
              const headerClass = isHeaderCell ? " slide-table-cell-header" : "";
              const fillStyle = getTableCellFillStyle(tableHighlights, rowIndex, columnIndex);
              const revealStep = progressiveOrder === "column"
                ? (columnIndex * bodyRowCount) + rowIndex
                : ((rowIndex - 1) * columnCount) + columnIndex + 1;
              const revealAttrs = progressive && rowIndex > 0 && columnCount <= 2
                ? ` class="slide-table-cell${headerClass} slide-reveal-item" data-reveal-step="${revealStep}"`
                : ` class="slide-table-cell${headerClass}"`;
              return `<div${revealAttrs}${fillStyle ? ` style="${fillStyle}"` : ""}>${ns.utils.escapeHtml(cell || "")}</div>`;
            }).join("")}
          </div>
        `).join("")}
      </div>
    `;
  }

  function createFreeMarkup(slide, options) {
    const utils = ns.utils;
    const bodyMarkup = utils.sanitizeRichText(slide.freeBody || "", 1600);
    const freeLinks = Array.isArray(slide.freeLinks) ? slide.freeLinks : [];
    const linksMarkup = freeLinks.length
      ? `
        <div class="slide-free-links">
          ${freeLinks
            .map((item) => {
              const label = item.label || item.url;
              return `<a class="slide-free-link" href="${utils.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${utils.escapeHtml(label)}</a>`;
            })
            .join("")}
        </div>
      `
      : "";
    const galleryIds = Array.isArray(slide.freeMediaIds) ? slide.freeMediaIds : [];
    const galleryMarkup = galleryIds.length
      ? `
        <div class="slide-free-gallery">
          ${galleryIds
            .map((mediaId) => {
              const media = getResolvedMediaById(mediaId, options);
              const mediaMarkup = createResolvedMediaMarkup(media, options);
              return mediaMarkup ? `<div class="slide-free-gallery-item">${mediaMarkup}</div>` : "";
            })
            .join("")}
        </div>
      `
      : "";

    return `
      <div class="slide-free-body">
        ${bodyMarkup}
        ${linksMarkup}
        ${galleryMarkup}
      </div>
    `;
  }

  function createSlideMarkup(slide, settings, options) {
    const opts = options || {};
    const utils = ns.utils;
    const bloomMeta = getBloomMeta(slide.bloomLevel);
    const logoSources = getSlideLogoSources(opts);
    const slideMedia = getSlideMedia(slide, opts);
    const isTableMode = slide.contentType === "table";
    const isFreeMode = slide.contentType === "free";
    const allBullets = buildBulletItems(slide);
    const bulletColumns = splitBulletsForLayout(allBullets);
    const mainBullets = bulletColumns.mainBullets;
    const extraBullets = bulletColumns.extraBullets;
    const bulletsNumbered = Boolean(slide.bulletsNumbered);
    const bulletsProgressive = Boolean(slide.bulletsProgressive) && !opts.compact && !isFreeMode && !isTableMode;
    const tableProgressive = Boolean(slide.tableProgressive) && !opts.compact && isTableMode;
    const tableProgressiveOrder = slide.tableProgressiveOrder === "column" ? "column" : "row";
    const canKeepMediaWithExtendedBullets = Boolean(slideMedia) && allBullets.length > 3 && allBullets.length <= 6;
    const bulletMarkup = mainBullets.length
      ? createBulletListMarkup(mainBullets, {
          className: "slide-bullets",
          numbered: bulletsNumbered,
          startAt: 1,
          progressive: bulletsProgressive,
        })
      : createBulletListMarkup(["Ajoutez un point cle pour structurer la slide."], {
          className: "slide-bullets",
          numbered: false,
          startAt: 1,
          progressive: false,
        });
    const extendedBulletMarkup = createBulletListMarkup(
      allBullets.length ? allBullets : ["Ajoutez un point cle pour structurer la slide."],
      {
        className: "slide-bullets",
        numbered: allBullets.length ? bulletsNumbered : false,
        startAt: 1,
        progressive: allBullets.length ? bulletsProgressive : false,
      }
    );
    const compactClass = opts.compact ? " deck-slide-compact" : "";
    const bloomPill = opts.compact ? `<span class="slide-bloom-pill">${utils.escapeHtml(bloomMeta.title)}</span>` : "";
    const sideMarkup = extraBullets.length
      ? createBulletListMarkup(extraBullets, {
          className: "slide-side-bullets",
          numbered: bulletsNumbered,
          startAt: mainBullets.length + 1,
          progressive: bulletsProgressive,
        })
      : createSlideMediaMarkup(slide, opts);
    const subtitle = slide.subtitle ? `<p class="slide-subtitle-text">${utils.escapeHtml(slide.subtitle)}</p>` : "";
    const signature = settings.footer ? `<span class="slide-signature">${utils.escapeHtml(settings.footer)}</span>` : "";
    const note = slide.note
      ? `<div class="slide-note">${utils.linkifyText(slide.note)}</div>`
      : "";

    let contentMarkup = "";
    let footerNoteMarkup = note;
    const mediaMarkup = createSlideMediaMarkup(slide, opts);

    if (isFreeMode) {
      contentMarkup = createFreeMarkup(slide, opts);
    } else if (isTableMode) {
      contentMarkup = createTableMarkup(slide.table, slide.tableHighlights, {
        progressive: tableProgressive,
        progressiveOrder: tableProgressiveOrder,
      });
    } else if (canKeepMediaWithExtendedBullets) {
      contentMarkup = extendedBulletMarkup;
    } else if (extraBullets.length) {
      contentMarkup = `
        <div class="slide-bullets-row slide-bullets-row-extra">
          ${bulletMarkup}
          <aside class="slide-media-slot slide-side-bullets-slot">${sideMarkup}</aside>
        </div>
      `;
    } else {
      contentMarkup = bulletMarkup;
    }

    const themeName = resolveThemeName(slide, settings);
    const paletteStyle = createSlidePaletteStyle(slide, settings);

    return `
      <article class="deck-slide theme-${utils.escapeHtml(themeName)}${compactClass}" data-progressive-content="${bulletsProgressive || tableProgressive ? "true" : "false"}" style="${utils.escapeHtml(paletteStyle)}">
        <div class="slide-wave" aria-hidden="true"></div>
        <img class="slide-logo slide-logo-region" src="${utils.escapeHtml(logoSources.region)}" alt="Logo region academique" />
        <img class="slide-logo slide-logo-drane" src="${utils.escapeHtml(logoSources.drane)}" alt="Logo Drane" />
        <div class="slide-content">
          <div class="slide-topline">
            <div class="slide-meta-right">
              ${bloomPill}
              <span class="slide-number-badge">${utils.escapeHtml(slide.number || "")}</span>
            </div>
          </div>
          <div class="${slideMedia && (!extraBullets.length || isTableMode || canKeepMediaWithExtendedBullets) && !isFreeMode ? "slide-body" : "slide-body slide-body-no-media"}">
            <div class="slide-main">
              <h3 class="slide-headline">${utils.escapeHtml(slide.title || "Titre Ã  complÃ©ter")}</h3>
              ${subtitle}
              ${contentMarkup}
            </div>
            ${slideMedia && (!extraBullets.length || isTableMode || canKeepMediaWithExtendedBullets) && !isFreeMode ? `<aside class="slide-media-slot">${mediaMarkup}</aside>` : ""}
          </div>
          <div class="slide-footer">
            ${footerNoteMarkup}
            ${signature}
          </div>
        </div>
      </article>
    `;
  }

  function computeDensity(slide) {
    const totalChars =
      (slide.title || "").length +
      (slide.subtitle || "").length +
      (slide.note || "").length +
      (slide.objective || "").length +
      (slide.evidence || "").length +
      (slide.bullets || []).join("").length +
      Object.values(slide.subBullets || {}).flat().join("").length;
    const bulletCount = (slide.bullets || []).filter((item) => item && item.trim()).length;

    if (totalChars > 420 || (slide.subtitle || "").length > 150 || (slide.objective || "").length > 160) {
      return {
        label: "Trop dense",
        className: "density-badge density-alert",
      };
    }

    if (totalChars > 300 || bulletCount === 3) {
      return {
        label: "A surveiller",
        className: "density-badge density-warn",
      };
    }

    return {
      label: "Concis",
      className: "density-badge density-ok",
    };
  }

  ns.ui.getBloomMeta = getBloomMeta;
  ns.ui.getSlideLogoSources = getSlideLogoSources;
  ns.ui.createSlideMarkup = createSlideMarkup;
  ns.ui.computeDensity = computeDensity;
})();
