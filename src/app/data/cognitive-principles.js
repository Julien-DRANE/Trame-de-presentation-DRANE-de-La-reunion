(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.data = ns.data || {};

  ns.data.cognitivePrinciples = [
    {
      id: "signaling",
      title: "Signalement",
      summary: "Mettre en evidence ce qui doit etre lu, retenu ou compare.",
      detail: "Utiliser une hiérarchie visuelle stable, des marqueurs clairs et peu de concurrents sur l'écran.",
    },
    {
      id: "segmentation",
      title: "Segmentation",
      summary: "Decouper l'information en blocs courts et exploitables.",
      detail: "Une slide = une idée directrice, puis trois points maximum pour maintenir la charge cognitive sous contrôle.",
    },
    {
      id: "activation",
      title: "Activation des acquis",
      summary: "Partir de ce que le public sait deja ou croit savoir.",
      detail: "Questions d'entree, pretests, reformulation ou recueil de representations initiales.",
    },
    {
      id: "worked-examples",
      title: "Exemples resolus",
      summary: "Montrer un exemple abouti avant de demander une production autonome.",
      detail: "Utile lorsque la tache est nouvelle ou complexe et que les erreurs de depart coutent cher.",
    },
    {
      id: "retrieval-practice",
      title: "Recuperation active",
      summary: "Faire rappeler sans support plutot que relire passivement.",
      detail: "Quiz courts, reformulations, rappels oraux ou traces memorielles produites par les apprenants.",
    },
    {
      id: "spacing",
      title: "Espacement",
      summary: "Revenir plusieurs fois sur une notion au lieu de tout masser.",
      detail: "Des retours courts a distance soutiennent mieux la retention qu'une exposition unique plus longue.",
    },
    {
      id: "feedback",
      title: "Feedback rapide",
      summary: "Donner un retour exploitable pendant que l'action est encore recente.",
      detail: "Le feedback doit aider a corriger, clarifier ou prioriser sans noyer le participant.",
    },
  ];
})();
