import test from 'node:test';
import assert from 'node:assert';
import { bindCardHover } from './interactions.js';

test('bindCardHover sets CSS variables on pointermove', () => {
  // Mock card element
  const mockCard = {
    listeners: {},
    addEventListener(event, callback) {
      this.listeners[event] = callback;
    },
    getBoundingClientRect() {
      return { left: 10, top: 20 };
    },
    style: {
      properties: {},
      setProperty(name, value) {
        this.properties[name] = value;
      }
    }
  };

  // Bind hover to the mock card
  bindCardHover([mockCard]);

  // Check if listener was attached
  assert.strictEqual(typeof mockCard.listeners.pointermove, 'function');

  // Simulate pointermove event
  const mockEvent = {
    clientX: 50,
    clientY: 100
  };

  mockCard.listeners.pointermove(mockEvent);

  // x = clientX - rect.left = 50 - 10 = 40
  // y = clientY - rect.top = 100 - 20 = 80
  assert.strictEqual(mockCard.style.properties['--mx'], '40px');
  assert.strictEqual(mockCard.style.properties['--my'], '80px');
});

test('bindCardHover handles multiple cards', () => {
  const cards = [
    {
      listeners: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      getBoundingClientRect() { return { left: 0, top: 0 }; },
      style: { properties: {}, setProperty(name, value) { this.properties[name] = value; } }
    },
    {
      listeners: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      getBoundingClientRect() { return { left: 100, top: 100 }; },
      style: { properties: {}, setProperty(name, value) { this.properties[name] = value; } }
    }
  ];

  bindCardHover(cards);

  cards[0].listeners.pointermove({ clientX: 10, clientY: 20 });
  assert.strictEqual(cards[0].style.properties['--mx'], '10px');
  assert.strictEqual(cards[0].style.properties['--my'], '20px');

  cards[1].listeners.pointermove({ clientX: 110, clientY: 120 });
  assert.strictEqual(cards[1].style.properties['--mx'], '10px');
  assert.strictEqual(cards[1].style.properties['--my'], '20px');
});
