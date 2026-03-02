export class PanelController {
  constructor() {
    this.qualityButtons = Array.from(document.querySelectorAll('.quality-btn'));
  }

  bindQuality(onSelect) {
    this.qualityButtons.forEach((button) => {
      button.addEventListener('click', () => onSelect(button.dataset.quality));
    });
  }

  setActiveQuality(name) {
    this.qualityButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.quality === name);
      button.setAttribute('aria-pressed', button.dataset.quality === name ? 'true' : 'false');
    });
  }
}
