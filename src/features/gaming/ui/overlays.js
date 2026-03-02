const OVERLAY_IDS = ['game-loading-overlay', 'game-start-overlay', 'game-pause-overlay', 'game-over-overlay', 'game-victory-overlay', 'game-fallback-overlay'];

export class OverlayController {
  constructor() {
    this.overlays = Object.fromEntries(OVERLAY_IDS.map((id) => [id, document.getElementById(id)]));
    this.toast = document.getElementById('game-mission-toast');
    this.toastTitle = document.getElementById('toast-title');
    this.toastBody = document.getElementById('toast-body');
  }

  show(id) {
    const node = this.overlays[id];
    if (!node) return;
    node.classList.remove('is-hidden', 'is-inactive');
    node.classList.add('is-active');
    node.setAttribute('aria-hidden', 'false');
  }

  hide(id) {
    const node = this.overlays[id];
    if (!node) return;
    node.classList.add('is-hidden');
    node.classList.remove('is-active');
    node.setAttribute('aria-hidden', 'true');
  }

  hideAll() {
    Object.keys(this.overlays).forEach((id) => this.hide(id));
  }

  showToast(title, body) {
    if (!this.toast) return;
    if (this.toastTitle) this.toastTitle.textContent = title;
    if (this.toastBody) this.toastBody.textContent = body;
    this.toast.classList.remove('is-hidden');
    this.toast.setAttribute('aria-hidden', 'false');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast?.classList.add('is-hidden');
      this.toast?.setAttribute('aria-hidden', 'true');
    }, 2600);
  }
}
