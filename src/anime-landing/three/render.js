export function startRenderLoop({ renderer, scene, camera, composer, onTick }) {
  let last = performance.now();

  function tick(now) {
    const dt = now - last;
    last = now;

    if (onTick) onTick({ now, dt });

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
