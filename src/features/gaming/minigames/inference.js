const REQUIRED_SEQUENCE = ['alpha', 'beta', 'gamma', 'delta'];

export function createInferenceState() {
  return {
    seeds: new Set(),
    input: [],
    overload: 0,
    completed: false,
  };
}

export function getInferenceProgress(state) {
  return {
    seeds: state.seeds.size,
    seedsTotal: 4,
    sequence: state.input.length,
    overload: state.overload,
    completed: state.completed,
  };
}

export function handleInferenceInteract(state, interactable, mode) {
  if (!interactable) return { changed: false };

  if (interactable.type === 'inference-seed' && mode === 'vehicle') {
    if (state.seeds.has(interactable.id)) return { changed: false };
    state.seeds.add(interactable.id);
    return { changed: true, scoreDelta: 160 };
  }

  if (interactable.type === 'inference-terminal' && mode === 'foot' && state.seeds.size >= 4) {
    const expected = REQUIRED_SEQUENCE[state.input.length];
    if (interactable.key !== expected) {
      state.input = [];
      state.overload = Math.min(100, state.overload + 30);
      if (state.overload >= 100) return { changed: true, scoreDelta: -180, fail: true };
      return { changed: true, scoreDelta: -110, warning: true };
    }
    state.overload = Math.max(0, state.overload - 8);
    state.input.push(interactable.key);
    if (state.input.length === REQUIRED_SEQUENCE.length) {
      state.completed = true;
      return { changed: true, scoreDelta: 700, completed: true };
    }
    return { changed: true, scoreDelta: 190 };
  }

  return { changed: false };
}
