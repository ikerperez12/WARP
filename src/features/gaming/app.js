import { announce } from '../../utils/dom.js';
import { formatCopy, getCopy, getMissionCopy, getSectorCopy } from './copy.js';
import { createInitialState, hydrateGameState, clampPercent } from './state.js';
import { loadSave, persistSave, resetSave } from './save.js';
import { GameWorld } from './world/GameWorld.js';
import { findNearestInteractable, findSectorForPoint } from './world/zones.js';
import { VehicleEntity } from './entities/vehicle.js';
import { AvatarEntity } from './entities/avatar.js';
import { canToggleModeAtDock, syncEntityPositions } from './entities/transition.js';
import { CameraSystem } from './systems/camera.js';
import { ControlsSystem } from './systems/controls.js';
import { TouchControlsSystem } from './systems/touch-controls.js';
import { completeMission } from './systems/missions.js';
import { PerformanceManager } from './systems/performance.js';
import { PostFXSystem } from './systems/postfx.js';
import { AudioSystem } from './systems/audio.js';
import { HudController } from './ui/hud.js';
import { OverlayController } from './ui/overlays.js';
import { PanelController } from './ui/panels.js';
import { MinimapController } from './ui/minimap.js';
import { createSecurityState, getSecurityProgress, handleSecurityInteract } from './minigames/security.js';
import { createRoutingState, getRoutingProgress, handleRoutingInteract } from './minigames/routing.js';
import { createInferenceState, getInferenceProgress, handleInferenceInteract } from './minigames/inference.js';
import { HAZARD_DAMAGE_PER_SECOND, INTERACT_RANGE, MAX_ENERGY, MAX_INTEGRITY } from './config.js';

const SCORE_KEYS = {
  'breach-firewall': 'security',
  'restore-routing': 'routing',
  'stabilize-inference': 'inference',
};

const MISSION_OBJECTS = {
  'boot-sequence': ['boot-beacon', 'boot-dock'],
  'breach-firewall': ['firewall-dock', 'security-beacon-a', 'security-beacon-b', 'security-shard-a', 'security-shard-b', 'security-shard-c', 'security-node-a', 'security-node-b', 'security-node-c'],
  'restore-routing': ['routing-dock', 'routing-tower-a', 'routing-tower-b', 'routing-tower-c', 'routing-switch-a', 'routing-switch-b', 'routing-switch-c'],
  'stabilize-inference': ['inference-dock', 'inference-seed-a', 'inference-seed-b', 'inference-seed-c', 'inference-seed-d', 'inference-terminal-alpha', 'inference-terminal-beta', 'inference-terminal-gamma', 'inference-terminal-delta'],
  'system-reboot': ['core-dock', 'core-pylon-a', 'core-pylon-b', 'core-pylon-c', 'core-console'],
};

function mergeInput(keyboard, touch) {
  return {
    moveX: touch.moveX !== 0 ? touch.moveX : keyboard.moveX,
    moveY: touch.moveY !== 0 ? touch.moveY : keyboard.moveY,
    boost: keyboard.boost || touch.boost,
    dash: keyboard.dash || touch.dash,
    interact: keyboard.interact || touch.interact,
    toggleMode: keyboard.toggleMode || touch.toggleMode,
    pause: keyboard.pause || touch.pause,
    map: keyboard.map || touch.map,
  };
}

function resolveCopyPath(source, path) {
  return path.split('.').reduce((value, key) => (value && key in value ? value[key] : null), source);
}

export class GameApp {
  constructor({ canvas, root, initialPrefs }) {
    this.canvas = canvas;
    this.root = root;
    this.initialPrefs = initialPrefs;
    this.overlays = new OverlayController();
    this.hud = new HudController(document.getElementById('game-hud'));
    this.panelController = new PanelController();
    this.minimap = new MinimapController(document.getElementById('hud-minimap'));
    this.controls = new ControlsSystem();
    this.touchControls = new TouchControlsSystem(document.getElementById('touch-controls'));
    this.audio = new AudioSystem();
    this.cameraSystem = new CameraSystem();
    this.started = false;
    this.paused = false;
    this.lastFrame = 0;
    this.elapsed = 0;
    this.activeInteractable = null;
    this.copy = getCopy(initialPrefs.lang);
    this.runtime = this.createRuntime();
    this.raf = 0;
    this.logOpen = false;
    this.panelNodes = {
      panel: document.getElementById('game-project-panel'),
      missionSummary: document.getElementById('panel-mission-summary'),
      progress: document.getElementById('panel-progress'),
      bestScores: document.getElementById('panel-best-scores'),
    };
    this.loadingNodes = {
      progress: document.getElementById('loading-progress-bar'),
      percent: document.getElementById('loading-progress-value'),
      label: document.getElementById('loading-progress-label'),
    };
    this.handleResize = this.handleResize.bind(this);
    this.compatibilityMode = false;
  }

