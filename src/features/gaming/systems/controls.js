const AXIS_KEYS = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
};

const EDGE_KEYS = {
  interact: ['KeyE'],
  toggleMode: ['KeyQ'],
  pause: ['Escape'],
  map: ['Tab'],
};

const HOLD_KEYS = {
  boost: ['ShiftLeft', 'ShiftRight', 'Space'],
  dash: ['ShiftLeft', 'ShiftRight'],
};

const PREVENT_DEFAULT_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Tab',
  'Escape',
]);

export function createKeyboardSnapshot(pressed, edgeActions = {}) {
  const readAxis = (positive, negative) => {
    const pos = positive.some((code) => pressed.has(code)) ? 1 : 0;
    const neg = negative.some((code) => pressed.has(code)) ? 1 : 0;
    return pos - neg;
  };

  return {
    moveX: readAxis(AXIS_KEYS.right, AXIS_KEYS.left),
    moveY: readAxis(AXIS_KEYS.up, AXIS_KEYS.down),
    boost: HOLD_KEYS.boost.some((code) => pressed.has(code)),
    dash: HOLD_KEYS.dash.some((code) => pressed.has(code)),
    interact: Boolean(edgeActions.interact),
    toggleMode: Boolean(edgeActions.toggleMode),
    pause: Boolean(edgeActions.pause),
    map: Boolean(edgeActions.map),
  };
}

export class ControlsSystem {
  constructor() {
    this.pressed = new Set();
    this.edgeActions = {
      interact: false,
      toggleMode: false,
      pause: false,
      map: false,
    };
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(event) {
    if (PREVENT_DEFAULT_KEYS.has(event.code)) event.preventDefault();
    if (!this.pressed.has(event.code)) {
      this.pressed.add(event.code);
      for (const [action, codes] of Object.entries(EDGE_KEYS)) {
        if (codes.includes(event.code)) this.edgeActions[action] = true;
      }
    }
  }

  onKeyUp(event) {
    if (PREVENT_DEFAULT_KEYS.has(event.code)) event.preventDefault();
    this.pressed.delete(event.code);
  }

  getSnapshot() {
    const snapshot = createKeyboardSnapshot(this.pressed, this.edgeActions);
    for (const action of Object.keys(this.edgeActions)) this.edgeActions[action] = false;
    return snapshot;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
