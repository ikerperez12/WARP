import { MINIMAP_SIZE } from '../config.js';
import { SECTOR_BY_ID } from '../world/sectors.js';

export class MinimapController {
  constructor(root) {
    this.root = root;
    this.player = document.getElementById('minimap-player');
    this.sectors = Array.from(root?.querySelectorAll('.minimap-sector') || []);
    this.boot();
  }

  boot() {
    this.sectors.forEach((node) => {
      const sector = SECTOR_BY_ID[node.dataset.sector];
      if (!sector) return;
      node.style.left = `${((sector.center.x + 140) / 280) * MINIMAP_SIZE}px`;
      node.style.top = `${((sector.center.z + 132) / 266) * MINIMAP_SIZE}px`;
    });
  }

  update(position, currentSector) {
    if (this.player) {
      this.player.style.left = `${((position.x + 140) / 280) * MINIMAP_SIZE}px`;
      this.player.style.top = `${((position.z + 132) / 266) * MINIMAP_SIZE}px`;
    }
    this.sectors.forEach((node) => node.classList.toggle('is-active', node.dataset.sector === currentSector));
  }
}
