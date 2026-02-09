# Propuesta de Sistema de Diseño Formal

Asumiendo que el proyecto se ha unificado y se busca una mayor consistencia y escalabilidad, este informe propone un Sistema de Diseño formal basado en **Design Tokens**. Este enfoque consiste en centralizar todas las decisiones de diseño (colores, tipografía, espaciado, etc.) en un único lugar, facilitando la consistencia y los cambios globales.

## 1. Design Tokens: La Fuente Única de Verdad

En lugar de usar valores codificados (`#0b0f14`, `18px`) directamente en el CSS, se definen "tokens" que representan esas decisiones.

### A. Paleta de Colores

Se propone una paleta de colores semántica que define el rol de cada color, en lugar de su valor. Esto facilita la creación de temas (como el Light Mode).

**Tokens de Color (Formato CSS / JSON):**
```css
:root {
  /* Tema Oscuro (Actual) */
  --color-background-base: #0b0f14;       /* Color de fondo principal */
  --color-background-surface: #16162a;   /* Color para superficies elevadas (cards) */
  --color-background-muted: #1e1e3a;    /* Para hovers o elementos sutiles */

  --color-text-base: #ffffff;             /* Texto principal */
  --color-text-muted: #a0a0b8;            /* Texto secundario o descriptivo */
  --color-text-inverted: #0b0f14;         /* Texto sobre fondos de acento */

  --color-accent-primary: #b6ff3b;        /* Acento principal (verde) */
  --color-accent-secondary: #7cf7ff;     /* Acento secundario (cyan) */

  --color-border-base: rgba(255, 255, 255, 0.1);
  --color-border-hover: rgba(182, 255, 59, 0.4);
}
```

**Ventaja**: Para crear un tema claro, solo se necesitaría redefinir estas mismas variables dentro de un selector `[data-theme="light"]`, sin tocar el resto del CSS.

### B. Escala Tipográfica y Espaciado

Se propone una escala modular para la tipografía y el espaciado, basada en una unidad raíz (ej. `1rem = 16px`) y múltiplos de un ratio común (ej. `4px`).

**Tokens de Espaciado:**
```css
:root {
  --space-xs: 4px;    /* 0.25rem */
  --space-sm: 8px;    /* 0.5rem */
  --space-md: 16px;   /* 1rem */
  --space-lg: 24px;   /* 1.5rem */
  --space-xl: 32px;   /* 2rem */
  --space-xxl: 64px;  /* 4rem */
}
```

**Tokens de Tamaño de Fuente:**
```css
:root {
  --font-size-xs: 12px;   /* 0.75rem - Labels */
  --font-size-sm: 14px;   /* 0.875rem - Body secondary */
  --font-size-md: 16px;   /* 1rem - Body primary */
  --font-size-lg: 20px;   /* 1.25rem - Sub-headings */
  --font-size-xl: 42px;   /* 2.625rem - Headings */
}
```
**Ventaja**: Asegura un ritmo vertical y horizontal consistente en toda la aplicación, eliminando las decisiones arbitrarias de espaciado o tamaño de fuente.

## 2. Componentes y Variantes

Con los tokens definidos, se pueden estandarizar los componentes.

### Ejemplo: Componente `Button`

En lugar de clases como `.btn.primary`, se pueden definir atributos que se mapean a los tokens.

**HTML con enfoque de sistema de diseño:**
```html
<button class="btn" data-variant="primary" data-size="medium">Play Intro</button>
<button class="btn" data-variant="secondary" data-size="medium">Burst</button>
```

**CSS utilizando los tokens:**
```css
.btn {
  /* Estilos base */
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-md);
  border-radius: var(--radius);
  border: 1px solid transparent;
  cursor: pointer;
}

/* Variante Primaria */
.btn[data-variant="primary"] {
  background-color: var(--color-accent-primary);
  color: var(--color-text-inverted);
}

/* Variante Secundaria */
.btn[data-variant="secondary"] {
  background-color: transparent;
  color: var(--color-text-base);
  border-color: var(--color-border-base);
}

.btn[data-variant="secondary"]:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-background-muted);
}
```

## 3. Refinamiento de la Interacción y Animación

Ahora que las bases son sólidas, se pueden refinar las interacciones.

### A. "Choreography" de Animación

- **Problema Actual**: Las duraciones y easings de las animaciones están codificados en cada llamada a `animate()`.
- **Propuesta**: Crear tokens de animación.
    ```css
    :root {
      --anim-duration-fast: 180ms;
      --anim-duration-medium: 350ms;
      --anim-duration-slow: 600ms;

      --anim-ease-out: cubic-bezier(0.25, 1, 0.5, 1);
      --anim-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    }
    ```
    Estos valores se pueden leer con JavaScript y pasar a `anime.js`, centralizando el "feeling" de la interfaz.

### B. Micro-interacciones y Feedback

- **Propuesta**: Enriquecer el feedback al usuario.
    - **Hover en Cards**: Además del `translateY`, se podría añadir una sutil iluminación que siga al puntero del ratón dentro de la tarjeta, usando un `radial-gradient` en el `background`.
    - **Click en Botones**: Implementar una animación de "ripple" (onda) que se origine en el punto del click para dar una sensación más táctil.
    - **Transiciones de Estado**: Al cambiar de tema (Dark/Light), en lugar de un cambio instantáneo, aplicar una transición suave a los colores de fondo y texto con `transition: background-color 250ms ease, color 250ms ease;`.

## 4. Evolución de la Arquitectura de UI

- **De Módulos a Componentes**: El paso natural es evolucionar la actual estructura modular (`ui/cards.js`, `ui/dom.js`) a una arquitectura de componentes más formal.
- **Propuesta**: Adoptar una librería como **Lit** o un framework como **Svelte/React**.
    - **Lit**: Permitiría encapsular cada pieza de la UI (como una tarjeta o un botón) en su propio Web Component, con su HTML, CSS y JS aislados, pero sin la complejidad de un framework completo.
    - **Svelte/React**: Si se prevé una mayor complejidad futura (gestión de estado más avanzada, routing), migrar a un framework completo sería la mejor inversión a largo plazo. La estructura actual del proyecto `anime-landing` facilitaría enormemente esta migración.

## Conclusión

La implementación de un sistema de diseño formal basado en **tokens** es el siguiente paso lógico para madurar el proyecto. Aportará **consistencia, mantenibilidad y escalabilidad**, a la vez que sentará las bases para futuras mejoras en la experiencia de usuario y la arquitectura de la interfaz.
