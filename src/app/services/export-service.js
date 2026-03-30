(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.services = ns.services || {};

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function exportJson(state) {
    const fileName = `${ns.utils.slugify(state.settings.title || "presentation")}.json`;
    const mediaDataMap = await ns.services.media.resolveExportMediaUrls(state.mediaLibrary || []);
    const exportPayload = Object.assign({}, state, { mediaDataMap });
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, fileName);
  }

  async function resolveLogoAsDataUrl(src) {
    try {
      const response = await fetch(src);
      if (!response.ok) {
        return src;
      }
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return src;
    }
  }

  async function resolveLogoSources() {
    const defaults = ns.ui.getSlideLogoSources();
    const [region, drane] = await Promise.all([
      resolveLogoAsDataUrl(defaults.region),
      resolveLogoAsDataUrl(defaults.drane),
    ]);

    return { region, drane };
  }

  async function buildPresentationHtml(state, logoSources, options) {
    const opts = options || {};
    const startSlideId = opts.startSlideId || "";
    const pdfMediaAssets = opts.pdfMode || opts.exportMode === "html"
      ? await ns.services.media.resolvePdfMediaAssets(state.mediaLibrary || [])
      : null;
    const mediaUrls = opts.pdfMode
      ? pdfMediaAssets.previewMap
      : await ns.services.media.resolveExportMediaUrls(state.mediaLibrary || []);
    const mediaLinks = pdfMediaAssets ? pdfMediaAssets.linkMap : {};
    const mergedMediaUrls = Object.assign({}, mediaUrls);

    if (opts.exportMode === "html" && pdfMediaAssets) {
      (state.mediaLibrary || []).forEach((item) => {
        if (item.kind === "embed") {
          mergedMediaUrls[item.id] = pdfMediaAssets.previewMap[item.id] || mergedMediaUrls[item.id] || "";
        }
      });
    }

    const slidesMarkup = state.slides
      .map((slide) => {
        return `<section class="slide-screen">${ns.ui.createSlideMarkup(slide, state.settings, {
          compact: false,
          pdfMode: Boolean(opts.pdfMode),
          exportMode: opts.exportMode || "",
          logoSources,
          mediaItems: state.mediaLibrary || [],
          mediaUrls: mergedMediaUrls,
          mediaLinks,
        })}</section>`;
      })
      .join("");
    const initialSlideIndex = Math.max(0, state.slides.findIndex((slide) => slide.id === startSlideId));

    return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ns.utils.escapeHtml(state.settings.title)}</title>
    <style>
      :root {
        --ink: #122033;
        --muted: #5d6c81;
        --blue: #2c73da;
        --blue-deep: #17478b;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--ink);
        font-family: Aptos, "Segoe UI", "Trebuchet MS", sans-serif;
        background: linear-gradient(160deg, #edf3f9, #d7e4f3);
      }
      .deck-shell { min-height: 100vh; padding: 1.2rem; }
      main {
        display: block;
      }
      .deck-topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: 0.85rem 1rem;
        border-radius: 999px;
        background: rgba(15, 33, 55, 0.88);
        color: #ffffff;
        backdrop-filter: blur(12px);
      }
      .deck-meta { display: flex; flex-direction: column; gap: 0.15rem; }
      .deck-meta strong { font-size: 1rem; }
      .deck-meta span { font-size: 0.82rem; color: rgba(255,255,255,0.78); }
      .deck-nav { display: flex; gap: 0.6rem; }
      .deck-nav button {
        min-height: 2.8rem;
        padding: 0.7rem 0.95rem;
        border: 0;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        color: #ffffff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      a { color: #17478b; }
      .slide-screen {
        display: none;
        min-height: calc(100vh - 6rem);
        align-items: center;
        justify-content: center;
      }
      .slide-screen.is-active { display: flex; }
      .deck-slide {
        --slide-bg-start: #ffffff;
        --slide-bg-end: #eef5fd;
        --slide-accent: #2c73da;
        --slide-accent-strong: #17478b;
        --slide-accent-soft: rgba(44,115,218,0.22);
        --slide-accent-softer: rgba(44,115,218,0.08);
        --slide-accent-wave: rgba(44,115,218,0.2);
        --slide-accent-wave-soft: rgba(44,115,218,0.08);
        --slide-accent-deep-soft: rgba(23,71,139,0.14);
        --slide-surface: rgba(255,255,255,0.72);
        --slide-surface-strong: rgba(255,255,255,0.76);
        --slide-text: var(--ink);
        --slide-text-muted: var(--muted);
        --slide-text-soft: rgba(18,32,51,0.44);
        --slide-line: rgba(18,32,51,0.12);
        --slide-font-body: Aptos, "Segoe UI", "Trebuchet MS", sans-serif;
        --slide-font-heading: "Iowan Old Style", Georgia, serif;
        position: relative;
        overflow: hidden;
        width: min(1280px, calc(100vw - 3rem));
        aspect-ratio: 16 / 9;
        padding: clamp(1.15rem, 2vw, 1.8rem);
        border-radius: 26px;
        background: linear-gradient(155deg, var(--slide-bg-start), var(--slide-bg-end) 68%);
        color: var(--slide-text);
        font-family: var(--slide-font-body);
        box-shadow: 0 20px 44px rgba(11, 22, 42, 0.2);
      }
      main:fullscreen {
        width: 100vw;
        height: 100vh;
        background: linear-gradient(160deg, #edf3f9, #d7e4f3);
        overflow: hidden;
      }
      main:fullscreen .slide-screen {
        min-height: 100vh;
        width: 100vw;
        padding: 0;
      }
      main:fullscreen .deck-slide {
        width: 1280px;
        height: 720px;
        max-width: none;
        max-height: none;
        border-radius: 0;
        transform: scale(var(--deck-fullscreen-scale, 1));
        transform-origin: center center;
      }
      body.deck-is-fullscreen .deck-shell {
        padding: 0;
      }
      body.deck-is-fullscreen .deck-topbar {
        display: none;
      }
      .deck-slide::before,
      .deck-slide::after { content: ""; position: absolute; pointer-events: none; }
      .deck-slide.theme-circles::before,
      .deck-slide.theme-mix::before {
        top: -11%;
        right: calc(-5% - 1cm);
        width: 31%;
        aspect-ratio: 1;
        border-radius: 50%;
        background:
          radial-gradient(circle at 45% 40%, rgba(255,255,255,0.9) 0 18%, transparent 19%),
          radial-gradient(circle at center, var(--slide-accent-soft) 0 56%, var(--slide-accent-softer) 57% 74%, transparent 75%);
      }
      .deck-slide.theme-circles::after,
      .deck-slide.theme-mix::after {
        left: -4%;
        bottom: -10%;
        width: 22%;
        aspect-ratio: 1;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, var(--slide-accent-deep-soft) 0 56%, var(--slide-accent-softer) 57% 72%, transparent 73%);
      }
      .slide-wave {
        position: absolute;
        right: -6%;
        bottom: -6%;
        width: 54%;
        height: 28%;
        display: none;
        border-top-left-radius: 100% 100%;
        background:
          linear-gradient(180deg, var(--slide-accent-softer), var(--slide-accent-wave)),
          linear-gradient(90deg, rgba(255,255,255,0.64), transparent);
      }
      .slide-wave::before,
      .slide-wave::after {
        content: "";
        position: absolute;
        inset: auto auto 20% -8%;
        width: 92%;
        height: 60%;
        border-top-left-radius: 100% 100%;
        border-top-right-radius: 18% 50%;
        background: var(--slide-accent-wave-soft);
      }
      .slide-wave::after {
        bottom: 42%;
        left: 12%;
        width: 72%;
        background: var(--slide-accent-softer);
      }
      .deck-slide.theme-waves .slide-wave,
      .deck-slide.theme-mix .slide-wave { display: block; }
      .slide-logo {
        position: absolute;
        z-index: 1;
        object-fit: contain;
        pointer-events: none;
      }
      .slide-logo-region {
        top: clamp(0.9rem, 1.8vw, 1.5rem);
        left: clamp(1rem, 2vw, 1.7rem);
        width: clamp(8.075rem, 15.2vw, 10.925rem);
        max-width: 22.8%;
      }
      .slide-logo-drane {
        right: clamp(1rem, 2vw, 1.5rem);
        bottom: clamp(0.8rem, 1.7vw, 1.3rem);
        width: clamp(3.2rem, 7vw, 4.8rem);
        max-width: 11%;
        border-radius: 10px;
      }
      .slide-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-top: clamp(2.15rem, 4.1vw, 3.15rem);
        padding-right: clamp(3.6rem, 7vw, 5.2rem);
        padding-left: clamp(1.2rem, 2.4vw, 2rem);
      }
      .slide-topline {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
        padding-left: clamp(8.8rem, 16vw, 12rem);
      }
      .slide-label-pill,
      .slide-bloom-pill {
        display: inline-flex;
        align-items: center;
        min-height: 1.95rem;
        padding: 0.35rem 0.72rem;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .slide-label-pill {
        background: var(--slide-accent-softer);
        color: var(--slide-accent-strong);
      }
      .slide-meta-right {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-left: auto;
        max-width: 100%;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .slide-bloom-pill {
        background: var(--slide-line);
        color: var(--slide-text);
      }
      .slide-number-badge {
        color: var(--slide-text-soft);
        font-size: 0.86rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .slide-headline {
        margin-top: 0.88rem;
        max-width: 16ch;
        font-family: var(--slide-font-heading);
        font-size: clamp(1.56rem, 2.82vw, 2.56rem);
        line-height: 0.98;
      }
      .slide-body-no-media .slide-headline {
        max-width: 20ch;
      }
      .slide-body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(16rem, 37%, 23.5rem);
        gap: clamp(1rem, 2vw, 1.4rem);
        align-items: start;
      }
      .slide-main { min-width: 0; }
      .slide-main,
      .slide-body > .slide-media-slot,
      .slide-bullets-row > .slide-media-slot {
        margin-left: clamp(1.2rem, 2.4vw, 2rem);
      }
      .slide-bullets-row > .slide-side-bullets-slot {
        margin-left: -1.8rem;
      }
      .slide-body-no-media { grid-template-columns: minmax(0, 1fr); }
      .slide-bullets-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(16rem, 37%, 23.5rem);
        gap: clamp(1rem, 2vw, 1.4rem);
        align-items: start;
      }
      .slide-subtitle-text {
        max-width: 54ch;
        margin-top: 0;
        color: var(--slide-text-muted);
        font-size: clamp(1.12rem, 1.7vw, 1.38rem);
        line-height: 1.46;
      }
      .slide-bullets {
        display: grid;
        gap: 0.7rem;
        margin-top: 0.86rem;
        padding: 0;
        list-style: none;
      }
      .slide-bullets li {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.7rem;
        align-items: start;
        max-width: 48ch;
        font-size: 1.12rem;
        line-height: 1.56;
      }
      .slide-bullets li::before {
        content: "";
        width: 0.8rem;
        height: 0.8rem;
        margin-top: 0.35rem;
        border-radius: 50%;
        background: linear-gradient(145deg, var(--slide-accent), var(--slide-accent-strong));
        box-shadow: 0 0 0 6px var(--slide-accent-softer);
      }
      .slide-bullets.is-numbered li::before,
      .slide-side-bullets.is-numbered li::before {
        content: none;
        display: none;
      }
      .slide-bullets.is-numbered .slide-sub-bullets li::before,
      .slide-side-bullets.is-numbered .slide-sub-bullets li::before {
        content: "";
        display: block;
      }
      .slide-bullet-marker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        min-height: 2rem;
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        background: var(--slide-accent-softer);
        color: var(--slide-accent-strong);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        line-height: 1;
      }
      .slide-bullet-text {
        min-width: 0;
      }
      .slide-sub-bullets {
        display: grid;
        gap: 0.38rem;
        margin-top: 0.5rem;
        padding-left: 1rem;
        list-style: none;
      }
      .slide-sub-bullets li {
        position: relative;
        color: var(--slide-text-muted);
        font-size: 0.92em;
        line-height: 1.38;
      }
      .slide-sub-bullets li::before {
        content: "";
        position: absolute;
        left: -0.8rem;
        top: 0.48rem;
        width: 0.34rem;
        height: 0.34rem;
        border-radius: 50%;
        background: var(--slide-accent-strong);
      }
      .slide-bullets.is-numbered li::before,
      .slide-side-bullets.is-numbered li::before {
        content: none;
        display: none;
      }
      .slide-bullet-marker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2rem;
        min-height: 2rem;
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        background: rgba(44,115,218,0.12);
        color: var(--blue-deep);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        line-height: 1;
      }
      .slide-bullet-text {
        min-width: 0;
      }
      .slide-table {
        display: grid;
        gap: 0;
        margin-top: 1.3rem;
        margin-inline: auto;
        width: min(100%, 64rem);
        border: 1px solid var(--slide-line);
        border-radius: 8px;
        overflow: hidden;
      }
      .slide-table-row {
        display: grid;
        gap: 0;
      }
      .slide-table-cell {
        min-height: 3rem;
        padding: 0.68rem 0.8rem;
        border-right: 1px solid var(--slide-line);
        border-bottom: 1px solid var(--slide-line);
        background: var(--slide-surface);
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .slide-table-row .slide-table-cell:last-child {
        border-right: 0;
      }
      .slide-table-row:last-child .slide-table-cell {
        border-bottom: 0;
      }
      .slide-table-cell-header {
        font-weight: 800;
      }
      .slide-table.slide-table-dense-1 .slide-table-cell {
        min-height: 2.7rem;
        padding: 0.58rem 0.72rem;
        font-size: 0.94rem;
        line-height: 1.34;
      }
      .slide-table.slide-table-dense-2 .slide-table-cell {
        min-height: 2.45rem;
        padding: 0.5rem 0.66rem;
        font-size: 0.88rem;
        line-height: 1.28;
      }
      .slide-table.slide-table-dense-3 .slide-table-cell {
        min-height: 2.2rem;
        padding: 0.42rem 0.58rem;
        font-size: 0.82rem;
        line-height: 1.22;
      }
      .slide-free-body {
        display: grid;
        gap: 0.72rem;
        max-width: 70rem;
        margin-top: 1.2rem;
      }
      .slide-free-body p {
        margin: 0;
        color: var(--slide-text-muted);
        line-height: 1.36;
      }
      .slide-free-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }
      .slide-free-link {
        display: inline-flex;
        align-items: center;
        min-height: 2.1rem;
        padding: 0.42rem 0.75rem;
        border-radius: 999px;
        background: var(--slide-accent-softer);
        color: var(--slide-accent-strong);
        font-size: 0.92rem;
        font-weight: 700;
        text-decoration: none;
      }
      .slide-free-gallery {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.7rem;
        align-items: start;
      }
      .slide-free-gallery-item {
        min-width: 0;
        padding: 0.35rem;
        border: 1px solid var(--slide-line);
        border-radius: 16px;
        background: var(--slide-surface-strong);
      }
      .slide-free-gallery-item .slide-media-image,
      .slide-free-gallery-item .slide-media-video,
      .slide-free-gallery-item .slide-media-print-card,
      .slide-free-gallery-item .slide-media-embed-wrap {
        margin: 0;
        max-height: 8.6rem;
        border-radius: 12px;
      }
      .slide-media-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: clamp(14.25rem, 34vh, 19.8rem);
        margin-top: 1rem;
        padding: 0.6rem;
        border: 1px solid var(--slide-line);
        border-radius: 22px;
        background: var(--slide-surface);
        overflow: hidden;
      }
      .slide-media-image,
      .slide-media-video {
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: clamp(13.2rem, 32vh, 18.7rem);
        border-radius: 16px;
        object-fit: contain;
        background: var(--slide-line);
      }
      .slide-media-slot .slide-media-image,
      .slide-free-gallery-item .slide-media-image {
        cursor: zoom-in;
        transition: transform 180ms ease, box-shadow 180ms ease;
      }
      .slide-media-slot .slide-media-image:hover,
      .slide-free-gallery-item .slide-media-image:hover {
        transform: scale(1.02);
        box-shadow: 0 12px 30px rgba(18,32,51,0.18);
      }
      .slide-media-video {
        width: 100%;
      }
      .slide-media-embed-wrap {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 16px;
        overflow: hidden;
        background: var(--slide-line);
      }
      .slide-media-embed {
        width: 100%;
        height: 100%;
        border: 0;
      }
      .slide-media-print-card {
        display: grid;
        gap: 0.6rem;
        width: 100%;
      }
      .slide-side-bullets-slot {
        align-items: stretch;
        justify-content: flex-start;
        min-height: 0;
        margin-top: 1.3rem;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        overflow: visible;
      }
      .slide-side-bullets {
        display: grid;
        gap: 0.7rem;
        width: 100%;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .slide-side-bullets li {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.65rem;
        align-items: start;
        font-size: 1.08rem;
        line-height: 1.54;
      }
      .slide-side-bullets li::before {
        content: "";
        width: 0.75rem;
        height: 0.75rem;
        margin-top: 0.35rem;
        border-radius: 50%;
        background: linear-gradient(145deg, var(--slide-accent), var(--slide-accent-strong));
        box-shadow: 0 0 0 5px var(--slide-accent-softer);
      }
      .slide-side-bullets .slide-sub-bullets li::before {
        width: 0.34rem;
        height: 0.34rem;
        margin-top: 0;
        left: -0.8rem;
        top: 0.48rem;
        box-shadow: none;
        background: var(--slide-accent-strong);
      }
      .slide-media-link {
        display: block;
        overflow-wrap: anywhere;
        font-size: 0.8rem;
        line-height: 1.35;
        text-decoration: underline;
      }
      .presentation-reveal-hidden {
        opacity: 0;
        transform: translateY(0.6rem);
        visibility: hidden;
      }
      .presentation-reveal-visible {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        transition: opacity 220ms ease, transform 220ms ease;
      }
      .deck-slide.is-transitioning {
        pointer-events: none;
      }
      .deck-slide.transition-fade-out {
        animation: deckFadeOut 220ms ease both;
      }
      .deck-slide.transition-fade-in {
        animation: deckFadeIn 260ms ease both;
      }
      .deck-slide.transition-slide-out.direction-next {
        animation: deckSlideOutNext 260ms ease both;
      }
      .deck-slide.transition-slide-in.direction-next {
        animation: deckSlideInNext 300ms ease both;
      }
      .deck-slide.transition-slide-out.direction-prev {
        animation: deckSlideOutPrev 260ms ease both;
      }
      .deck-slide.transition-slide-in.direction-prev {
        animation: deckSlideInPrev 300ms ease both;
      }
      .deck-slide.transition-zoom-out {
        animation: deckZoomOut 240ms ease both;
      }
      .deck-slide.transition-zoom-in {
        animation: deckZoomIn 300ms ease both;
      }
      .deck-slide.transition-rise-out {
        animation: deckRiseOut 220ms ease both;
      }
      .deck-slide.transition-rise-in {
        animation: deckRiseIn 280ms ease both;
      }
      @keyframes deckFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes deckFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes deckSlideOutNext {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-4rem); }
      }
      @keyframes deckSlideInNext {
        from { opacity: 0; transform: translateX(4rem); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes deckSlideOutPrev {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(4rem); }
      }
      @keyframes deckSlideInPrev {
        from { opacity: 0; transform: translateX(-4rem); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes deckZoomOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.94); }
      }
      @keyframes deckZoomIn {
        from { opacity: 0; transform: scale(1.06); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes deckRiseOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-2rem); }
      }
      @keyframes deckRiseIn {
        from { opacity: 0; transform: translateY(2rem); }
        to { opacity: 1; transform: translateY(0); }
      }
      .image-lightbox {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: rgba(8, 15, 28, 0.82);
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms ease;
      }
      .image-lightbox.is-open {
        opacity: 1;
        pointer-events: auto;
      }
      body.deck-is-fullscreen .image-lightbox {
        padding: 0.75rem;
      }
      .image-lightbox-frame {
        position: relative;
        max-width: min(98vw, 2160px);
        max-height: 96vh;
        transform: scale(0.94);
        transition: transform 220ms ease;
      }
      body.deck-is-fullscreen .image-lightbox-frame {
        max-width: 99vw;
        max-height: 99vh;
      }
      .image-lightbox.is-open .image-lightbox-frame {
        transform: scale(1);
      }
      .image-lightbox-image {
        display: block;
        max-width: 100%;
        max-height: 96vh;
        border-radius: 20px;
        box-shadow: 0 28px 70px rgba(0,0,0,0.35);
        background: #ffffff;
      }
      body.deck-is-fullscreen .image-lightbox-image {
        max-height: 99vh;
      }
      .image-lightbox-close {
        position: absolute;
        top: -0.9rem;
        right: -0.9rem;
        width: 2.6rem;
        height: 2.6rem;
        border: 0;
        border-radius: 999px;
        background: rgba(255,255,255,0.95);
        color: #122033;
        font: inherit;
        font-size: 1.35rem;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 12px 28px rgba(0,0,0,0.2);
      }
      .slide-footer {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        margin-top: auto;
        padding-top: 1rem;
      }
      .slide-note {
        max-width: 64ch;
        padding: 0.75rem 0.95rem;
        border-radius: 18px;
        background: var(--slide-surface);
        color: var(--slide-text-muted);
        font-size: 1.08rem;
        line-height: 1.58;
      }
      .slide-note a {
        color: var(--slide-accent-strong);
        text-decoration: underline;
        overflow-wrap: anywhere;
      }
      .slide-signature {
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(18,32,51,0.44);
      }
      @media print {
        @page { size: A4 landscape; margin: 0; }
        html, body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        body { background: #ffffff; }
        .deck-topbar { display: none; }
        .slide-screen {
          display: flex !important;
          width: 297mm;
          height: 210mm;
          min-height: auto;
          min-width: auto;
          page-break-after: always;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .deck-slide {
          width: 285mm;
          height: 160.3125mm;
          max-width: 285mm;
          max-height: 160.3125mm;
          border-radius: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body data-transition="${ns.utils.escapeHtml(state.settings.transition || "fade")}">
    <div class="deck-shell">
      <header class="deck-topbar">
        <div class="deck-meta">
          <strong>${ns.utils.escapeHtml(state.settings.title)}</strong>
          <span>${ns.utils.escapeHtml(state.settings.subtitle)}</span>
        </div>
        <div class="deck-nav">
          <button type="button" id="prev-slide">Précédent</button>
          <button type="button" id="next-slide">Suivant</button>
          <button type="button" id="fullscreen-deck">Plein écran</button>
          <button type="button" id="print-deck">Imprimer</button>
        </div>
      </header>
      <main>
        ${slidesMarkup}
        <div class="image-lightbox" id="image-lightbox" aria-hidden="true">
          <div class="image-lightbox-frame">
            <button class="image-lightbox-close" type="button" id="image-lightbox-close" aria-label="Fermer l’image">×</button>
            <img class="image-lightbox-image" id="image-lightbox-image" alt="" />
          </div>
        </div>
      </main>
    </div>
    <script>
      const screens = Array.from(document.querySelectorAll(".slide-screen"));
      const prevButton = document.querySelector("#prev-slide");
      const nextButton = document.querySelector("#next-slide");
      const fullscreenButton = document.querySelector("#fullscreen-deck");
      const printButton = document.querySelector("#print-deck");
      const main = document.querySelector("main");
      const lightbox = document.querySelector("#image-lightbox");
      const lightboxImage = document.querySelector("#image-lightbox-image");
      const lightboxClose = document.querySelector("#image-lightbox-close");
      let currentIndex = 0;
      let isTransitioning = false;

      function getTransitionName() {
        return document.body.getAttribute("data-transition") || "fade";
      }

      function getDirection(nextIndex) {
        if (screens.length <= 1) {
          return "next";
        }
        if ((currentIndex === screens.length - 1 && nextIndex === 0) || nextIndex > currentIndex) {
          return "next";
        }
        return "prev";
      }

      function clearTransitionClasses(slideNode) {
        if (!slideNode) {
          return;
        }
        slideNode.classList.remove(
          "is-transitioning",
          "transition-fade-out",
          "transition-fade-in",
          "transition-slide-out",
          "transition-slide-in",
          "transition-zoom-out",
          "transition-zoom-in",
          "transition-rise-out",
          "transition-rise-in",
          "direction-next",
          "direction-prev"
        );
      }

      function getActiveScreen() {
        return screens[currentIndex] || null;
      }

      function resetSlideReveals(screen) {
        if (!screen) {
          return;
        }
        const slide = screen.querySelector(".deck-slide");
        const revealItems = Array.from(screen.querySelectorAll("[data-reveal-step]"));
        if (!slide || slide.getAttribute("data-progressive-content") !== "true") {
          revealItems.forEach((item) => {
            item.classList.remove("presentation-reveal-hidden", "presentation-reveal-visible");
          });
          return;
        }
        revealItems.forEach((item) => {
          item.classList.add("presentation-reveal-hidden");
          item.classList.remove("presentation-reveal-visible");
        });
      }

      function revealNextItemInCurrentSlide() {
        const screen = getActiveScreen();
        if (!screen) {
          return false;
        }
        const slide = screen.querySelector(".deck-slide");
        if (!slide || slide.getAttribute("data-progressive-content") !== "true") {
          return false;
        }
        const nextHiddenItem = Array.from(screen.querySelectorAll("[data-reveal-step].presentation-reveal-hidden"))
          .sort((a, b) => Number(a.getAttribute("data-reveal-step")) - Number(b.getAttribute("data-reveal-step")))[0];
        if (!nextHiddenItem) {
          return false;
        }
        nextHiddenItem.classList.remove("presentation-reveal-hidden");
        nextHiddenItem.classList.add("presentation-reveal-visible");
        return true;
      }

      function updateFullscreenScale() {
        if (document.fullscreenElement !== main) {
          main.style.removeProperty("--deck-fullscreen-scale");
          return;
        }

        const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
        main.style.setProperty("--deck-fullscreen-scale", String(scale));
      }

      function showSlide(nextIndex) {
        if (isTransitioning || screens.length === 0) {
          return;
        }
        const normalizedIndex = (nextIndex + screens.length) % screens.length;
        const hasActiveScreen = screens.some((screen) => screen.classList.contains("is-active"));
        if (normalizedIndex === currentIndex && hasActiveScreen) {
          return;
        }
        const transitionName = getTransitionName();
        const outgoingScreen = getActiveScreen();
        const incomingScreen = screens[normalizedIndex];

        if (!outgoingScreen || transitionName === "none") {
          currentIndex = normalizedIndex;
          screens.forEach((screen, index) => {
            screen.classList.toggle("is-active", index === currentIndex);
          });
          resetSlideReveals(getActiveScreen());
          updateFullscreenScale();
          return;
        }

        const direction = getDirection(normalizedIndex);
        const outgoingSlide = outgoingScreen.querySelector(".deck-slide");
        const incomingSlide = incomingScreen.querySelector(".deck-slide");
        isTransitioning = true;

        clearTransitionClasses(outgoingSlide);
        clearTransitionClasses(incomingSlide);
        outgoingSlide.classList.add("is-transitioning", "transition-" + transitionName + "-out", "direction-" + direction);

        setTimeout(() => {
          outgoingScreen.classList.remove("is-active");
          clearTransitionClasses(outgoingSlide);
          currentIndex = normalizedIndex;
          incomingScreen.classList.add("is-active");
          resetSlideReveals(incomingScreen);
          clearTransitionClasses(incomingSlide);
          incomingSlide.classList.add("is-transitioning", "transition-" + transitionName + "-in", "direction-" + direction);
          updateFullscreenScale();

          setTimeout(() => {
            clearTransitionClasses(incomingSlide);
            isTransitioning = false;
          }, 320);
        }, 240);
      }

      function openImageLightbox(image) {
        const src = image.getAttribute("src");
        if (!src) {
          return;
        }
        lightboxImage.src = src;
        lightboxImage.alt = image.getAttribute("alt") || "";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      }

      function closeImageLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        setTimeout(() => {
          if (!lightbox.classList.contains("is-open")) {
            lightboxImage.removeAttribute("src");
            lightboxImage.alt = "";
          }
        }, 220);
      }

      prevButton.addEventListener("click", () => showSlide(currentIndex - 1));
      nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
      main.addEventListener("click", (event) => {
        if (isTransitioning) {
          return;
        }
        if (lightbox.classList.contains("is-open")) {
          return;
        }
        const slideImage = event.target.closest(".slide-media-image");
        if (slideImage && !event.target.closest(".slide-media-print-card")) {
          openImageLightbox(slideImage);
          return;
        }
        if (
          event.target.closest("a, button, video, iframe") ||
          event.target.closest(".slide-media-link")
        ) {
          return;
        }
        if (revealNextItemInCurrentSlide()) {
          return;
        }
        showSlide(currentIndex + 1);
      });
      lightbox.addEventListener("click", (event) => {
        event.stopPropagation();
        if (event.target === lightbox || event.target === lightboxClose || event.target === lightboxImage) {
          closeImageLightbox();
        }
      });
      fullscreenButton.addEventListener("click", async () => {
        if (!document.fullscreenElement) {
          try {
            await main.requestFullscreen();
          } catch (error) {
            return;
          }
          return;
        }

        try {
          await document.exitFullscreen();
        } catch (error) {
          return;
        }
      });
      document.addEventListener("fullscreenchange", () => {
        document.body.classList.toggle("deck-is-fullscreen", Boolean(document.fullscreenElement));
        fullscreenButton.textContent = document.fullscreenElement ? "Quitter le plein écran" : "Plein écran";
        updateFullscreenScale();
      });
      window.addEventListener("resize", updateFullscreenScale);
      printButton.addEventListener("click", () => window.print());
      document.addEventListener("keydown", (event) => {
        if (isTransitioning && event.key !== "Escape") {
          return;
        }
        if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
          closeImageLightbox();
          return;
        }
        if (event.key === "ArrowRight" || event.key === "PageDown") showSlide(currentIndex + 1);
        if (event.key === "ArrowLeft" || event.key === "PageUp") showSlide(currentIndex - 1);
        if (event.key === " " || event.code === "Space") {
          event.preventDefault();
          if (revealNextItemInCurrentSlide()) {
            return;
          }
          showSlide(currentIndex + 1);
        }
      });
      showSlide(${initialSlideIndex});
    </script>
  </body>
</html>`;
  }

  async function exportHtml(state, openOnly) {
    const fileName = `${ns.utils.slugify(state.settings.title || "presentation")}.html`;
    const logoSources = await resolveLogoSources();
    const html = await buildPresentationHtml(state, logoSources, {
      pdfMode: false,
      exportMode: openOnly ? "present" : "html",
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });

    if (openOnly) {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      return;
    }

    downloadBlob(blob, fileName);
  }

  async function exportPdf(state) {
    const logoSources = await resolveLogoSources();
    const html = await buildPresentationHtml(state, logoSources, { pdfMode: true });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    if (win) {
      const triggerPrint = () => {
        try {
          win.focus();
          win.print();
        } catch (error) {
          return;
        }
      };
      setTimeout(triggerPrint, 800);
    }
  }

  async function renderPresentationDocument(state) {
    const logoSources = await resolveLogoSources();
    const startSlideId = new URLSearchParams(window.location.search).get("start") || "";
    const html = await buildPresentationHtml(state, logoSources, {
      pdfMode: false,
      exportMode: "present",
      startSlideId,
    });
    document.open();
    document.write(html);
    document.close();
  }

  function hexToRgbComponents(hex) {
    const value = String(hex || "").replace("#", "");
    const normalized = value.length === 3
      ? value.split("").map((char) => char + char).join("")
      : value.padEnd(6, "0").slice(0, 6);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return [r, g, b]
      .map((item) => Math.max(0, Math.min(255, Math.round(item))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  function lightenHex(hex, amount) {
    const rgb = hexToRgbComponents(hex);
    return rgbToHex(
      rgb.r + (255 - rgb.r) * amount,
      rgb.g + (255 - rgb.g) * amount,
      rgb.b + (255 - rgb.b) * amount
    );
  }

  function getMediaItemById(items, id) {
    return (items || []).find((item) => item.id === id) || null;
  }

  function getDeckFontOption(settings) {
    const fonts = (ns.data && ns.data.fontOptions) || [];
    return fonts.find((item) => item.id === (settings && settings.font)) || fonts[0] || {
      pptBody: "Aptos",
      pptHeading: "Georgia",
    };
  }

  function buildVideoLink(mediaItem, mediaLinks) {
    if (!mediaItem) {
      return "";
    }
    return mediaLinks[mediaItem.id] || mediaItem.externalUrl || mediaItem.embedUrl || "";
  }

  async function waitForRenderAssets(root) {
    const images = Array.from(root.querySelectorAll("img"));
    const videos = Array.from(root.querySelectorAll("video"));

    await Promise.all(images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));

    await Promise.all(videos.map((video) => {
      if (video.readyState >= 2) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        video.addEventListener("loadeddata", resolve, { once: true });
        video.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  async function renderSlideToImage(slide, state, options) {
    if (!window.html2canvas) {
      throw new Error("html2canvas indisponible");
    }

    const opts = options || {};
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-20000px";
    host.style.top = "0";
    host.style.width = "1280px";
    host.style.height = "720px";
    host.style.padding = "0";
    host.style.margin = "0";
    host.style.zIndex = "-1";
    host.style.background = "transparent";
    document.body.appendChild(host);

    host.innerHTML = ns.ui.createSlideMarkup(slide, state.settings, {
      compact: false,
      logoSources: opts.logoSources,
      mediaItems: state.mediaLibrary || [],
      mediaUrls: opts.mediaUrls || {},
      mediaLinks: opts.mediaLinks || {},
      pdfMode: true,
    });

    const slideNode = host.firstElementChild;
    slideNode.style.width = "1280px";
    slideNode.style.height = "720px";
    slideNode.style.aspectRatio = "16 / 9";
    slideNode.style.boxShadow = "none";
    slideNode.style.borderRadius = "0";

    await waitForRenderAssets(host);

    const canvas = await window.html2canvas(slideNode, {
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      scale: 2,
      logging: false,
    });

    host.remove();
    return canvas.toDataURL("image/png");
  }

  async function exportPptx(state) {
    if (!window.PptxGenJS) {
      window.alert("La librairie PPTX n'est pas chargÃ©e. VÃ©rifie la connexion internet puis rÃ©essaie.");
      return;
    }

    if (!window.html2canvas) {
      window.alert("La librairie de rendu n'est pas chargÃ©e. VÃ©rifie la connexion internet puis rÃ©essaie.");
      return;
    }

    const pptx = new window.PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "Studio Ingenierie Formation";
    pptx.company = "Studio Ingenierie Formation";
    pptx.subject = state.settings.subtitle || state.settings.title || "Presentation";
    pptx.title = state.settings.title || "Presentation";
    pptx.lang = "fr-FR";
    const deckFont = getDeckFontOption(state.settings);
    pptx.theme = {
      headFontFace: deckFont.pptHeading || deckFont.pptBody || "Aptos",
      bodyFontFace: deckFont.pptBody || "Aptos",
      lang: "fr-FR",
    };

    const logoSources = await resolveLogoSources();
    const mediaAssets = await ns.services.media.resolvePdfMediaAssets(state.mediaLibrary || []);
    const mediaPreviewMap = mediaAssets.previewMap;
    const mediaLinkMap = mediaAssets.linkMap;
    const slideImageMap = {};

    for (const slide of state.slides) {
      slideImageMap[slide.id] = await renderSlideToImage(slide, state, {
        logoSources,
        mediaUrls: mediaPreviewMap,
        mediaLinks: mediaLinkMap,
      });
    }

    state.slides.forEach((slide) => {
      const pptSlide = pptx.addSlide();
      pptSlide.background = { color: "EEF5FD" };
      pptSlide.addImage({
        data: slideImageMap[slide.id],
        x: 0,
        y: 0,
        w: 13.333,
        h: 7.5,
      });

      const mediaItem = getMediaItemById(state.mediaLibrary, slide.mediaId);
      const linkHref = buildVideoLink(mediaItem, mediaLinkMap);
      if (mediaItem && (mediaItem.kind === "video" || mediaItem.kind === "embed") && linkHref) {
        pptSlide.addText(linkHref, {
          x: 9.02,
          y: 4.92,
          w: 3.78,
          h: 0.32,
          fontFace: deckFont.pptBody || "Aptos",
          fontSize: 8,
          color: "17478B",
          underline: { color: "17478B" },
          hyperlink: { url: linkHref },
          fit: "shrink",
          margin: 0,
        });
      }
    });

    const fileName = `${ns.utils.slugify(state.settings.title || "presentation")}.pptx`;
    await pptx.writeFile({ fileName });
  }

  ns.services.exporter = {
    exportJson,
    exportPdf,
    exportPptx,
    exportHtml,
    buildPresentationHtml,
    renderPresentationDocument,
  };
})();
