// Every scene is drawn on a 320x200 stage. Zoom the page so the stage covers
// whatever frame embeds it, the way the card's still does with object-fit:
// cover (scene.css centers the stage), so the two line up to the pixel.
const fit = () => {
  document.documentElement.style.zoom = Math.max(innerWidth / 320, innerHeight / 200);
};
fit();
addEventListener("resize", fit);

// A scene is one short animation that starts on its card's still. The card
// plays it forward while the pointer is over it and back when the pointer
// leaves, so a quick pass turns around wherever it got to. The page asks
// with postMessage ("play" or "rewind"), and the scene says "ready" once its
// fonts are in and it holds its first frame. Looping animations (a live
// dot) stay paused: they would never come back to rest.
const REWIND = 1.5; // the way back is quicker than the way in

const finite = () =>
  document.getAnimations().filter((a) => a.effect.getComputedTiming().iterations !== Infinity);

let dir = -1;
const go = (d) => {
  if (d === dir) return;
  dir = d;
  for (const a of finite()) {
    const t = a.currentTime;
    a.playbackRate = d > 0 ? 1 : -REWIND;
    // Already at that end: play() would jump to the other one and replay.
    if (d > 0 ? t >= a.effect.getComputedTiming().endTime : t <= 0) continue;
    a.play();
  }
  dispatchEvent(new Event("scene:move"));
};

addEventListener("message", (e) => {
  if (e.source === parent && (e.data === "play" || e.data === "rewind")) go(e.data === "play" ? 1 : -1);
});

addEventListener("load", async () => {
  await document.fonts.ready;
  for (const a of document.getAnimations()) {
    a.pause();
    a.currentTime = 0;
  }
  dispatchEvent(new Event("scene:move"));
  // Two frames, so whatever the scene draws for its first frame is on screen.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      window.sceneReady = true;
      if (parent !== window) parent.postMessage("ready", "*");
    }),
  );
});
