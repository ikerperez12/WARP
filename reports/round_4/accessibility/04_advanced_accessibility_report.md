# Informe: Estrategias Avanzadas de Accesibilidad (WCAG 2.2)

## Resumen

Asumiendo que las mejoras de accesibilidad básicas, como los estados de foco visibles, ya se han implementado, este informe profundiza en la conformidad con las WCAG 2.2 (Web Content Accessibility Guidelines) y propone estrategias avanzadas para garantizar que el portafolio sea utilizable por el mayor número posible de personas, incluyendo aquellos con discapacidades.

---

## 1. Cumplimiento WCAG 2.2 - Más Allá de lo Básico

WCAG 2.2 introduce nuevos criterios. La auditoría se centrará en los principios existentes y los nuevos énfasis.

### A. Perceptible

-   **Alternativas Textuales (WCAG 1.1)**:
    -   **Problema**: Aunque no hay imágenes `<img>` en el HTML, los placeholders de proyectos y otros elementos visuales podrían carecer de contexto textual para usuarios de lectores de pantalla. La escena 3D en sí misma no tiene una alternativa textual por defecto.
    -   **Recomendación**:
        -   Para los placeholders, usar `aria-hidden="true"` si son puramente decorativos y proporcionar la información del proyecto de forma textual.
        -   Para la escena 3D, considerar añadir un `aria-label` descriptivo al `<canvas>` y/o una descripción textual que se pueda expandir (`aria-details`). Para el futuro "Customizador del Orbe", se necesitará un texto alternativo y controles accesibles.
-   **Contenido No Textual Adaptable (WCAG 1.3)**:
    -   Asegurar que la estructura del DOM refleje el orden visual y de lectura. Usar HTML semántico siempre que sea posible.
    -   Para las barras de progreso (`.skill-bar-fill`), usar `role="progressbar"` y `aria-valuenow`, `aria-valuemin`, `aria-valuemax` para comunicar el progreso a los lectores de pantalla.

### B. Operable

-   **Navegable (WCAG 2.1.1)**:
    -   **Problema**: La navegación actual con teclado es lineal. Los usuarios podrían querer saltar directamente al contenido principal o a otras secciones.
    -   **Recomendación**: Implementar un **"skip link"** (enlace para saltar al contenido principal) al inicio del `<body>` para usuarios de teclado.
        ```html
        <body>
          <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
          <main id="main-content">...</main>
        </body>
        ```
-   **Atajos de Teclado (WCAG 2.1.4)**:
    -   Si se implementan atajos de teclado personalizados para la escena 3D o el customizador, asegurarse de que no interfieren con los atajos nativos del navegador y que pueden ser reconfigurados o deshabilitados.
-   **Tiempo de Inactividad (WCAG 2.2.1)**:
    -   Asegurarse de que no haya límites de tiempo innecesarios para las interacciones del usuario. Si alguna interacción (ej. animación intro) tiene un límite de tiempo, proporcionar un mecanismo para extenderlo.

### C. Comprensible

-   **Legible (WCAG 3.1)**:
    -   **Idioma**: El `lang="es"` ya está correcto.
    -   **Cambios de Idioma**: Si se implementa un switcher de idioma, usar `lang` en el atributo del elemento que cambie de idioma.
-   **Predecible (WCAG 3.2)**:
    -   **Navegación Consistente**: La navegación ya es consistente. Asegurarse de que los cambios de tema o las interacciones con el customizador 3D no causen cambios de contexto inesperados.
-   **Asistencia a la Entrada (WCAG 3.3)**:
    -   **Formulario de Contacto**:
        -   **Problema**: Los `placeholder` no son sustitutos de las `label` para la accesibilidad.
        -   **Recomendación**: Asegurar que cada `input` y `textarea` tiene un elemento `<label>` asociado explícitamente (`<label for="id_del_input">`). Usar `aria-describedby` si hay mensajes de ayuda o error.
        -   **Validación**: Proporcionar feedback de validación claro y accesible (visible y anunciado por lector de pantalla) cuando un campo es inválido. Usar `aria-invalid="true"` en el campo inválido.

### D. Robusto

-   **Compatibilidad (WCAG 4.1)**:
    -   Asegurar que el HTML generado sea válido y que los componentes de la interfaz de usuario tengan nombre, rol y valor accesibles.

---

## 2. Roles ARIA y Semántica Avanzada

### A. Mobile Menu

-   **Problema**: El menú móvil es una interacción compleja.
-   **Recomendación**:
    -   El botón de toggle (`#nav-toggle`) debería tener `role="button"`, `aria-expanded="false/true"` (según el estado del menú) y `aria-controls="mobile-menu"`.
    -   El menú móvil (`#mobile-menu`) debería tener `role="dialog"` o `role="menu"` dependiendo de su complejidad, y `aria-labelledby` apuntando al botón de toggle si actúa como un diálogo modal.

### B. Estadísticas Animadas

-   **Problema**: Los contadores animados (`.stat-number`) que incrementan de 0 a un `data-target` no se anunciarían de forma dinámica a un lector de pantalla.
-   **Recomendación**: Usar una región `aria-live` para anunciar los cambios de valor.
    ```html
    <div class="stat">
      <span class="stat-number" data-target="4" aria-live="polite">0</span>
      <span class="stat-plus">º</span>
      <span class="stat-label">Año de carrera</span>
    </div>
    ```
    (El `aria-live="polite"` le dice al lector de pantalla que anuncie los cambios de forma no intrusiva).

### C. Escena 3D Interactiva

Este es el mayor desafío en accesibilidad.

-   **Alternativa Textual**: Proporcionar una descripción textual detallada del orbe 3D y su comportamiento, quizás en un `div` oculto visualmente pero accesible para lectores de pantalla.
-   **Controles Accesibles**: Si se implementa un customizador, asegurarse de que todos los controles (sliders, botones, selectores de color) sean accesibles por teclado, tengan etiquetas claras (`<label>` o `aria-label`) y comuniquen su estado y valor actual a los lectores de pantalla.
-   **Deshabilitar 3D**: Proporcionar una opción clara y fácil de encontrar para deshabilitar la experiencia 3D por completo, mostrando una alternativa estática o una versión simplificada.

---

## 3. Implementación de `prefers-reduced-motion`

Es vital respetar la preferencia del usuario para reducir las animaciones.

```css
/* En el CSS */
@media (prefers-reduced-motion: reduce) {
  /* Desactivar transiciones y animaciones complejas */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Para animaciones JS, usar un check en JavaScript */
}
```

```javascript
// En JavaScript (en main.js o donde se inicialicen las animaciones)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Deshabilitar animaciones complejas de anime.js o Three.js
  // Por ejemplo, no ejecutar introTL.play()
  // Establecer duraciones de animación a 0 o muy pequeñas
  // Mostrar estados finales de forma instantánea
}
```
**Estrategia**: Crear una versión simplificada de la UI y la escena 3D, sin parallax, sin loops complejos y sin animaciones de entrada llamativas, para usuarios que activen esta preferencia.

---

## Conclusión

Al abordar estos puntos de accesibilidad avanzada, el portafolio no solo cumplirá con los estándares WCAG 2.2, sino que también demostrará un compromiso con la inclusión. Esto no solo es ético y legal, sino que también amplía la audiencia potencial y mejora la percepción profesional del desarrollador. La clave es pensar en la experiencia de usuario para *todas* las personas, no solo para la mayoría.