  hasCoarsePointer() {
    return Boolean(window.matchMedia?.('(pointer: coarse)')?.matches || navigator.maxTouchPoints > 0);
  }

  async init() {
    if (!this.canvas) {
      this.showFallback(this.copy?.fallback?.lead, this.copy?.fallback?.title);
      return;
    }

    const saved = loadSave();
    this.state = saved ? hydrateGameState(saved, this.initialPrefs) : createInitialState({
      settings: {
        theme: this.initialPrefs.theme,
        lang: this.initialPrefs.lang,
        quality: 'auto',
      },
    });
    this.state.bestScores = saved?.bestScores || { security: 0, routing: 0, inference: 0 };
    this.copy = getCopy(this.state.settings.lang);
    window.dispatchEvent(new CustomEvent('game:load', { detail: { missionId: this.state.currentMission } }));
    this.overlays.show('game-loading-overlay');
    this.updateLoadingState(0, this.copy.loading.assets);

    try {
      await this.bootRuntime({ compatibility: false });
    } catch (error) {
      console.error('[gaming] Initialization failed', error);
      try {
        await this.bootRuntime({ compatibility: true, previousError: error });
      } catch (compatibilityError) {
        console.error('[gaming] Compatibility initialization failed', compatibilityError);
        const suffix = compatibilityError?.message ? ` (${compatibilityError.message})` : '';
        this.showFallback(`${this.copy?.fallback?.loadFailed || 'Initialization failed'}${suffix}`);
      }
    }
  }

  async bootRuntime({ compatibility = false, previousError = null } = {}) {
    this.compatibilityMode = compatibility;
    this.world?.renderer?.dispose?.();
    this.canvas = document.getElementById('game-canvas') || this.canvas;

    if (compatibility) {
      console.warn('[gaming] Retrying in compatibility mode', previousError);
      this.updateLoadingState(0.08, this.copy.loading.compatibility || this.copy.loading.assets);
    }

    this.world = new GameWorld({
      canvas: this.canvas,
      theme: this.state.settings.theme,
      compatibility,
    });
    await this.world.init({
      onProgress: (value) => this.updateLoadingState(value, compatibility ? (this.copy.loading.compatibility || this.copy.loading.assets) : this.copy.loading.assets),
    });
    this.canvas = this.world.canvas || this.canvas;

    this.performance = new PerformanceManager(this.world.renderer);
    const requestedQuality = this.state.settings.quality === 'auto'
      ? this.performance.autoDetect()
      : this.state.settings.quality;
    this.state.settings.quality = requestedQuality;
    const preset = this.performance.setQuality(requestedQuality);

    this.postFX = new PostFXSystem(this.world.renderer, this.world.scene, this.cameraSystem.camera);
    this.postFX.applyTheme(this.state.settings.theme, preset);
    this.postFX.resize(window.innerWidth, window.innerHeight);

    this.vehicle = new VehicleEntity(this.world.materials, this.world.assets);
    this.avatar = new AvatarEntity(this.world.materials, this.world.assets);
    this.avatar.setVisible(false);
    this.vehicle.setPosition(0, 0, 0);
    this.avatar.setPosition(0, 0, 0);
    this.world.addEntity(this.vehicle.group);
    this.world.addEntity(this.avatar.group);

    this.panelController.bindQuality((name) => this.setQuality(name));
    this.panelController.setActiveQuality(this.state.settings.quality);

    this.applyCopy();
    this.syncPrefs(this.state.settings);
    this.resetMissionCheckpoint(this.state.currentMission, true);
    this.applyWorldProgress();
    this.dispatchMissionChange();
    this.updateHud(this.compatibilityMode ? (this.copy.hud.promptCompatibility || this.copy.hud.promptIdle) : this.copy.hud.promptIdle);
    this.postFX.render(this.world.scene, this.cameraSystem.camera);
    this.touchControls.setVisible(this.hasCoarsePointer());
    window.addEventListener('resize', this.handleResize);
    this.updateLoadingState(1, compatibility ? (this.copy.loading.compatibilityReady || this.copy.loading.ready) : this.copy.loading.ready);
    this.overlays.hide('game-loading-overlay');
  }

  createRuntime() {
    return {
      boot: {
        relayArmed: false,
        switchedMode: false,
      },
      security: createSecurityState(),
      routing: createRoutingState(),
      inference: createInferenceState(),
      final: {
        pylons: new Set(),
        completed: false,
      },
    };
  }

  hasStarted() {
    return this.started;
  }

  isPaused() {
    return this.paused;
  }

  showFallback(message = null, title = null) {
    this.overlays.hideAll();
    const fallbackTitle = document.querySelector('#game-fallback-overlay [data-copy="fallback.title"]');
    const fallbackLead = document.querySelector('#game-fallback-overlay .panel-lead');
    if (fallbackTitle && title) fallbackTitle.textContent = title;
    if (fallbackLead && message) fallbackLead.textContent = message;
    this.overlays.show('game-fallback-overlay');
  }

