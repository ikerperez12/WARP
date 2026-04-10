let liveRegion = null;
let liveTimer = 0;

export const initLiveRegion = () => {
  liveRegion = document.getElementById('app-live-region');
};

export const announce = (message) => {
  if (!liveRegion || !message) {
    // If liveRegion hasn't been initialized yet, try to find it
    liveRegion = document.getElementById('app-live-region');
    if (!liveRegion) return;
  }

  clearTimeout(liveTimer);
  liveRegion.textContent = '';
  liveTimer = window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 40);
};
