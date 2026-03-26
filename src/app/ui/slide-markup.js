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
      drane: logoSources.drane || "assets/images/LOGO_DRANE.jpg",
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
          ${media.pdfLinkHref ? `<a class="slide-media-link" href="${utils.escapeHtml(media.pdfLinkHref)}" target="_blank" rel="noopener noreferrer">Ouvrir la vidéo</a>` : ""}
        </div>
      `;
    }

    if (media.kind === "embed" && media.provider === "apps-education") {
      const linkHref = media.externalUrl || media.embedUrl || "";
      return `
        <div class="slide-media-print-card">
          ${linkHref ? `
            <a class="slide-media-external-link" href="${utils.escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la vidéo ${utils.escapeHtml(media.name)}">
              <img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />
            </a>
          ` : `<img class="slide-media-image" src="${utils.escapeHtml(media.src)}" alt="${utils.escapeHtml(media.name)}" />`}
          ${linkHref ? `<a class="slide-media-link" href="${utils.escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer">Ouvrir la vidéo</a>` : ""}
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
          Votre navigateur ne peut pas lire cette vidéo.
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

    return `
      <ul class="${className}${numbered ? " is-numbered" : ""}">
        ${items
          .map((item, index) => {
            const marker = numbered
              ? `<span class="slide-bullet-marker">${String(startAt + index).padStart(2, "0")}</span>`
              : "";
            return `<li>${marker}<span class="slide-bullet-text">${utils.escapeHtml(item)}</span></li>`;
          })
          .join("")}
      </ul>
    `;
  }

  function splitBulletsForLayout(bulletsInput) {
    const bullets = Array.isArray(bulletsInput)
      ? bulletsInput.filter((item) => item && item.trim())
      : [];

    if (bullets.length > 6) {
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

  function createTableMarkup(tableInput) {
    const table = normalizeTable(tableInput);
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
          <div class="slide-table-row" style="grid-template-columns: repeat(${row.length}, minmax(0, 1fr));">
            ${row.map((cell, columnIndex) => {
              const headerClass = rowIndex === 0 || columnIndex === 0 ? " slide-table-cell-header" : "";
              return `<div class="slide-table-cell${headerClass}">${ns.utils.escapeHtml(cell || "")}</div>`;
            }).join("")}
          </div>
        `).join("")}
      </div>
    `;
  }

  function createFreeMarkup(slide, options) {
    const utils = ns.utils;
    const bodyLines = String(slide.freeBody || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const bodyMarkup = bodyLines.length
      ? bodyLines.map((line) => `<p>${utils.escapeHtml(line)}</p>`).join("")
      : "<p>Ajoutez un texte plus développé pour cette annexe.</p>";
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
    const bulletColumns = splitBulletsForLayout(slide.bullets);
    const mainBullets = bulletColumns.mainBullets;
    const extraBullets = bulletColumns.extraBullets;
    const bulletsNumbered = Boolean(slide.bulletsNumbered);
    const bulletMarkup = mainBullets.length
      ? createBulletListMarkup(mainBullets, {
          className: "slide-bullets",
          numbered: bulletsNumbered,
          startAt: 1,
        })
      : createBulletListMarkup(["Ajoutez un point cle pour structurer la slide."], {
          className: "slide-bullets",
          numbered: false,
          startAt: 1,
        });
    const compactClass = opts.compact ? " deck-slide-compact" : "";
    const bloomPill = opts.compact ? `<span class="slide-bloom-pill">${utils.escapeHtml(bloomMeta.title)}</span>` : "";
    const sideMarkup = extraBullets.length
      ? createBulletListMarkup(extraBullets, {
          className: "slide-side-bullets",
          numbered: bulletsNumbered,
          startAt: mainBullets.length + 1,
        })
      : createSlideMediaMarkup(slide, opts);
    const subtitle = slide.subtitle ? `<p class="slide-subtitle-text">${utils.escapeHtml(slide.subtitle)}</p>` : "";
    const signature = settings.footer ? `<span class="slide-signature">${utils.escapeHtml(settings.footer)}</span>` : "";
    const note = slide.note ? `<div class="slide-note">${utils.escapeHtml(slide.note)}</div>` : "";

    let contentMarkup = "";
    let footerNoteMarkup = isTableMode || isFreeMode ? "" : note;
    const mediaMarkup = createSlideMediaMarkup(slide, opts);

    if (isFreeMode) {
      contentMarkup = createFreeMarkup(slide, opts);
    } else if (isTableMode) {
      contentMarkup = createTableMarkup(slide.table);
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

    return `
      <article class="deck-slide theme-${utils.escapeHtml(themeName)}${compactClass}">
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
          <div class="${slideMedia && (!extraBullets.length || isTableMode) && !isFreeMode ? "slide-body" : "slide-body slide-body-no-media"}">
            <div class="slide-main">
              <h3 class="slide-headline">${utils.escapeHtml(slide.title || "Titre à compléter")}</h3>
              ${subtitle}
              ${contentMarkup}
            </div>
            ${slideMedia && (!extraBullets.length || isTableMode) && !isFreeMode ? `<aside class="slide-media-slot">${mediaMarkup}</aside>` : ""}
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
      (slide.bullets || []).join("").length;
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
