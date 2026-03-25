(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.ui = ns.ui || {};

  function renderDashboard(payload) {
    const state = payload.state;
    const refs = payload.refs;
    const selectedSlide = state.slides.find((slide) => slide.id === state.selectedSlideId) || state.slides[0];
    const bloomLevels = ns.data.bloomLevels || [];
    const principles = ns.data.cognitivePrinciples || [];
    const density = ns.ui.computeDensity(selectedSlide);

    refs.deckTitle.value = state.settings.title;
    refs.deckSubtitle.value = state.settings.subtitle;
    refs.deckFooter.value = state.settings.footer;
    refs.deckTheme.value = state.settings.theme;
    refs.slideCount.textContent = `${state.slides.length} slides`;
    refs.taxonomyCount.textContent = `${bloomLevels.length} niveaux`;
    refs.appShell.setAttribute("data-view", state.view || "engineering");

    refs.tabs.forEach((tab) => {
      const isActive = tab.getAttribute("data-switch-view") === (state.view || "engineering");
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    refs.addSlide.setAttribute("aria-expanded", "false");
    refs.addSlideMenu.classList.remove("is-open");
    refs.addSlideMenu.hidden = true;

    refs.addSlideMenu.innerHTML = bloomLevels
      .map((level) => {
        return `
          <button
            class="add-slide-option"
            type="button"
            data-add-slide-bloom="${ns.utils.escapeHtml(level.id)}"
          >
            <span class="add-slide-option-number">${ns.utils.escapeHtml(level.number)}</span>
            <span class="add-slide-option-label">${ns.utils.escapeHtml(level.title)}</span>
          </button>
        `;
      })
      .join("");

    refs.slideBloomLevel.innerHTML = bloomLevels
      .map((level) => {
        const selected = level.id === selectedSlide.bloomLevel ? " selected" : "";
        return `<option value="${ns.utils.escapeHtml(level.id)}"${selected}>${ns.utils.escapeHtml(level.number)} - ${ns.utils.escapeHtml(level.title)}</option>`;
      })
      .join("");

    refs.slideLabel.value = selectedSlide.label;
    refs.slideNumber.value = selectedSlide.number;
    refs.slideObjective.value = selectedSlide.objective;
    refs.slideEvidence.value = selectedSlide.evidence;
    refs.slideTitle.value = selectedSlide.title;
    refs.slideSubtitle.value = selectedSlide.subtitle;
    refs.slideBullet1.value = selectedSlide.bullets[0] || "";
    refs.slideBullet2.value = selectedSlide.bullets[1] || "";
    refs.slideBullet3.value = selectedSlide.bullets[2] || "";
    refs.slideNote.value = selectedSlide.note;

    refs.titleMeta.textContent = `${selectedSlide.title.length}/72 caracteres`;
    refs.subtitleMeta.textContent = `${selectedSlide.subtitle.length}/170 caracteres`;
    refs.noteMeta.textContent = `${selectedSlide.note.length}/110 caracteres`;
    refs.objectiveMeta.textContent = `${selectedSlide.objective.length}/180 caracteres`;
    refs.evidenceMeta.textContent = `${selectedSlide.evidence.length}/120 caracteres`;

    refs.densityBadge.className = density.className;
    refs.densityBadge.textContent = density.label;
    refs.slideHint.textContent = "Modèle répétitif : un niveau Bloom, une idée forte, trois points maximum.";
    refs.slideMediaSelection.textContent = selectedSlide.mediaId
      ? getMediaSelectionText(selectedSlide, state.mediaLibrary)
      : "Aucun média affecté à cette slide.";

    refs.slideList.innerHTML = renderSlideList(state, selectedSlide.id);
    refs.taxonomyRoadmap.innerHTML = renderTaxonomyRoadmap(state, selectedSlide.bloomLevel);
    refs.principlesList.innerHTML = renderPrinciplesList(selectedSlide, principles);
    refs.stage.innerHTML = ns.ui.createSlideMarkup(selectedSlide, state.settings, {
      compact: false,
      mediaItems: state.mediaLibrary,
      mediaUrls: ns.services.media.getUrlMap(),
    });
    refs.pedagogyBrief.innerHTML = renderPedagogyBrief(selectedSlide, principles);
    refs.mediaLibrary.innerHTML = renderMediaLibrary(state.mediaLibrary, selectedSlide.mediaId);
    refs.thumbStrip.innerHTML = renderThumbStrip(state, selectedSlide.id);
  }

  function getMediaSelectionText(selectedSlide, mediaItems) {
    const mediaItem = (mediaItems || []).find((item) => item.id === selectedSlide.mediaId);
    if (!mediaItem) {
      return "Aucun média affecté à cette slide.";
    }

    const kindLabel = mediaItem.kind === "embed" ? "Embed" : mediaItem.kind === "video" ? "Vidéo" : "Image";
    return `${kindLabel} sélectionnée : ${mediaItem.name}`;
  }

  function renderSlideList(state, activeId) {
    return state.slides
      .map((slide, index) => {
        const activeClass = slide.id === activeId ? " is-active" : "";
        const bloomMeta = ns.ui.getBloomMeta(slide.bloomLevel);
        return `
          <article class="slide-item${activeClass}" data-list-slide="${ns.utils.escapeHtml(slide.id)}">
            <button class="slide-select" type="button" data-select-slide="${ns.utils.escapeHtml(slide.id)}">
              <span class="slide-order" data-list-drag-handle="true" draggable="true" title="Glisser pour réordonner">
                ${String(index + 1).padStart(2, "0")}
              </span>
              <span class="slide-meta">
                <span class="slide-title">${ns.utils.escapeHtml(slide.title || "Slide sans titre")}</span>
                <span class="slide-subline">${ns.utils.escapeHtml(bloomMeta.title)} - ${ns.utils.escapeHtml(slide.subtitle || "À compléter")}</span>
              </span>
            </button>
            <div class="slide-actions">
              <button class="icon-button" type="button" data-move-slide="${ns.utils.escapeHtml(slide.id)}" data-direction="-1" aria-label="Monter">
                ^
              </button>
              <button class="icon-button" type="button" data-move-slide="${ns.utils.escapeHtml(slide.id)}" data-direction="1" aria-label="Descendre">
                v
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderTaxonomyRoadmap(state, activeBloomLevel) {
    const bloomLevels = ns.data.bloomLevels || [];
    return bloomLevels
      .map((level) => {
        const count = state.slides.filter((slide) => slide.bloomLevel === level.id).length;
        const activeClass = level.id === activeBloomLevel ? " is-active" : "";
        const verbMarkup = level.verbs
          .map((verb) => `<span class="verb-chip">${ns.utils.escapeHtml(verb)}</span>`)
          .join("");

        return `
          <article class="taxonomy-card${activeClass}" data-set-bloom="${ns.utils.escapeHtml(level.id)}">
            <div class="taxonomy-topline">
              <span class="taxonomy-step">${ns.utils.escapeHtml(level.number)}</span>
              <span class="count-pill">${count} slide${count > 1 ? "s" : ""}</span>
            </div>
            <h3 class="taxonomy-title">${ns.utils.escapeHtml(level.title)}</h3>
            <p class="taxonomy-summary">${ns.utils.escapeHtml(level.summary)}</p>
            <div class="taxonomy-verbs">${verbMarkup}</div>
          </article>
        `;
      })
      .join("");
  }

  function renderPrinciplesList(selectedSlide, principles) {
    return principles
      .map((principle) => {
        const checked = selectedSlide.principleIds.includes(principle.id) ? " checked" : "";
        return `
          <label class="principle-card">
            <input type="checkbox" data-toggle-principle="${ns.utils.escapeHtml(principle.id)}"${checked} />
            <span>
              <span class="principle-title">${ns.utils.escapeHtml(principle.title)}</span>
              <span class="principle-summary">${ns.utils.escapeHtml(principle.summary)}</span>
              <span class="principle-detail">${ns.utils.escapeHtml(principle.detail)}</span>
            </span>
          </label>
        `;
      })
      .join("");
  }

  function renderPedagogyBrief(selectedSlide, principles) {
    const bloomMeta = ns.ui.getBloomMeta(selectedSlide.bloomLevel);
    const activePrinciples = principles.filter((principle) => selectedSlide.principleIds.includes(principle.id));
    const principleMarkup = activePrinciples.length
      ? activePrinciples
          .map((principle) => `<span class="principle-chip">${ns.utils.escapeHtml(principle.title)}</span>`)
          .join("")
      : '<span class="principle-chip">Aucun principe actif</span>';

    return `
      <div class="pedagogy-heading">
        <span class="slide-meta-chip">${ns.utils.escapeHtml(bloomMeta.title)}</span>
        ${principleMarkup}
      </div>
      <div class="pedagogy-grid">
        <div class="pedagogy-box">
          <h4>Objectif</h4>
          <p class="pedagogy-line">${ns.utils.escapeHtml(selectedSlide.objective || "À compléter")}</p>
        </div>
        <div class="pedagogy-box">
          <h4>Trace attendue</h4>
          <p class="pedagogy-line">${ns.utils.escapeHtml(selectedSlide.evidence || "À compléter")}</p>
        </div>
      </div>
    `;
  }

  function renderThumbStrip(state, activeId) {
    return state.slides
      .map((slide, index) => {
        const activeClass = slide.id === activeId ? " is-active" : "";
        return `
          <article
            class="thumb-card${activeClass}"
            data-select-slide="${ns.utils.escapeHtml(slide.id)}"
            data-thumb-slide="${ns.utils.escapeHtml(slide.id)}"
            data-thumb-index="${index}"
            draggable="true"
          >
            <div class="thumb-card-actions">
              <button
                class="icon-button icon-button-danger"
                type="button"
                data-delete-slide="${ns.utils.escapeHtml(slide.id)}"
                aria-label="Supprimer la slide ${ns.utils.escapeHtml(slide.number || String(index + 1).padStart(2, "0"))}"
              >
                x
              </button>
            </div>
            ${ns.ui.createSlideMarkup(slide, state.settings, {
              compact: true,
              mediaItems: state.mediaLibrary,
              mediaUrls: ns.services.media.getUrlMap(),
            })}
            <p class="thumb-caption">${ns.utils.escapeHtml(slide.number)} - ${ns.utils.escapeHtml(slide.label)}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderMediaLibrary(mediaItems, selectedMediaId) {
    if (!mediaItems || mediaItems.length === 0) {
      return '<p class="media-empty">Importez une image ou une vidéo pour commencer.</p>';
    }

    const mediaUrls = ns.services.media.getUrlMap();

    return mediaItems
      .map((item) => {
        const activeClass = item.id === selectedMediaId ? " is-active" : "";
        const preview = item.kind === "video"
          ? `<video class="media-thumb-preview" src="${ns.utils.escapeHtml(mediaUrls[item.id] || "")}" muted preload="metadata"></video>`
          : `<img class="media-thumb-preview" src="${ns.utils.escapeHtml(mediaUrls[item.id] || "")}" alt="${ns.utils.escapeHtml(item.name)}" />`;
        const typeLabel = item.kind === "embed" ? "Embed YouTube" : item.kind === "video" ? "Vidéo" : "Image";

        return `
          <article class="media-card${activeClass}">
            <button class="media-card-select" type="button" data-assign-media="${ns.utils.escapeHtml(item.id)}">
              <span class="media-thumb">${preview}</span>
              <span class="media-meta">
                <span class="media-title">${ns.utils.escapeHtml(item.name)}</span>
                <span class="media-subline">${ns.utils.escapeHtml(typeLabel)}</span>
              </span>
            </button>
            <button
              class="icon-button icon-button-danger"
              type="button"
              data-delete-media="${ns.utils.escapeHtml(item.id)}"
              aria-label="Supprimer le media ${ns.utils.escapeHtml(item.name)}"
            >
              x
            </button>
          </article>
        `;
      })
      .join("");
  }

  ns.ui.renderDashboard = renderDashboard;
})();
