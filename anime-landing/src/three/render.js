export function startRenderLoop({ renderer, scene, camera, onTick }) {
  let last = performance.now();

  function tick(now) {
    const dt = now - last;
    last = now;

    if (onTick) onTick({ now, dt });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
