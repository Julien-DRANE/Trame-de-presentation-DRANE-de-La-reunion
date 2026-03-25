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

  function getSlideMedia(slide, options) {
    const opts = options || {};
    const mediaItems = Array.isArray(opts.mediaItems) ? opts.mediaItems : [];
    const mediaUrls = opts.mediaUrls || {};
    const mediaId = slide && slide.mediaId;
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

  function createSlideMediaMarkup(slide, options) {
    const media = getSlideMedia(slide, options);
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

  function createExtraBulletsMarkup(items) {
    const utils = ns.utils;
    return `
      <ul class="slide-side-bullets">
        ${items.map((item) => `<li>${utils.escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  function createSlideMarkup(slide, settings, options) {
    const opts = options || {};
    const utils = ns.utils;
    const bloomMeta = getBloomMeta(slide.bloomLevel);
    const logoSources = getSlideLogoSources(opts);
    const slideMedia = getSlideMedia(slide, opts);
    const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    const mainBullets = bullets
      .slice(0, 3)
      .filter((item) => item && item.trim());
    const extraBullets = bullets
      .slice(3)
      .filter((item) => item && item.trim());
    const bulletMarkup = mainBullets.length
      ? mainBullets.map((item) => `<li>${utils.escapeHtml(item)}</li>`).join("")
      : "<li>Ajoutez un point clé pour structurer la slide.</li>";
    const compactClass = opts.compact ? " deck-slide-compact" : "";
    const sideMarkup = extraBullets.length
      ? createExtraBulletsMarkup(extraBullets)
      : createSlideMediaMarkup(slide, opts);
    const hasSideContent = Boolean(extraBullets.length || slideMedia);
    const bodyClass = hasSideContent ? "slide-body" : "slide-body slide-body-no-media";
    const sideClass = extraBullets.length ? " slide-side-bullets-slot" : "";
    const subtitle = slide.subtitle
      ? `<p class="slide-subtitle-text">${utils.escapeHtml(slide.subtitle)}</p>`
      : "";
    const signature = settings.footer ? `<span class="slide-signature">${utils.escapeHtml(settings.footer)}</span>` : "";
    const note = slide.note
      ? `<div class="slide-note">${utils.escapeHtml(slide.note)}</div>`
      : "";

    return `
      <article class="deck-slide theme-${utils.escapeHtml(settings.theme || "mix")}${compactClass}">
        <div class="slide-wave" aria-hidden="true"></div>
        <img class="slide-logo slide-logo-region" src="${utils.escapeHtml(logoSources.region)}" alt="Logo région académique" />
        <img class="slide-logo slide-logo-drane" src="${utils.escapeHtml(logoSources.drane)}" alt="Logo Drane" />
        <div class="slide-content">
          <div class="slide-topline">
            <div class="slide-meta-right">
              <span class="slide-bloom-pill">${utils.escapeHtml(bloomMeta.title)}</span>
              <span class="slide-number-badge">${utils.escapeHtml(slide.number || "")}</span>
            </div>
          </div>
          <div class="${bodyClass}">
            <div class="slide-main">
              <h3 class="slide-headline">${utils.escapeHtml(slide.title || "Titre à compléter")}</h3>
              ${subtitle}
              ${extraBullets.length ? `
                <div class="slide-bullets-row">
                  <ul class="slide-bullets">${bulletMarkup}</ul>
                  <aside class="slide-media-slot${sideClass}">${sideMarkup}</aside>
                </div>
              ` : `<ul class="slide-bullets">${bulletMarkup}</ul>`}
            </div>
            ${!extraBullets.length && slideMedia ? `<aside class="slide-media-slot">${sideMarkup}</aside>` : ""}
          </div>
          <div class="slide-footer">
            ${note}
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
