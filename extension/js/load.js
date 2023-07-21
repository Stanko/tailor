async function load() {
  const Tailor = await import("../tailor/index.js");
  window.__tailor = new Tailor.default();
}

load();