  start() {
    if (this.started && !this.paused) return;
    this.audio.resume();
    this.audio.playCue('start');
    this.overlays.hide('game-start-overlay');
    this.overlays.hide('game-over-overlay');
    this.overlays.hide('game-victory-overlay');
    this.started = true;
    this.paused = false;
    this.hud.setVisible(true);
    this.syncTouchVisibility();
    this.lastFrame = performance.now();
    this.dispatchModeChange();
    this.dispatchMissionChange();
    this.loop(this.lastFrame);
  }

  pause() {
    if (!this.started || this.paused) return;
    this.paused = true;
    this.overlays.show('game-pause-overlay');
    this.syncTouchVisibility();
    window.dispatchEvent(new CustomEvent('game:pause'));
  }

  resume() {
    if (!this.started || !this.paused) return;
    this.paused = false;
    this.overlays.hide('game-pause-overlay');
    this.syncTouchVisibility();
    this.lastFrame = performance.now();
    window.dispatchEvent(new CustomEvent('game:resume'));
    this.loop(this.lastFrame);
  }

  restartFromCheckpoint() {
    this.overlays.hide('game-over-overlay');
    this.state.integrity = MAX_INTEGRITY;
    this.state.energy = MAX_ENERGY;
    this.paused = false;
    this.resetMissionCheckpoint(this.state.currentMission, true);
    this.applyWorldProgress();
    this.updateHud(this.copy.hud.promptIdle);
    this.audio.playCue('start');
    this.start();
  }

  resetAndStart() {
    this.resetRuntimeAndState();
    this.applyWorldProgress();
    this.overlays.hide('game-victory-overlay');
    this.start();
  }

  resetProgress() {
    resetSave();
    this.resetRuntimeAndState();
    this.applyWorldProgress();
    this.overlays.hideAll();
    this.overlays.show('game-start-overlay');
    this.hud.setVisible(false);
    this.started = false;
    this.paused = false;
    this.setLogPanel(false);
    announce(this.copy.buttons.reset);
  }

  resetRuntimeAndState() {
    this.runtime = this.createRuntime();
    this.state = createInitialState({
      settings: {
        theme: this.state.settings.theme,
        lang: this.state.settings.lang,
        quality: this.state.settings.quality,
      },
    });
    this.state.bestScores = { security: 0, routing: 0, inference: 0 };
    this.resetMissionCheckpoint(this.state.currentMission, true);
    this.dispatchMissionChange();
  }

  setQuality(name) {
    this.state.settings.quality = name;
    const preset = this.performance.setQuality(name);
    this.panelController.setActiveQuality(name);
    this.postFX.applyTheme(this.state.settings.theme, preset);
    this.updateHud(this.copy.hud.promptIdle);
    this.persist();
  }

  syncPrefs(nextPrefs) {
    this.state.settings.theme = nextPrefs.theme || this.state.settings.theme;
    this.state.settings.lang = nextPrefs.lang || this.state.settings.lang;
    this.copy = getCopy(this.state.settings.lang);
    this.applyCopy();
    this.world?.applyTheme(this.state.settings.theme);
    const preset = this.performance?.setQuality(this.state.settings.quality);
    this.postFX?.applyTheme(this.state.settings.theme, preset);
    this.dispatchMissionChange();
    this.updateHud(this.activePrompt() || this.copy.hud.promptIdle);
  }

