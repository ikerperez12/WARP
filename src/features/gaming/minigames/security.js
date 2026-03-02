const REQUIRED_ORDER = ['security-node-a', 'security-node-b', 'security-node-c'];

export function createSecurityState() {
  return {
    beacons: new Set(),
    shards: new Set(),
    nodes: [],
    alarm: 0,
    completed: false,
  };
}

export function getSecurityProgress(state) {
  return {
    outer: state.beacons.size,
    outerTotal: 2,
    shards: state.shards.size,
    nodes: state.nodes.length,
    alarm: state.alarm,
    completed: state.completed,
  };
}

export function handleSecurityInteract(state, interactable, mode) {
  if (!interactable) return { changed: false };

  if (interactable.type === 'security-beacon' && mode === 'vehicle') {
    if (state.beacons.has(interactable.id)) return { changed: false };
    state.beacons.add(interactable.id);
    return { changed: true, scoreDelta: 180 };
  }

  if (interactable.type === 'security-shard' && mode === 'foot' && state.beacons.size >= 2) {
    if (state.shards.has(interactable.id)) return { changed: false };
    state.shards.add(interactable.id);
    return { changed: true, scoreDelta: 120 };
  }

  if (interactable.type === 'security-node' && mode === 'foot' && state.shards.size >= 3) {
    if (state.nodes.includes(interactable.id)) return { changed: false };
    const expected = REQUIRED_ORDER[state.nodes.length];
    if (interactable.id !== expected) {
      state.alarm = Math.min(100, state.alarm + 24);
      state.nodes = [];
      return { changed: true, scoreDelta: -90, warning: true };
    }
    state.nodes.push(interactable.id);
    if (state.nodes.length === REQUIRED_ORDER.length) {
      state.completed = true;
      return { changed: true, scoreDelta: 600, completed: true };
    }
    return { changed: true, scoreDelta: 210 };
  }

  return { changed: false };
}
