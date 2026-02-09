# Propuesta de Estrategia de Testing

## Resumen

Para asegurar la calidad, robustez y mantenibilidad del proyecto, es fundamental adoptar una estrategia de testing multi-capa. Dado que el proyecto es altamente visual e interactivo, la estrategia debe cubrir no solo la lógica de negocio, sino también la integridad visual y la experiencia de usuario de principio a fin.

Se recomienda **Vitest** como framework principal por su integración nativa con Vite, su alta velocidad y su API compatible con Jest.

---

## 1. Pirámide de Testing Propuesta

Se propone una estrategia basada en la clásica pirámide de testing, adaptada a un proyecto de frontend moderno:

1.  **Tests Unitarios (Base de la pirámide)**: Rápidos y numerosos. Verifican que las piezas más pequeñas y aisladas de la lógica (funciones puras) funcionen correctamente.
2.  **Tests de Integración/Componentes (Medio)**: Verifican que varios módulos o componentes funcionen bien juntos. En este proyecto, esto incluye probar la interacción entre la UI y el estado de la escena 3D.
3.  **Tests End-to-End (E2E) (Cima de la pirámide)**: Lentos y pocos. Simulan el flujo completo de un usuario real en un navegador real para verificar que la aplicación se comporta como se espera desde la perspectiva del usuario.

---

## 2. Tests Unitarios

- **Herramienta**: `Vitest`
- **Objetivo**: Probar funciones puras y lógica de negocio aislada.
- **Candidatos para Tests Unitarios**:
    - Funciones de utilidad (ej. `clamp01` en `scroll.js`).
    - Lógica de cálculo de animaciones.
    - Funciones que preparan los datos para la UI (ej. `mountCards`).

### Ejemplo: Test Unitario para `clamp01`

```javascript
// en anime-landing/src/anim/scroll.test.js

import { describe, it, expect } from 'vitest';

// Asumimos que clamp01 se exporta para poder ser probada
function clamp01(v) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

describe('clamp01', () => {
  it('debería retornar 0 si el valor es negativo', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(-100)).toBe(0);
  });

  it('debería retornar 1 si el valor es mayor que 1', () => {
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(100)).toBe(1);
  });

  it('debería retornar el mismo valor si está entre 0 y 1', () => {
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(1)).toBe(1);
  });
});
```

---

## 3. Tests de Integración

- **Herramienta**: `Vitest` con `jsdom` (para simular el DOM).
- **Objetivo**: Probar la interacción entre diferentes partes del sistema. El caso de uso principal aquí es verificar que las interacciones de la UI (ej. clicks, scroll) modifican correctamente el estado de la aplicación y, por extensión, la escena 3D.

### Ejemplo: Test de Integración para el "Orb Customizer"

Este test no renderizará la escena 3D, sino que verificará que la lógica de negocio que conecta la UI con el estado funciona.

```javascript
// en anime-landing/src/main.integration.test.js

import { describe, it, expect, vi } from 'vitest';
import GUI from 'lil-gui';

// Mockear el módulo de la escena 3D
vi.mock('./three/objects.js', () => ({
  addOrb: () => ({
    coreMat: { emissive: { set: vi.fn() } },
    // ... otros mocks
  }),
}));

describe('Personalizador del Orbe', () => {
  it('debería actualizar el color del núcleo cuando el usuario interactúa con la GUI', () => {
    const { addOrb } = await import('./three/objects.js');
    const orb = addOrb();
    const gui = new GUI();

    const orbConfig = { coreColor: '#000000' };

    // Añadir el control a la GUI
    gui.addColor(orbConfig, 'coreColor').onChange(value => {
      orb.coreMat.emissive.set(value);
    });

    // Simular el cambio de valor en la GUI
    const controller = gui.controllers[0];
    controller.setValue('#ff0000');

    // Verificación
    // Comprobamos si la función que actualiza el material en Three.js fue llamada con el nuevo color.
    expect(orb.coreMat.emissive.set).toHaveBeenCalledWith('#ff0000');
  });
});
```

---

## 4. Tests End-to-End (E2E)

- **Herramienta Recomendada**: **Playwright** (o Cypress).
- **Objetivo**: Simular un flujo de usuario completo en un navegador real, validando la experiencia final.

### Ejemplo: Flujo de E2E con Playwright

```javascript
// en e2e/smoke.spec.js

import { test, expect } from '@playwright/test';

test.describe('Flujo principal de la Landing Page', () => {
  test('la animación de "burst" debería cambiar la escena', async ({ page }) => {
    // 1. Navegar a la página
    await page.goto('/');

    // 2. Esperar a que la intro termine (ej. esperando que un elemento sea visible)
    await expect(page.locator('.cta-row')).toBeVisible({ timeout: 5000 });

    // 3. Tomar una captura de pantalla del estado inicial
    await expect(page).toHaveScreenshot('initial-state.png');

    // 4. Hacer click en el botón "Burst"
    await page.click('#btnBurst');

    // 5. Esperar a que la animación de "burst" ocurra (una espera corta)
    await page.waitForTimeout(300);

    // 6. Tomar una captura final y compararla
    // Playwright puede comparar screenshots automáticamente.
    // Si la nueva captura es diferente a la de referencia, el test pasa.
    // Si es idéntica, significa que el botón no tuvo efecto visual y el test falla.
    await expect(page).not.toHaveScreenshot('initial-state.png');
  });
});
```

## 5. Tests de Regresión Visual

- **Herramienta Recomendada**: **Storybook** para aislar componentes de UI + un servicio como **Chromatic** o **Percy** para la comparación de screenshots.
- **Objetivo**: Para un proyecto tan visual, es crucial detectar cambios visuales no deseados (regresiones).
- **Estrategia**:
    1. **Crear "Stories"**: Para cada componente visual (ej. las tarjetas, los botones con sus diferentes estados), se crea un archivo "story" que lo renderiza en un entorno aislado (Storybook).
    2. **Generar Snapshots**: Se configura un servicio (ej. Chromatic) para que, en cada push al repositorio, renderice todas las stories y tome una captura de pantalla de cada una.
    3. **Comparar y Aprobar**: El servicio compara las nuevas capturas con las de la versión anterior. Si detecta diferencias, un desarrollador debe revisarlas y aprobarlas si son intencionadas, o corregir el código si son un bug.

## Conclusión

Implementar esta estrategia de testing multi-capa proporcionará una red de seguridad robusta. Los tests unitarios y de integración asegurarán la lógica, mientras que los tests E2E y de regresión visual garantizarán que la experiencia del usuario final se mantenga intacta y con la alta calidad visual que la caracteriza. Es fundamental integrar la ejecución de estos tests en un pipeline de CI/CD para automatizar el proceso.