  applyCopy() {
    document.title = this.copy.meta.title;
    document.querySelectorAll('[data-copy]').forEach((node) => {
      const value = resolveCopyPath(this.copy, node.dataset.copy);
      if (typeof value === 'string') node.textContent = value;
    });
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = this.state.settings.theme === 'dark'
        ? this.copy.settings.themeToggleDark
        : this.copy.settings.themeToggleLight;
    }
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.textContent = this.state.settings.lang === 'es'
        ? this.copy.settings.langToggleEs
        : this.copy.settings.langToggleEn;
    }
    this.panelController.setActiveQuality(this.state.settings.quality);
    this.updateSidePanel();
  }

  loop = (timestamp) => {
    if (!this.started) return;
    this.raf = requestAnimationFrame(this.loop);
    if (this.paused) return;

    const dt = Math.min(0.05, (timestamp - this.lastFrame) / 1000 || 0.016);
    this.lastFrame = timestamp;
    this.elapsed += dt;

    const keyboard = this.controls.getSnapshot();
    const touch = this.touchControls.getSnapshot();
    const input = mergeInput(keyboard, touch);
    if (input.pause) {
      this.pause();
      return;
    }
    if (input.map) this.toggleLogPanel();

    this.consumeEnergy(input, dt);
    this.updateEntities(input, dt);
    this.updateSector();
    this.world.update(dt, this.elapsed);
    this.updateHazards(dt);
    this.updateInteractable();

    if (input.interact) this.handleInteract();
    if (input.toggleMode && this.activeInteractable?.item?.type === 'dock') this.toggleMode();

    this.cameraSystem.setMode(this.state.activeMode === 'vehicle' ? 'vehicle' : 'foot');
    this.cameraSystem.focus(this.getActivePosition(), {
      lookYOffset: this.state.activeMode === 'vehicle' ? 2.3 : 2.1,
      heading: this.state.activeMode === 'vehicle' ? this.vehicle.getHeading() : this.avatar.group.rotation.y,
    });
    this.cameraSystem.update(dt);
    this.postFX.render(this.world.scene, this.cameraSystem.camera);
    this.updateHud(this.activePrompt());
    this.minimap.update(this.getActivePosition(), this.state.currentSector);
  };

  updateEntities(input, dt) {
    const usingEnergy = this.state.energy > 6;
    const resolved = {
      ...input,
      boost: input.boost && usingEnergy,
      dash: input.dash && usingEnergy,
    };

    if (this.state.activeMode === 'vehicle') {
      this.vehicle.update(resolved, dt);
      syncEntityPositions('vehicle', this.vehicle, this.avatar);
    } else {
      this.avatar.update(resolved, dt);
      syncEntityPositions('foot', this.vehicle, this.avatar);
    }
  }

  consumeEnergy(input, dt) {
    const activeDrain = this.state.activeMode === 'vehicle' ? input.boost : input.dash;
    const drain = activeDrain ? 24 : -10;
    this.state.energy = clampPercent(this.state.energy - drain * dt);
  }

  updateSector() {
    const previous = this.state.currentSector;
    const sector = findSectorForPoint(this.getActivePosition());
    this.state.currentSector = sector.id;
    if (sector.id !== previous) {
      window.dispatchEvent(new CustomEvent('game:sector-exit', { detail: { sectorId: previous } }));
      window.dispatchEvent(new CustomEvent('game:sector-enter', { detail: { sectorId: sector.id } }));
    }
  }

  updateInteractable() {
    const nearby = findNearestInteractable(this.getActivePosition(), this.world.getInteractables(), INTERACT_RANGE);
    this.activeInteractable = nearby;
    this.world.setFocusedInteractable(nearby?.item?.id ?? null);
  }

  updateHazards(dt) {
    const mission = this.state.currentMission;
    if (mission !== 'breach-firewall' || this.state.activeMode !== 'foot') return;
    const security = this.runtime.security;
    if (security.completed || security.beacons.size < 2) return;
    const player = this.getActivePosition();
    for (const hazard of this.world.hazards) {
      const dx = player.x - hazard.position.x;
      const dz = player.z - hazard.position.z;
      if (Math.sqrt(dx * dx + dz * dz) < 7.5) {
        security.alarm = Math.min(100, security.alarm + dt * 18);
        this.state.integrity = clampPercent(this.state.integrity - HAZARD_DAMAGE_PER_SECOND * dt);
        if (this.state.integrity <= 0 || security.alarm >= 100) {
          this.triggerGameOver(security.alarm >= 100 ? this.copy.gameOver.securityLead : this.copy.gameOver.lead);
        }
      }
    }
  }

  handleInteract() {
    const item = this.activeInteractable?.item;
    if (!item) return;

    if (item.type === 'dock') {
      if (this.state.currentMission === 'boot-sequence' && this.runtime.boot.relayArmed && !this.runtime.boot.switchedMode) {
        this.runtime.boot.switchedMode = true;
      }
      this.toggleMode();
      if (this.state.currentMission === 'boot-sequence' && this.runtime.boot.relayArmed && this.runtime.boot.switchedMode) {
        this.completeMissionFlow('boot-sequence');
      }
      return;
    }

    if (this.state.currentMission === 'boot-sequence' && item.type === 'boot-beacon') {
      this.runtime.boot.relayArmed = true;
      this.state.score += 140;
      this.world.setInteractableState(item.id, 'complete');
      this.applyMissionRuntimeState();
      this.audio.playCue('collect');
      return;
    }

    if (this.state.currentMission === 'breach-firewall') {
      const result = handleSecurityInteract(this.runtime.security, item, this.state.activeMode);
      this.applyMissionResult(item, result, 'breach-firewall');
      return;
    }

    if (this.state.currentMission === 'restore-routing') {
      const result = handleRoutingInteract(this.runtime.routing, item, this.state.activeMode);
      this.applyMissionResult(item, result, 'restore-routing');
      return;
    }

    if (this.state.currentMission === 'stabilize-inference') {
      const result = handleInferenceInteract(this.runtime.inference, item, this.state.activeMode);
      this.applyMissionResult(item, result, 'stabilize-inference');
      return;
    }

    if (this.state.currentMission === 'system-reboot') {
      if (item.type === 'core-pylon' && this.state.activeMode === 'vehicle') {
        if (!this.runtime.final.pylons.has(item.id)) {
          this.runtime.final.pylons.add(item.id);
          this.state.score += 240;
          this.world.setInteractableState(item.id, 'hidden');
          this.applyMissionRuntimeState();
          this.audio.playCue('collect');
        }
        return;
      }
      if (item.type === 'core-console' && this.state.activeMode === 'foot' && this.runtime.final.pylons.size >= 3) {
        this.world.setInteractableState(item.id, 'complete');
        this.state.score += 900;
        this.runtime.final.completed = true;
        this.completeMissionFlow('system-reboot');
      }
    }
  }

  applyMissionResult(item, result, missionId) {
    if (!result.changed) return;
    this.state.score = Math.max(0, this.state.score + (result.scoreDelta || 0));
    if (result.fail) {
      if (item.type.includes('node') || item.type.includes('switch') || item.type.includes('terminal')) {
        this.world.setInteractableState(item.id, 'warning');
      }
      const message = missionId === 'restore-routing' ? this.copy.gameOver.routingLead : this.copy.gameOver.inferenceLead;
      this.triggerGameOver(message);
      return;
    }
    if (item.type.includes('beacon') || item.type.includes('shard') || item.type.includes('tower') || item.type.includes('seed') || item.type.includes('pylon')) {
      this.world.setInteractableState(item.id, 'hidden');
    }
    if (item.type.includes('node') || item.type.includes('switch') || item.type.includes('terminal')) {
      this.world.setInteractableState(item.id, result.warning ? 'warning' : 'complete');
    }
    if (result.warning) {
      this.state.integrity = clampPercent(this.state.integrity - 12);
      this.audio.playCue('warn');
      if (this.state.integrity <= 0) this.triggerGameOver(this.copy.gameOver.lead);
      this.applyMissionRuntimeState();
      this.updateSidePanel();
      return;
    }
    this.audio.playCue(result.completed ? 'success' : 'collect');
    this.applyMissionRuntimeState();
    this.updateSidePanel();
    if (result.completed) this.completeMissionFlow(missionId);
  }

  toggleMode() {
    const item = this.activeInteractable?.item;
    if (!canToggleModeAtDock(this.state.activeMode, item)) {
      return;
    }

    this.state.activeMode = this.state.activeMode === 'vehicle' ? 'foot' : 'vehicle';

    const isVehicle = this.state.activeMode === 'vehicle';
    this.vehicle.setVisible(isVehicle);
    this.avatar.setVisible(!isVehicle);
    this.audio.playCue('switch');
    this.dispatchModeChange();
  }

  completeMissionFlow(missionId) {
    if (this.state.currentMission !== missionId) return;
    const previous = this.copy.missions[missionId];
    this.state = {
      ...completeMission(this.state, missionId),
      score: this.state.score,
      integrity: this.state.integrity,
      energy: this.state.energy,
      settings: { ...this.state.settings },
      bestScores: this.state.bestScores,
    };
    const scoreKey = SCORE_KEYS[missionId];
    if (scoreKey) this.state.bestScores[scoreKey] = Math.max(this.state.bestScores[scoreKey], this.state.score);
    this.persist();
    this.resetMissionCheckpoint(this.state.currentMission, false);
    this.applyWorldProgress();
    this.dispatchMissionChange();
    this.overlays.showToast(previous.toastTitle, previous.toastBody);
    announce(previous.toastTitle);
    this.audio.playCue('success');
    this.updateSidePanel();

    if (missionId === 'system-reboot') {
      this.triggerVictory();
    }
  }

  triggerGameOver(message) {
    this.started = false;
    this.paused = true;
    this.setLogPanel(false);
    this.overlays.show('game-over-overlay');
    document.getElementById('game-over-msg').textContent = message;
    document.getElementById('final-score').textContent = String(Math.round(this.state.score)).padStart(6, '0');
    this.hud.setVisible(false);
    this.syncTouchVisibility();
    window.dispatchEvent(new CustomEvent('game:over', { detail: { score: this.state.score } }));
    this.audio.playCue('fail');
  }

  triggerVictory() {
    this.started = false;
    this.paused = true;
    this.setLogPanel(false);
    this.overlays.show('game-victory-overlay');
    document.getElementById('victory-score').textContent = String(Math.round(this.state.score)).padStart(6, '0');
    this.hud.setVisible(false);
    this.syncTouchVisibility();
    window.dispatchEvent(new CustomEvent('game:victory', { detail: { score: this.state.score } }));
  }

  resetMissionCheckpoint(missionId, teleport = false) {
    if (missionId === 'boot-sequence') {
      this.runtime.boot = { relayArmed: false, switchedMode: false };
      if (teleport) this.teleportTo({ x: 0, z: 0 }, 'vehicle');
    }
    if (missionId === 'breach-firewall') {
      this.runtime.security = createSecurityState();
      if (teleport) this.teleportTo({ x: -58, z: -4 }, 'vehicle');
    }
    if (missionId === 'restore-routing') {
      this.runtime.routing = createRoutingState();
      if (teleport) this.teleportTo({ x: 58, z: -2 }, 'vehicle');
    }
    if (missionId === 'stabilize-inference') {
      this.runtime.inference = createInferenceState();
      if (teleport) this.teleportTo({ x: -10, z: 62 }, 'vehicle');
    }
    if (missionId === 'system-reboot') {
      this.runtime.final = { pylons: new Set(), completed: false };
      if (teleport) this.teleportTo({ x: 0, z: -68 }, 'vehicle');
    }
  }

  teleportTo(position, mode = 'vehicle') {
    this.state.activeMode = mode;
    this.vehicle.setVisible(mode === 'vehicle');
    this.avatar.setVisible(mode === 'foot');
    this.vehicle.setPosition(position.x, 0, position.z);
    this.avatar.setPosition(position.x, 0, position.z);
    this.state.currentSector = findSectorForPoint(position).id;
    this.cameraSystem.setMode(mode);
    this.cameraSystem.focus({ x: position.x, y: 0, z: position.z });
    this.cameraSystem.update(0.016);
  }

  getActivePosition() {
    return this.state.activeMode === 'vehicle' ? this.vehicle.getPosition() : this.avatar.getPosition();
  }

  activePrompt() {
    const item = this.activeInteractable?.item;
    if (!item) return this.copy.hud.promptIdle;

    if (item.type === 'dock') {
      return this.state.activeMode === 'vehicle' ? this.copy.prompts.switchToFoot : this.copy.prompts.switchToVehicle;
    }

    if (item.sectorId && !this.state.unlockedSectors.includes(item.sectorId)) return this.copy.prompts.lockedSector;

    if (this.state.currentMission === 'boot-sequence' && !this.runtime.boot.relayArmed) return this.copy.prompts.bootConsole;
    if (this.state.currentMission === 'system-reboot' && item.type === 'core-console') return this.copy.prompts.finalConsole;
    if (this.state.currentMission === 'breach-firewall' && this.runtime.security.alarm > 50) return this.copy.prompts.hazard;
    if (this.state.completedMissions.includes(this.state.currentMission)) return this.copy.prompts.completed;
    return this.copy.prompts.collect;
  }

  updateHud(prompt) {
    const missionCopy = getMissionCopy(this.state.settings.lang, this.state.currentMission);
    const modeLabel = this.copy.modes[this.state.activeMode];
    const sectorLabel = getSectorCopy(this.state.settings.lang, this.state.currentSector);
    const status = this.composeStatusChip();

    this.hud.update({
      score: this.state.score,
      integrity: this.state.integrity,
      energy: this.state.energy,
      mode: modeLabel,
      sector: sectorLabel,
      missionTitle: missionCopy.title,
      missionObjective: this.composeObjective(missionCopy.objective),
      prompt,
      quality: this.state.settings.quality,
      status,
    });

    window.dispatchEvent(new CustomEvent('game:update-hud', {
      detail: {
        score: this.state.score,
        integrity: this.state.integrity,
        energy: this.state.energy,
        speed: this.state.activeMode === 'vehicle' ? this.vehicle.speed : this.avatar.speed,
        missionId: this.state.currentMission,
        missionTitle: missionCopy.title,
        missionObjective: this.composeObjective(missionCopy.objective),
        mode: this.state.activeMode,
        sectorId: this.state.currentSector,
      },
    }));
    this.updateSidePanel();
  }

  composeObjective(baseObjective) {
    if (this.state.currentMission === 'breach-firewall') {
      const progress = getSecurityProgress(this.runtime.security);
      return `${baseObjective} [${progress.outer}/2 beacons | ${progress.shards}/3 shards | ${progress.nodes}/3 nodes | ${this.copy.hud.alarm.toLowerCase()} ${Math.round(progress.alarm)}%]`;
    }
    if (this.state.currentMission === 'restore-routing') {
      const progress = getRoutingProgress(this.runtime.routing);
      return `${baseObjective} [${progress.towers}/3 towers | ${progress.solved}/3 switches | ${this.copy.hud.overflow.toLowerCase()} ${Math.round(progress.overflow)}%]`;
    }
    if (this.state.currentMission === 'stabilize-inference') {
      const progress = getInferenceProgress(this.runtime.inference);
      return `${baseObjective} [${progress.seeds}/4 seeds | ${progress.sequence}/4 sequence | ${this.copy.hud.overload.toLowerCase()} ${Math.round(progress.overload)}%]`;
    }
    if (this.state.currentMission === 'system-reboot') {
      return `${baseObjective} [${this.runtime.final.pylons.size}/3 pylons]`;
    }
    return baseObjective;
  }

  composeStatusChip() {
    if (this.state.currentMission === 'breach-firewall') {
      return `${this.copy.hud.alarm} ${Math.round(getSecurityProgress(this.runtime.security).alarm)}%`;
    }
    if (this.state.currentMission === 'restore-routing') {
      return `${this.copy.hud.overflow} ${Math.round(getRoutingProgress(this.runtime.routing).overflow)}%`;
    }
    if (this.state.currentMission === 'stabilize-inference') {
      return `${this.copy.hud.overload} ${Math.round(getInferenceProgress(this.runtime.inference).overload)}%`;
    }
    if (this.state.currentMission === 'system-reboot') {
      return formatCopy(this.copy.hud.pylons, { count: this.runtime.final.pylons.size, total: 3 });
    }
    return this.copy.hud.ready;
  }

  dispatchMissionChange() {
    const mission = getMissionCopy(this.state.settings.lang, this.state.currentMission);
    window.dispatchEvent(new CustomEvent('game:mission-change', {
      detail: {
        missionId: this.state.currentMission,
        title: mission.title,
        objective: mission.objective,
        sectorId: this.state.currentSector,
        progress: this.state.completedMissions.length,
      },
    }));
    this.updateSidePanel();
  }

  dispatchModeChange() {
    window.dispatchEvent(new CustomEvent('game:mode-change', { detail: { mode: this.state.activeMode } }));
  }

  persist() {
    persistSave(this.state);
    window.dispatchEvent(new CustomEvent('game:save', { detail: { missionId: this.state.currentMission } }));
  }

  applyWorldProgress() {
    Object.values(MISSION_OBJECTS).flat().forEach((id) => this.world.setInteractableState(id, 'locked'));

    this.state.unlockedSectors.forEach((sectorId) => {
      const dockId = {
        'boot-relay': 'boot-dock',
        'firewall-sector': 'firewall-dock',
        'routing-array': 'routing-dock',
        'inference-core': 'inference-dock',
        'core-chamber': 'core-dock',
      }[sectorId];
      if (dockId) this.world.setInteractableState(dockId, 'idle');
    });

    for (const missionId of this.state.completedMissions) {
      if (missionId === 'boot-sequence') {
        this.world.setInteractableState('boot-beacon', 'complete');
      }
      if (missionId === 'breach-firewall') {
        ['security-beacon-a', 'security-beacon-b', 'security-shard-a', 'security-shard-b', 'security-shard-c'].forEach((id) => this.world.setInteractableState(id, 'hidden'));
        ['security-node-a', 'security-node-b', 'security-node-c'].forEach((id) => this.world.setInteractableState(id, 'complete'));
      }
      if (missionId === 'restore-routing') {
        ['routing-tower-a', 'routing-tower-b', 'routing-tower-c'].forEach((id) => this.world.setInteractableState(id, 'hidden'));
        ['routing-switch-a', 'routing-switch-b', 'routing-switch-c'].forEach((id) => this.world.setInteractableState(id, 'complete'));
      }
      if (missionId === 'stabilize-inference') {
        ['inference-seed-a', 'inference-seed-b', 'inference-seed-c', 'inference-seed-d'].forEach((id) => this.world.setInteractableState(id, 'hidden'));
        ['inference-terminal-alpha', 'inference-terminal-beta', 'inference-terminal-gamma', 'inference-terminal-delta'].forEach((id) => this.world.setInteractableState(id, 'complete'));
      }
      if (missionId === 'system-reboot') {
        ['core-pylon-a', 'core-pylon-b', 'core-pylon-c'].forEach((id) => this.world.setInteractableState(id, 'hidden'));
        this.world.setInteractableState('core-console', 'complete');
      }
    }

    this.applyMissionRuntimeState();
  }

  applyMissionRuntimeState() {
    if (!this.world) return;

    const setState = (id, state) => this.world.setInteractableState(id, state);

    if (this.state.currentMission === 'boot-sequence') {
      setState('boot-beacon', this.runtime.boot.relayArmed ? 'complete' : 'idle');
      setState('boot-dock', this.runtime.boot.relayArmed ? 'idle' : 'locked');
      return;
    }

    if (this.state.currentMission === 'breach-firewall') {
      setState('firewall-dock', 'idle');
      ['security-beacon-a', 'security-beacon-b'].forEach((id) => {
        setState(id, this.runtime.security.beacons.has(id) ? 'hidden' : 'idle');
      });

      const shardsUnlocked = this.runtime.security.beacons.size >= 2;
      ['security-shard-a', 'security-shard-b', 'security-shard-c'].forEach((id) => {
        if (this.runtime.security.shards.has(id)) setState(id, 'hidden');
        else setState(id, shardsUnlocked ? 'idle' : 'locked');
      });

      const nodesUnlocked = this.runtime.security.shards.size >= 3;
      ['security-node-a', 'security-node-b', 'security-node-c'].forEach((id) => {
        if (this.runtime.security.nodes.includes(id)) setState(id, 'complete');
        else setState(id, nodesUnlocked ? 'idle' : 'locked');
      });
      return;
    }

    if (this.state.currentMission === 'restore-routing') {
      setState('routing-dock', 'idle');
      ['routing-tower-a', 'routing-tower-b', 'routing-tower-c'].forEach((id) => {
        setState(id, this.runtime.routing.towers.has(id) ? 'hidden' : 'idle');
      });

      const switchTargets = {
        'routing-switch-a': 2,
        'routing-switch-b': 1,
        'routing-switch-c': 3,
      };
      const switchesUnlocked = this.runtime.routing.towers.size >= 3;
      Object.entries(switchTargets).forEach(([id, target]) => {
        if (!switchesUnlocked) {
          setState(id, 'locked');
          return;
        }
        if (this.runtime.routing.switches[id] === target) {
          setState(id, 'complete');
          return;
        }
        setState(id, this.runtime.routing.switches[id] > 0 ? 'warning' : 'idle');
      });
      return;
    }

    if (this.state.currentMission === 'stabilize-inference') {
      setState('inference-dock', 'idle');
      ['inference-seed-a', 'inference-seed-b', 'inference-seed-c', 'inference-seed-d'].forEach((id) => {
        setState(id, this.runtime.inference.seeds.has(id) ? 'hidden' : 'idle');
      });

      const terminalsUnlocked = this.runtime.inference.seeds.size >= 4;
      const terminalKeys = {
        'inference-terminal-alpha': 'alpha',
        'inference-terminal-beta': 'beta',
        'inference-terminal-gamma': 'gamma',
        'inference-terminal-delta': 'delta',
      };
      Object.entries(terminalKeys).forEach(([id, key]) => {
        if (!terminalsUnlocked) {
          setState(id, 'locked');
          return;
        }
        setState(id, this.runtime.inference.input.includes(key) ? 'complete' : 'idle');
      });
      return;
    }

    if (this.state.currentMission === 'system-reboot') {
      setState('core-dock', 'idle');
      ['core-pylon-a', 'core-pylon-b', 'core-pylon-c'].forEach((id) => {
        setState(id, this.runtime.final.pylons.has(id) ? 'hidden' : 'idle');
      });
      setState('core-console', this.runtime.final.pylons.size >= 3 ? 'idle' : 'locked');
      return;
    }

    (MISSION_OBJECTS[this.state.currentMission] || []).forEach((id) => {
      if (!this.state.completedMissions.includes(this.state.currentMission)) setState(id, 'idle');
    });
  }

  syncTouchVisibility() {
    const coarse = this.hasCoarsePointer();
    this.touchControls.setVisible(Boolean(coarse && this.started && !this.paused));
  }

  handleResize() {
    this.world?.resize();
    this.cameraSystem?.resize();
    this.postFX?.resize(window.innerWidth, window.innerHeight);
    this.postFX?.render(this.world.scene, this.cameraSystem.camera);
  }

  toggleLogPanel() {
    this.setLogPanel(!this.logOpen);
  }

  setLogPanel(value) {
    this.logOpen = value;
    this.panelNodes.panel?.classList.toggle('is-hidden', !value);
  }

  updateSidePanel() {
    const mission = getMissionCopy(this.state.settings.lang, this.state.currentMission);
    const completed = this.state.completedMissions.length;
    if (this.panelNodes.missionSummary) this.panelNodes.missionSummary.textContent = this.composeObjective(mission.objective);
    if (this.panelNodes.progress) {
      this.panelNodes.progress.textContent = formatCopy(this.copy.panel.progressValue, { completed, total: 5 });
    }
    if (this.panelNodes.bestScores) {
      this.panelNodes.bestScores.textContent = formatCopy(this.copy.panel.bestScoresValue, {
        security: String(this.state.bestScores.security || 0).padStart(4, '0'),
        routing: String(this.state.bestScores.routing || 0).padStart(4, '0'),
        inference: String(this.state.bestScores.inference || 0).padStart(4, '0'),
      });
    }
  }

  updateLoadingState(progress = 0, label = '') {
    if (this.loadingNodes.progress) {
      this.loadingNodes.progress.style.setProperty('--loading-progress', `${Math.round(progress * 100)}%`);
    }
    if (this.loadingNodes.percent) {
      this.loadingNodes.percent.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}%`;
    }
    if (this.loadingNodes.label && label) {
      this.loadingNodes.label.textContent = label;
    }
  }
}

