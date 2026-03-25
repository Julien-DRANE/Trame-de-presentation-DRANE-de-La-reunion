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
    exportPdf: document.querySelector("#export-pdf"),
    exportPptx: document.querySelector("#export-pptx"),
    exportHtml: document.querySelector("#export-html"),
    exportJson: document.querySelector("#export-json"),
    importJson: document.querySelector("#import-json"),
    importJsonInput: document.querySelector("#import-json-input"),
    deckTitle: document.querySelector("#deck-title"),
    deckSubtitle: document.querySelector("#deck-subtitle"),
    deckFooter: document.querySelector("#deck-footer"),
    deckTheme: document.querySelector("#deck-theme"),
    taxonomyCount: document.querySelector("#taxonomy-count"),
    taxonomyRoadmap: document.querySelector("#taxonomy-roadmap"),
    slideCount: document.querySelector("#slide-count"),
    slideList: document.querySelector("#slide-list"),
    principlesList: document.querySelector("#principles-list"),
    stage: document.querySelector("#stage"),
    slideHint: document.querySelector("#slide-hint"),
    densityBadge: document.querySelector("#density-badge"),
    thumbStrip: document.querySelector("#thumb-strip"),
    pedagogyBrief: document.querySelector("#pedagogy-brief"),
    mediaUpload: document.querySelector("#media-upload"),
    mediaUploadTrigger: document.querySelector("#media-upload-trigger"),
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
    slideBullet1: document.querySelector("#slide-bullet-1"),
    slideBullet2: document.querySelector("#slide-bullet-2"),
    slideBullet3: document.querySelector("#slide-bullet-3"),
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
  let isAddSlideMenuOpen = false;
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

  function setView(view) {
    if (view !== "engineering" && view !== "presentation") {
      return;
    }
    closeAddSlideMenu();
    state.view = view;
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

  function assignMediaToSelectedSlide(mediaId) {
    updateSelectedSlide({ mediaId: mediaId || "" });
  }

  function updateSelectedBullet(index, value) {
    state.slides = state.slides.map((slide) => {
      if (slide.id !== state.selectedSlideId) {
        return slide;
      }
      const bullets = slide.bullets.slice(0, 3);
      while (bullets.length < 3) {
        bullets.push("");
      }
      bullets[index] = value;
      return Object.assign({}, slide, { bullets });
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

  function selectSlide(id) {
    closeAddSlideMenu();
    if (!state.slides.some((slide) => slide.id === id)) {
      return;
    }
    state.selectedSlideId = id;
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
  refs.deckTheme.addEventListener("change", (event) => updateSettings("theme", event.target.value, 12));

  refs.slideBloomLevel.addEventListener("change", (event) => updateSelectedSlide({ bloomLevel: event.target.value }));
  refs.slideLabel.addEventListener("input", (event) => updateSelectedSlide({ label: ns.utils.clampText(event.target.value, 24) }));
  refs.slideNumber.addEventListener("input", (event) => updateSelectedSlide({ number: ns.utils.clampText(event.target.value, 8) }));
  refs.slideObjective.addEventListener("input", (event) => updateSelectedSlide({ objective: ns.utils.clampText(event.target.value, 180) }));
  refs.slideEvidence.addEventListener("input", (event) => updateSelectedSlide({ evidence: ns.utils.clampText(event.target.value, 120) }));
  refs.slideTitle.addEventListener("input", (event) => updateSelectedSlide({ title: ns.utils.clampText(event.target.value, 72) }));
  refs.slideSubtitle.addEventListener("input", (event) => updateSelectedSlide({ subtitle: ns.utils.clampText(event.target.value, 170) }));
  refs.slideBullet1.addEventListener("input", (event) => updateSelectedBullet(0, ns.utils.clampText(event.target.value, 90)));
  refs.slideBullet2.addEventListener("input", (event) => updateSelectedBullet(1, ns.utils.clampText(event.target.value, 90)));
  refs.slideBullet3.addEventListener("input", (event) => updateSelectedBullet(2, ns.utils.clampText(event.target.value, 90)));
  refs.slideNote.addEventListener("input", (event) => updateSelectedSlide({ note: ns.utils.clampText(event.target.value, 110) }));
  refs.mediaUploadTrigger.addEventListener("click", () => refs.mediaUpload.click());
  refs.importJson.addEventListener("click", () => refs.importJsonInput.click());
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
      refs.mediaLinkFeedback.textContent = "Utilise un lien http/https, un data URL image/vidéo, ou un lien YouTube.";
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
  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.getAttribute("data-switch-view")));
  });

  document.addEventListener("click", (event) => {
    const slideTrigger = event.target.closest("[data-select-slide]");
    const moveTrigger = event.target.closest("[data-move-slide]");
    const deleteTrigger = event.target.closest("[data-delete-slide]");
    const mediaAssignTrigger = event.target.closest("[data-assign-media]");
    const mediaDeleteTrigger = event.target.closest("[data-delete-media]");
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

    if (deleteTrigger) {
      event.stopPropagation();
      deleteSlideById(deleteTrigger.getAttribute("data-delete-slide"));
      return;
    }

    if (slideTrigger) {
      selectSlide(slideTrigger.getAttribute("data-select-slide"));
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

  document.addEventListener("keydown", (event) => {
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
