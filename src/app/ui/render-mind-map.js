(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.ui = ns.ui || {};
  const colors = ["#145da0", "#ef9b20", "#008f7a", "#8d4c9e", "#c85250"];

  function getThemes(state) {
    const themes = state && state.mindMap && Array.isArray(state.mindMap.themes) ? state.mindMap.themes : [];
    return themes.length ? themes : [{ id: "unassigned", code: "?", label: "Sans thème", color: "#6b7280" }];
  }

  function getSlideCode(slide, state) {
    const theme = getThemes(state).find((item) => item.id === slide.themeId) || getThemes(state)[0];
    const index = (state.slides || []).filter((item) => item.themeId === theme.id).findIndex((item) => item.id === slide.id);
    return `${theme.code || "?"}${index >= 0 ? index + 1 : ""}`;
  }

  function wrapLabel(value) {
    const words = String(value || "Slide").trim().slice(0, 66).split(/\s+/);
    const lines = [""];
    words.forEach((word) => {
      const line = lines[lines.length - 1];
      if (line && `${line} ${word}`.length > 18 && lines.length < 3) {
        lines.push(word);
      } else {
        lines[lines.length - 1] = `${line}${line ? " " : ""}${word}`;
      }
    });
    if (words.join(" ").length > 66) lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, 17)}…`;
    return lines.filter(Boolean);
  }

  function renderMindMap(state) {
    const groups = getThemes(state).map((theme, index) => ({ theme, color: theme.color || colors[index % colors.length], slides: (state.slides || []).filter((slide) => slide.themeId === theme.id) })).filter((group) => group.slides.length);
    if (!groups.length) return '<p class="mind-map-empty">Associez les slides à un thème pour construire la carte.</p>';
    const sector = (Math.PI * 2) / groups.length;
    const sectorPadding = Math.min(0.2, sector * 0.12);
    const usableSector = Math.max(0, sector - sectorPadding * 2);
    const getThemeBranchCount = (slideCount) => Math.max(1, Math.ceil(slideCount / 4));
    const longestBranchLength = Math.max(...groups.map((group) => Math.ceil(group.slides.length / getThemeBranchCount(group.slides.length))));
    const outerLeafDistance = 235 + Math.max(0, longestBranchLength - 1) * 145;
    const mapRadius = 275 + outerLeafDistance + 200;
    const width = Math.max(1400, mapRadius * 2); const height = Math.max(900, mapRadius * 2); const cx = width / 2; const cy = height / 2;
    const centerTitle = state.settings.title || "Présentation";
    const centerLabel = wrapLabel(centerTitle);
    const centerFontSize = centerTitle.length <= 25 ? 20 : centerTitle.length <= 42 ? 17 : 15;
    const centerLabelStart = cy + (centerLabel.length === 1 ? -5 : centerLabel.length === 2 ? -15 : -24);
    const branches = groups.map((group, groupIndex) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * groupIndex / groups.length); const x = cx + Math.cos(angle) * 275; const y = cy + Math.sin(angle) * 275;
      const branchCount = getThemeBranchCount(group.slides.length);
      const baseBranchSize = Math.floor(group.slides.length / branchCount);
      const branchesWithOneExtraSlide = group.slides.length % branchCount;
      const branchSizes = Array.from({ length: branchCount }, (_, index) => baseBranchSize + (index < branchesWithOneExtraSlide ? 1 : 0));
      let branchIndex = 0;
      let indexInBranch = 0;
      const leaves = group.slides.map((slide, index) => {
        const currentBranchIndex = branchIndex; const currentIndexInBranch = indexInBranch;
        const leafAngle = angle + (branchCount === 1 ? 0 : -usableSector / 2 + (usableSector * currentBranchIndex / (branchCount - 1)));
        const distance = 235 + currentIndexInBranch * 145; const lx = x + Math.cos(leafAngle) * distance; const ly = y + Math.sin(leafAngle) * distance; const code = getSlideCode(slide, state); const label = wrapLabel(slide.title || slide.label); const sourceLength = String(slide.title || slide.label || "").length; const fontSize = sourceLength <= 25 ? 18 : sourceLength <= 42 ? 16 : 14; const labelStart = ly + (label.length === 1 ? 12 : label.length === 2 ? 2 : -8);
        indexInBranch += 1;
        if (indexInBranch >= branchSizes[branchIndex]) { branchIndex += 1; indexInBranch = 0; }
        return { lx, ly, code, label, fontSize, labelStart, slide, branchIndex: currentBranchIndex, indexInBranch: currentIndexInBranch };
      });
      const leafLines = leaves.map((leaf, index) => {
        const previous = leaf.indexInBranch === 0 ? { lx: x, ly: y } : leaves[index - 1];
        return `<line x1="${previous.lx}" y1="${previous.ly}" x2="${leaf.lx}" y2="${leaf.ly}" stroke="${group.color}" stroke-opacity=".55" stroke-width="3"/>`;
      }).join("");
      const leafNodes = leaves.map((leaf) => `<g class="mind-map-slide${leaf.slide.id === state.selectedSlideId ? " is-active" : ""}" data-mindmap-slide="${ns.utils.escapeHtml(leaf.slide.id)}" tabindex="0" role="button" aria-label="Ouvrir ${ns.utils.escapeHtml(leaf.code)} : ${ns.utils.escapeHtml(leaf.slide.title || leaf.slide.label)}"><rect x="${leaf.lx - 95}" y="${leaf.ly - 46}" width="190" height="92" rx="46" fill="#fff" stroke="${group.color}" stroke-width="4"/><text x="${leaf.lx}" y="${leaf.ly - 24}" text-anchor="middle" class="mind-map-code">${ns.utils.escapeHtml(leaf.code)}</text><text x="${leaf.lx}" y="${leaf.labelStart}" text-anchor="middle" class="mind-map-slide-label" style="font-size:${leaf.fontSize}px;">${leaf.label.map((line, lineIndex) => `<tspan x="${leaf.lx}" dy="${lineIndex ? 15 : 0}">${ns.utils.escapeHtml(line)}</tspan>`).join("")}</text></g>`).join("");
      return `<g><line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${group.color}" stroke-width="7" stroke-linecap="round" stroke-opacity=".7"/>${leafLines}<circle cx="${x}" cy="${y}" r="65" fill="${group.color}"/><text x="${x}" y="${y - 4}" text-anchor="middle" class="mind-map-theme-code">${ns.utils.escapeHtml(group.theme.code)}</text><text x="${x}" y="${y + 19}" text-anchor="middle" class="mind-map-theme-name">${ns.utils.escapeHtml((group.theme.label || "Thème").slice(0, 18))}</text>${leafNodes}</g>`;
    }).join("");
    const centerPetal = `<rect class="mind-map-center-petal" x="${cx - 135}" y="${cy - 62}" width="270" height="124" rx="62" fill="#122033" stroke="#2c73da" stroke-width="6"/><text x="${cx}" y="${centerLabelStart}" text-anchor="middle" class="mind-map-center" style="font-size:${centerFontSize}px;">${centerLabel.map((line, index) => `<tspan x="${cx}" dy="${index ? 18 : 0}">${ns.utils.escapeHtml(line)}</tspan>`).join("")}</text><text x="${cx}" y="${cy + 40}" text-anchor="middle" class="mind-map-center-sub">${state.slides.length} slides</text>`;
    return `<div class="mind-map-canvas"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Carte mentale de la présentation">${branches}${centerPetal}</svg></div>`;
  }
  ns.ui.renderMindMap = renderMindMap;
  ns.ui.getSlideCode = getSlideCode;
})();
