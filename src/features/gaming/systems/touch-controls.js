import { POINTER_ACTIONS } from '../config.js';

export function computeJoystickVector(origin, point, radius = 48) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
  const angle = Math.atan2(dy, dx);

  return {
    moveX: Number(((Math.cos(angle) * distance) / radius).toFixed(4)),
    moveY: Number(((-Math.sin(angle) * distance) / radius).toFixed(4)),
    knobX: Math.cos(angle) * distance,
    knobY: Math.sin(angle) * distance,
  };
}

export class TouchControlsSystem {
  constructor(root) {
    this.root = root;
    this.joystick = root?.querySelector('#touch-joystick') || null;
    this.knob = root?.querySelector('#touch-joystick-knob') || null;
    this.touchState = {
      moveX: 0,
      moveY: 0,
      boost: false,
      dash: false,
      interact: false,
      toggleMode: false,
      pause: false,
      map: false,
    };
    this.origin = null;
    this.visible = false;
    this.boundActions = [];
    this.mount();
  }

  mount() {
    if (!this.root || !this.joystick) return;
    this.root.querySelectorAll('[data-touch-action]').forEach((button) => {
      const action = button.dataset.touchAction;
      if (!POINTER_ACTIONS.includes(action)) return;
      const down = () => this.setAction(action, true);
      const up = () => this.setAction(action, false);
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('pointerleave', up);
      this.boundActions.push({ button, down, up });
    });

    const activate = (event) => {
      const rect = this.joystick.getBoundingClientRect();
      this.origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      this.updateVector({ x: event.clientX, y: event.clientY });
    };

    const move = (event) => {
      if (!this.origin) return;
      this.updateVector({ x: event.clientX, y: event.clientY });
    };

    const release = () => {
      this.origin = null;
      this.touchState.moveX = 0;
      this.touchState.moveY = 0;
      if (this.knob) this.knob.style.transform = 'translate(0px, 0px)';
    };

    this.joystick.addEventListener('pointerdown', activate);
    this.joystick.addEventListener('pointermove', move);
    this.joystick.addEventListener('pointerup', release);
    this.joystick.addEventListener('pointercancel', release);
    this.joystick.addEventListener('pointerleave', release);

    this.listeners = { activate, move, release };
  }

  updateVector(point) {
    if (!this.origin) return;
    const result = computeJoystickVector(this.origin, point);
    this.touchState.moveX = result.moveX;
    this.touchState.moveY = result.moveY;
    if (this.knob) {
      this.knob.style.transform = `translate(${result.knobX}px, ${result.knobY}px)`;
    }
  }

  setAction(action, value) {
    if (action === 'boost') {
      this.touchState.boost = value;
      this.touchState.dash = value;
      return;
    }
    if (action === 'interact') this.touchState.interact = value;
    if (action === 'toggle') this.touchState.toggleMode = value;
    if (action === 'pause') this.touchState.pause = value;
  }

  setVisible(value) {
    this.visible = value;
    if (!this.root) return;
    this.root.classList.toggle('is-visible', value);
    this.root.setAttribute('aria-hidden', value ? 'false' : 'true');
  }

  getSnapshot() {
    const snapshot = { ...this.touchState };
    this.touchState.interact = false;
    this.touchState.toggleMode = false;
    this.touchState.pause = false;
    return snapshot;
  }

  destroy() {
    for (const binding of this.boundActions) {
      binding.button.removeEventListener('pointerdown', binding.down);
      binding.button.removeEventListener('pointerup', binding.up);
      binding.button.removeEventListener('pointercancel', binding.up);
      binding.button.removeEventListener('pointerleave', binding.up);
    }
    if (!this.listeners || !this.joystick) return;
    this.joystick.removeEventListener('pointerdown', this.listeners.activate);
    this.joystick.removeEventListener('pointermove', this.listeners.move);
    this.joystick.removeEventListener('pointerup', this.listeners.release);
    this.joystick.removeEventListener('pointercancel', this.listeners.release);
    this.joystick.removeEventListener('pointerleave', this.listeners.release);
  }
}
