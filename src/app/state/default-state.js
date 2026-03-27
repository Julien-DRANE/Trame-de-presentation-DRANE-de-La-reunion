(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.stateFactory = ns.stateFactory || {};

  const principleDefaultsByBloom = {
    identify: ["signaling", "activation"],
    understand: ["segmentation", "worked-examples"],
    apply: ["worked-examples", "feedback"],
    analyze: ["signaling", "retrieval-practice"],
    evaluate: ["feedback", "retrieval-practice"],
    create: ["segmentation", "spacing"],
  };

  function createSlideFromBloom(level, index) {
    return {
      id: `slide-${index + 1}`,
      label: `Étape ${index + 1}`,
      number: String(index + 1).padStart(2, "0"),
      contentType: "bullets",
      bulletsNumbered: false,
      bulletsProgressive: false,
      paletteOverride: "",
      table: [
        ["", ""],
        ["", ""],
      ],
      freeBody: "",
      freeLinks: [],
      freeMediaIds: [],
      mediaId: "",
      bloomLevel: level.id,
      objective: `Amener le groupe à ${level.verbs[0]} et formaliser une preuve exploitable.`,
      evidence: "Trace à définir",
      principleIds: principleDefaultsByBloom[level.id] || [],
      title: level.defaultTitle,
      subtitle: level.defaultSubtitle,
      bullets: level.defaultBullets.slice(0, 3),
      note: level.defaultNote,
    };
  }

  function createBloomDeckSlides() {
    const bloomLevels = (ns.data && ns.data.bloomLevels) || [];
    return bloomLevels.map((level, index) => createSlideFromBloom(level, index));
  }

  function createBlankSlide(index, bloomLevelId) {
    const bloomLevels = (ns.data && ns.data.bloomLevels) || [];
    const fallbackLevel = bloomLevels.find((level) => level.id === bloomLevelId) || bloomLevels[0];

    return {
      id: `slide-${Date.now()}-${index}`,
      label: "Nouvelle slide",
      number: String(index).padStart(2, "0"),
      contentType: "bullets",
      bulletsNumbered: false,
      bulletsProgressive: false,
      paletteOverride: "",
      table: [
        ["", ""],
        ["", ""],
      ],
      freeBody: "",
      freeLinks: [],
      freeMediaIds: [],
      mediaId: "",
      bloomLevel: fallbackLevel ? fallbackLevel.id : "identify",
      objective: "Formuler l'objectif d'apprentissage visé par cette slide.",
      evidence: "Trace ou preuve attendue",
      principleIds: fallbackLevel ? (principleDefaultsByBloom[fallbackLevel.id] || []).slice(0, 2) : [],
      title: "Titre court à présenter",
      subtitle: "Gardez un message principal net, lisible et directement exploitable.",
      bullets: ["Premier point", "Deuxieme point", "Troisieme point"],
      note: "Une note breve suffit pour fermer la slide.",
    };
  }

  function createDefaultState() {
    const slides = createBloomDeckSlides();
    return {
      view: "engineering",
      uiNightMode: false,
      settings: {
        title: "Ingénierie de formation",
        subtitle: "Deck structuré selon Bloom et principes cognitifs.",
        footer: "Équipe projet",
        theme: "mix",
        palette: "ocean",
        font: "studio",
        transition: "fade",
      },
      mediaLibrary: [],
      selectedSlideId: slides[0] ? slides[0].id : null,
      slides,
    };
  }

  ns.stateFactory.createSlideFromBloom = createSlideFromBloom;
  ns.stateFactory.createBloomDeckSlides = createBloomDeckSlides;
  ns.stateFactory.createBlankSlide = createBlankSlide;
  ns.stateFactory.createDefaultState = createDefaultState;
})();
