(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.services = ns.services || {};

  const themeOptions = ["mix", "circles", "waves", "clean"];
  const viewOptions = ["engineering", "presentation"];

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

    return {
      view: viewOptions.includes(input.view) ? input.view : fallbackState.view,
      settings: {
        title: utils.clampText(input.settings && input.settings.title, 60) || fallbackState.settings.title,
        subtitle: utils.clampText(input.settings && input.settings.subtitle, 90) || fallbackState.settings.subtitle,
        footer: utils.clampText(input.settings && input.settings.footer, 50) || fallbackState.settings.footer,
        theme: themeOptions.includes(input.settings && input.settings.theme) ? input.settings.theme : fallbackState.settings.theme,
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
    const bullets = Array.isArray(slide.bullets) ? slide.bullets.slice(0, 3) : [];
    while (bullets.length < 3) {
      bullets.push("");
    }

    const principleIds = utils.uniqueStrings(slide.principleIds || []).filter((id) => allowedPrincipleIds.includes(id));

    return {
      id: typeof slide.id === "string" && slide.id ? slide.id : utils.createId("slide"),
      label: utils.clampText(slide.label, 24) || `Slide ${index + 1}`,
      number: utils.clampText(slide.number, 8) || String(index + 1).padStart(2, "0"),
      mediaId: utils.clampText(slide.mediaId, 80),
      bloomLevel: allowedBloomIds.includes(slide.bloomLevel) ? slide.bloomLevel : allowedBloomIds[0],
      objective: utils.clampText(slide.objective, 180),
      evidence: utils.clampText(slide.evidence, 120),
      principleIds,
      title: utils.clampText(slide.title, 72),
      subtitle: utils.clampText(slide.subtitle, 170),
      bullets: bullets.map((item) => utils.clampText(item, 90)),
      note: utils.clampText(slide.note, 110),
    };
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
