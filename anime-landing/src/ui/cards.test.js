import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { mountCards } from './cards.js';

/**
 * Minimal DOM mock for Node.js environment where JSDOM is unavailable.
 * Supports basic element creation, fragment handling, and content/class assignment.
 */
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.textContent = '';
    this.children = [];
    // Basic classList mock
    this.classList = {
      add: (cls) => { this.className += (this.className ? ' ' : '') + cls; },
      remove: (cls) => { this.className = this.className.replace(cls, '').trim(); },
      contains: (cls) => this.className.includes(cls)
    };
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    if (node.tagName === 'FRAGMENT') {
      this.children.push(...node.children);
      node.children = [];
    } else {
      this.children.push(node);
    }
    return node;
  }

  replaceChildren() {
    this.children = [];
  }
}

global.document = {
  createElement: (tag) => new MockElement(tag),
  createDocumentFragment: () => new MockElement('FRAGMENT')
};

describe('mountCards', () => {
  let container;

  beforeEach(() => {
    container = new MockElement('DIV');
  });

  test('should clear the container before mounting', () => {
    container.children.push(new MockElement('SPAN'));
    assert.strictEqual(container.children.length, 1);

    mountCards(container);

    // Total 4 cards should be there, and the previous SPAN should be gone
    assert.strictEqual(container.children.length, 4);
    assert.ok(container.children.every(child => child.className === 'card'));
  });

  test('should mount exactly 4 cards', () => {
    mountCards(container);
    assert.strictEqual(container.children.length, 4);
  });

  test('each card should have correct structure and classes', () => {
    mountCards(container);

    container.children.forEach(card => {
      assert.strictEqual(card.tagName, 'DIV');
      assert.strictEqual(card.className, 'card');
      assert.strictEqual(card.children.length, 3);

      const [chip, title, body] = card.children;
      assert.strictEqual(chip.className, 'card-chip');
      assert.strictEqual(title.className, 'card-title');
      assert.strictEqual(body.className, 'card-body');
    });
  });

  test('cards should have correct content', () => {
    mountCards(container);

    const expectedContent = [
      { title: "Intro timeline", body: "Secuencia de entrada (3D + UI) sincronizada.", chip: "TL" },
      { title: "Loop 3D", body: "Rotacion + respiracion + shimmer particulas.", chip: "3D" },
      { title: "Pointer parallax", body: "Respuesta suave a mouse/touch.", chip: "UX" },
      { title: "Scroll-driven", body: "Scroll controla intensidad y animaciones.", chip: "SCR" },
    ];

    container.children.forEach((card, index) => {
      const [chip, title, body] = card.children;
      assert.strictEqual(chip.textContent, expectedContent[index].chip);
      assert.strictEqual(title.textContent, expectedContent[index].title);
      assert.strictEqual(body.textContent, expectedContent[index].body);
    });
  });
});
