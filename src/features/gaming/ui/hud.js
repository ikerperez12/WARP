export class HudController {
  constructor(root) {
    this.root = root;
    this.nodes = {
      score: document.getElementById('hud-score'),
      integrity: document.getElementById('hud-integrity'),
      energy: document.getElementById('hud-energy'),
      mode: document.getElementById('hud-mode'),
      sector: document.getElementById('hud-sector'),
      missionTitle: document.getElementById('hud-mission-title'),
      missionBody: document.getElementById('hud-mission'),
      prompt: document.getElementById('hud-prompt'),
      quality: document.getElementById('hud-quality-badge'),
    };
  }

  setVisible(value) {
    this.root?.classList.toggle('is-active', value);
  }

  update(data) {
    if (this.nodes.score) this.nodes.score.textContent = String(Math.max(0, Math.round(data.score))).padStart(6, '0');
    if (this.nodes.integrity) this.nodes.integrity.textContent = `${Math.round(data.integrity)}%`;
    if (this.nodes.energy) this.nodes.energy.textContent = `${Math.round(data.energy)}%`;
    if (this.nodes.mode) this.nodes.mode.textContent = data.mode;
    if (this.nodes.sector) this.nodes.sector.textContent = data.sector;
    if (this.nodes.missionTitle) this.nodes.missionTitle.textContent = data.missionTitle;
    if (this.nodes.missionBody) this.nodes.missionBody.textContent = data.missionObjective;
    if (this.nodes.prompt) this.nodes.prompt.textContent = data.prompt;
    if (this.nodes.quality) this.nodes.quality.textContent = String(data.quality || 'auto').toUpperCase();
  }
}
