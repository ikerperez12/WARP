const TARGETS = {
  'routing-switch-a': 2,
  'routing-switch-b': 1,
  'routing-switch-c': 3,
};

export function createRoutingState() {
  return {
    towers: new Set(),
    switches: {
      'routing-switch-a': 0,
      'routing-switch-b': 0,
      'routing-switch-c': 0,
    },
    overflow: 0,
    completed: false,
  };
}

export function getRoutingProgress(state) {
  const solved = Object.entries(state.switches).filter(([id, value]) => TARGETS[id] === value).length;
  return {
    towers: state.towers.size,
    towersTotal: 3,
    solved,
    overflow: state.overflow,
    completed: state.completed,
  };
}

export function handleRoutingInteract(state, interactable, mode) {
  if (!interactable) return { changed: false };

  if (interactable.type === 'routing-tower' && mode === 'vehicle') {
    if (state.towers.has(interactable.id)) return { changed: false };
    state.towers.add(interactable.id);
    return { changed: true, scoreDelta: 220 };
  }

  if (interactable.type === 'routing-switch' && mode === 'foot' && state.towers.size >= 3) {
    state.switches[interactable.id] = (state.switches[interactable.id] + 1) % 4;
    const currentValue = state.switches[interactable.id];
    if (currentValue === TARGETS[interactable.id]) state.overflow = Math.max(0, state.overflow - 6);
    else state.overflow = Math.min(100, state.overflow + 15);
    const solved = Object.entries(state.switches).every(([id, value]) => value === TARGETS[id]);
    if (solved) {
      state.completed = true;
      return { changed: true, scoreDelta: 640, completed: true };
    }
    if (state.overflow >= 100) return { changed: true, scoreDelta: -140, fail: true };
    return { changed: true, scoreDelta: 70, warning: currentValue !== TARGETS[interactable.id] };
  }

  return { changed: false };
}
