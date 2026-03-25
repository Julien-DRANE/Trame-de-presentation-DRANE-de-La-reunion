(function () {
  const ns = (window.StudioSlides = window.StudioSlides || {});
  ns.utils = ns.utils || {};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clampText(value, limit) {
    return typeof value === "string" ? value.slice(0, limit) : "";
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "presentation";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function createId(prefix) {
    return `${prefix || "item"}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function uniqueStrings(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  ns.utils.clone = clone;
  ns.utils.clampText = clampText;
  ns.utils.slugify = slugify;
  ns.utils.escapeHtml = escapeHtml;
  ns.utils.createId = createId;
  ns.utils.uniqueStrings = uniqueStrings;
})();
