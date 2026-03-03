import './style/main.css';
import Application from './javascript/Application.js';

const canvas = document.querySelector('.js-canvas');

if (canvas) {
  const app = new Application({
    $canvas: canvas,
    useComposer: true,
  });

  window.warpFolioApp = app;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__warpFolioApp = app;
  }
}
