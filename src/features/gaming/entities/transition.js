export function canToggleModeAtDock(activeMode, interactable) {
  return interactable?.type === 'dock';
}

export function syncEntityPositions(activeMode, vehicle, avatar) {
  const source = activeMode === 'vehicle' ? vehicle.getPosition() : avatar.getPosition();
  vehicle.setPosition(source.x, 0, source.z);
  avatar.setPosition(source.x, 0, source.z);
}
