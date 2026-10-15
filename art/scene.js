// Every scene is drawn on a 320x200 stage. Zoom the page so the stage fills
// whatever frame embeds it: a project card or a 64x40 thumbnail.
const fit = () => {
  document.documentElement.style.zoom = Math.min(innerWidth / 320, innerHeight / 200);
};
fit();
addEventListener("resize", fit);

// Scenes are timed in their own seconds and played back slower, at the
// scene's <meta name="rate"> (0.8 unless it says otherwise).
addEventListener("load", () => {
  const rate = Number(document.querySelector('meta[name="rate"]')?.content ?? 0.8);
  for (const a of document.getAnimations()) a.playbackRate = rate;
});
