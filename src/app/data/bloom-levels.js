(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.data = ns.data || {};

  ns.data.bloomLevels = [
    {
      id: "identify",
      number: "01",
      title: "Identifier, reconnaitre",
      summary: "Reconnaitre, lister, decrire, identifier",
      verbs: ["reconnaitre", "lister", "decrire", "identifier"],
      defaultTitle: "Identifier les besoins, le contexte et les prerequis.",
      defaultSubtitle: "Faire emerger les elements de base avant toute conception detaillee.",
      defaultBullets: [
        "Lister les attentes reelles du public",
        "Nommer les contraintes de depart",
        "Identifier les connaissances deja presentes",
      ],
      defaultNote: "Une bonne ingénierie commence par une lecture juste de la situation.",
    },
    {
      id: "understand",
      number: "02",
      title: "Comprendre",
      summary: "Interpreter, resumer, classer, expliquer",
      verbs: ["interpreter", "resumer", "classer", "expliquer"],
      defaultTitle: "Comprendre les enjeux et reformuler le besoin de formation.",
      defaultSubtitle: "Transformer les donnees recueillies en une intention pedagogique partagee.",
      defaultBullets: [
        "Expliquer le probleme a traiter",
        "Classer les enjeux prioritaires",
        "Resumer le cap dans une phrase claire",
      ],
      defaultNote: "La reformulation commune aligne les acteurs et limite les malentendus.",
    },
    {
      id: "apply",
      number: "03",
      title: "Appliquer",
      summary: "Executer, utiliser, mettre en oeuvre",
      verbs: ["executer", "utiliser", "mettre en oeuvre"],
      defaultTitle: "Appliquer le scenario retenu dans une situation d'usage cible.",
      defaultSubtitle: "Passer du cadre theorique a une mise en oeuvre visible et testable.",
      defaultBullets: [
        "Choisir un format d'activite concret",
        "Faire produire une premiere trace",
        "Mettre les participants en action rapidement",
      ],
      defaultNote: "Une competence se stabilise mieux lorsqu'elle est pratiquee.",
    },
    {
      id: "analyze",
      number: "04",
      title: "Analyser",
      summary: "Differencier, organiser, deconstruire, comparer",
      verbs: ["differencier", "organiser", "deconstruire", "comparer"],
      defaultTitle: "Analyser les écarts, les obstacles et les leviers de progression.",
      defaultSubtitle: "Decomposer la situation pour ajuster les contenus et les modalites.",
      defaultBullets: [
        "Comparer les pratiques observees et visees",
        "Deconstruire les points de blocage",
        "Organiser les priorites d'ajustement",
      ],
      defaultNote: "L'analyse evite de traiter tous les problemes au meme niveau.",
    },
    {
      id: "evaluate",
      number: "05",
      title: "Evaluer",
      summary: "Juger, critiquer, verifier, argumenter",
      verbs: ["juger", "critiquer", "verifier", "argumenter"],
      defaultTitle: "Evaluer la pertinence du dispositif et argumenter les choix.",
      defaultSubtitle: "Mesurer la valeur pedagogique a partir d'indices de transfert observables.",
      defaultBullets: [
        "Verifier la progression reelle",
        "Argumenter les arbitrages retenus",
        "Juger l'efficacite au regard des objectifs",
      ],
      defaultNote: "L'evaluation devient utile lorsqu'elle eclaire une decision.",
    },
    {
      id: "create",
      number: "06",
      title: "Creer",
      summary: "Produire une oeuvre originale, assembler, concevoir",
      verbs: ["produire", "assembler", "concevoir"],
      defaultTitle: "Creer un parcours original, coherent et directement mobilisable.",
      defaultSubtitle: "Assembler les briques en un dispositif complet, lisible et duplicable.",
      defaultBullets: [
        "Concevoir une progression complete",
        "Assembler formats, supports et traces",
        "Produire un livrable final reutilisable",
      ],
      defaultNote: "La creation finalise un systeme, pas seulement un support.",
    },
  ];
})();
