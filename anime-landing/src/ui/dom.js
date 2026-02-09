export function $(sel) {
  return document.querySelector(sel);
}

export function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}
