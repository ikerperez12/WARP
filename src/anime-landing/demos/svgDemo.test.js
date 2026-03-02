
import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { setupSvgDemo } from './svgDemo.js';

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
  }

  getTotalLength() {
    return 100;
  }

  getPointAtLength(len) {
    return { x: len, y: len * 2 };
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  addEventListener(event, callback) {
    this.listeners[event] = callback;
  }
}

// Store original globals to restore them later
const originalDocument = global.document;
const originalWindow = global.window;

describe('setupSvgDemo', () => {
  let path, dot, btnDraw, btnMove, btnReset;

  beforeEach(() => {
    // Reset mocks for each test
    path = new MockElement('path', 'demoPath');
    dot = new MockElement('circle', 'demoDot');
    btnDraw = new MockElement('button', 'btnSvgDraw');
    btnMove = new MockElement('button', 'btnSvgMove');
    btnReset = new MockElement('button', 'btnSvgReset');

    global.document = {
      querySelector: (selector) => {
        if (selector === '#demoPath') return path;
        if (selector === '#demoDot') return dot;
        if (selector === '#btnSvgDraw') return btnDraw;
        if (selector === '#btnSvgMove') return btnMove;
        if (selector === '#btnSvgReset') return btnReset;
        return null;
      }
    };

    // Minimal window mock if needed by animejs-v4
    global.window = {};
  });

  afterEach(() => {
    // Restore globals
    if (originalDocument) global.document = originalDocument;
    else delete global.document;

    if (originalWindow) global.window = originalWindow;
    else delete global.window;
  });

  test('should return undefined if path or dot are missing', () => {
    // Override querySelector to return null for path
    global.document.querySelector = (selector) => {
      if (selector === '#demoDot') return dot;
      return null;
    };
    assert.strictEqual(setupSvgDemo(), undefined);

    // Override querySelector to return null for dot
    global.document.querySelector = (selector) => {
      if (selector === '#demoPath') return path;
      return null;
    };
    assert.strictEqual(setupSvgDemo(), undefined);
  });

  test('should set initial styles on path', () => {
    setupSvgDemo();
    // path.getTotalLength returns 100
    assert.strictEqual(path.style.strokeDasharray, '100');
    assert.strictEqual(path.style.strokeDashoffset, '100');
  });

  test('should attach event listeners to buttons', () => {
    const { reset, draw, moveDot } = setupSvgDemo();

    assert.strictEqual(typeof btnDraw.listeners['click'], 'function');
    // The listener attached is the draw function
    // Note: implementation details: setupSvgDemo defines draw internally
    // but returns it. So we can compare references if they are the same function.
    // However, the test environment might wrap functions differently?
    // Let's assume they are the same reference as they are defined in same scope.
    assert.strictEqual(btnDraw.listeners['click'], draw);

    assert.strictEqual(typeof btnMove.listeners['click'], 'function');
    assert.strictEqual(btnMove.listeners['click'], moveDot);

    assert.strictEqual(typeof btnReset.listeners['click'], 'function');
    assert.strictEqual(btnReset.listeners['click'], reset);
  });

  test('reset function should reset styles and attributes', () => {
    const { reset } = setupSvgDemo();

    // Change state manually first
    path.style.strokeDashoffset = '0';
    dot.setAttribute('cx', '999');
    dot.setAttribute('cy', '999');

    reset();

    assert.strictEqual(path.style.strokeDashoffset, '100');
    assert.strictEqual(dot.attributes['cx'], '30');
    assert.strictEqual(dot.attributes['cy'], '120');
  });

  test('draw and moveDot functions should be returned', () => {
    const result = setupSvgDemo();
    assert.ok(result);
    assert.strictEqual(typeof result.draw, 'function');
    assert.strictEqual(typeof result.moveDot, 'function');
    assert.strictEqual(typeof result.reset, 'function');
  });
});
