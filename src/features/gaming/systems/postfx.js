export class PostFXSystem {
  constructor(renderer) {
    this.renderer = renderer;
  }

  applyTheme(theme, preset) {
    if (!this.renderer) return;
    this.renderer.toneMappingExposure = theme === 'light' ? 1.1 : 1.24;
    if (preset?.bloom) {
      this.renderer.toneMappingExposure += preset.bloom * (theme === 'light' ? 0.05 : 0.08);
    }
  }
}
