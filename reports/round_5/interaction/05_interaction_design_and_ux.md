# Informe: Diseño de Interacción y UX para el "Isomorphic Terminal"

## 1. Resumen

Una característica tan potente como un ordenador virtual 3D debe ir acompañada de una experiencia de usuario (UX) impecable. La interacción debe ser intuitiva, el feedback claro y la experiencia general fluida y sin fricciones. Este informe detalla patrones de diseño para lograrlo.

---

## 2. Gestión de la Ventana del Terminal

La ventana del terminal no es solo un `div`; es el portal a la experiencia interactiva. Su comportamiento debe ser familiar y predecible.

### A. Diseño Visual de la Ventana

-   **Apariencia**: Un diseño "glassmorphism" o de "cristal esmerilado", utilizando `backdrop-filter: blur(10px)` y un fondo `rgba(0, 0, 0, 0.4)`, permitirá que la escena 3D de fondo se vislumbre, integrando la UI con el entorno 3D.
-   **Barra de Título**: La ventana debe tener una barra de título que muestre el nombre del proyecto en ejecución (ej. `[main.c] - Simulador CLI v1.0`) y los controles estándar de ventana.
-   **Controles de Ventana**: Implementar los tres iconos universales:
    -   **Minimizar**: Anima la ventana a una pequeña pestaña en una "barra de tareas" virtual en la parte inferior de la pantalla 3D.
    -   **Maximizar/Restaurar**: Expande la ventana para ocupar una mayor parte de la vista o la devuelve a su tamaño original.
    -   **Cerrar**: Cierra la terminal y termina el proceso del Web Worker asociado.

### B. Animaciones de Ventana

Las animaciones deben ser rápidas y con propósito, siguiendo los principios de `(perceptible, no molesto)`.

-   **Apertura**: La ventana podría "aparecer" escalando desde el icono 3D en el que se hizo clic, con una animación de `ease-out`. `(duración: 300ms)`
-   **Cierre**: La ventana se encoge y se desvanece hacia el icono del que provino.
-   **Arrastre (Drag)**: El arrastre de la ventana debe ser fluido. Mientras se arrastra, se puede añadir una sutil inclinación a la ventana en la dirección del movimiento para dar una sensación más física.

---

## 3. Estados de Carga y Secuencia de "Arranque"

Una pantalla de carga bien diseñada convierte un tiempo de espera en parte de la experiencia.

### A. Estado de Carga en la Terminal

Cuando el usuario hace clic para ejecutar un proyecto, la terminal no debe estar vacía mientras se descarga el `.wasm`. Debe mostrar una secuencia de "arranque" (boot sequence).

**Propuesta de Secuencia de Arranque (texto a mostrar en `xterm.js`):**

1.  Al abrir, la terminal muestra:
    ```
    WARP OS v1.0 Inicializando...
    Estableciendo entorno virtual...
    ```
2.  Mientras se descarga el Wasm (detectado por el `TerminalManager`):
    ```
    Descargando binario [cli_project.wasm] (1.2 MB)... [■■■■■■■■■■] 100%
    Verificando integridad del paquete... OK
    ```
3.  Mientras se compila/instancia el Wasm:
    ```
    Compilando módulo WebAssembly...
    Montando sistema de archivos virtual (MEMFS)...
    Enlazando I/O...
    ```
4.  Justo antes de ejecutar `callMain()`:
    ```
    Entorno listo.
    \x1b[32mEjecutando proyecto: 'CLI Demo en C'...\x1b[0m

    ----------------------------------------------------
    ```
    (Y a continuación, la salida del programa en C).

### B. Estado Inactivo (Idle)

Cuando no se está ejecutando ningún proyecto, la terminal debería mostrar un mensaje de bienvenida y un prompt, invitando a la interacción.

```
WARP OS v1.0
Bienvenido al portafolio interactivo de Iker Pérez.
Haga clic en un icono de proyecto en el escritorio para ejecutarlo.

$ _
```

---

## 4. Gestión del Foco de Entrada (Focus Management)

Este es el desafío de UX más crítico: evitar el conflicto entre los controles de la cámara 3D y la entrada de texto en la terminal.

### Solución: Un Hook de React `useFocusTrap`

Se puede crear un custom hook en React para manejar esta lógica de forma reutilizable.

```jsx
// hooks/useFocusTrap.js
import { useEffect, useRef } from 'react';

export const useFocusTrap = (orbitControlsRef) => {
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    const controls = orbitControlsRef.current;
    const container = terminalContainerRef.current;
    if (!controls || !container) return;

    const handlePointerEnter = () => {
      // Desactivar controles de cámara cuando el ratón entra en la terminal
      controls.enabled = false;
    };

    const handlePointerLeave = () => {
      // Reactivar controles de cámara cuando el ratón sale
      controls.enabled = true;
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      // Asegurarse de reactivar los controles al desmontar
      controls.enabled = true;
    };
  }, [orbitControlsRef]);

  return terminalContainerRef; // Devolver la ref para asignarla al div
};

// Uso en el componente MonitorScreen
const My3DScene = () => {
  const orbitControls = useRef(); // Ref para los OrbitControls
  // ...
  return (
    <>
      <OrbitControls ref={orbitControls} />
      <MonitorScreen projectConfig={...} orbitControlsRef={orbitControls} />
    </>
  );
}

const MonitorScreen = ({ projectConfig, orbitControlsRef }) => {
  const terminalContainerRef = useFocusTrap(orbitControlsRef);
  // ...
  return (
    <Html>
      <div ref={terminalContainerRef} onPointerDown={(e) => e.stopPropagation()}>
        {/* Aquí va el div donde se monta xterm.js */}
      </div>
    </Html>
  );
}
```

-   **`onPointerDown={(e) => e.stopPropagation()}`**: Esta línea, que usted ya incluyó, es **esencial**. Previene que un click dentro del `Html` de Drei se propague a los controles de la cámara, evitando que la cámara se mueva al hacer clic en la terminal.

---

## 5. Mejoras de Accesibilidad

### Alternativa 2D a la Interacción 3D

-   **Problema**: Un usuario que navega con teclado o lector de pantalla no puede "hacer clic" en un icono 3D.
-   **Solución**: Ofrecer un modo de "lista" accesible.
    -   **Activación**: Un botón "Ver proyectos en modo lista" al principio de la página, o un atajo de teclado.
    -   **Interfaz**: Al activarse, se mostraría un `div` modal o una sección con una lista de botones estándar (`<button>`), uno por cada proyecto. Cada botón tendría el nombre del proyecto.
    -   **Funcionalidad**: Al hacer clic en un botón de la lista, se dispararía la misma acción que al hacer clic en el icono 3D (`executeProject(projectId)` del store de Zustand).

### Anuncios para Lectores de Pantalla

-   **Regiones `aria-live`**: El contenedor de la terminal debería ser una región "live" para que los lectores de pantalla anuncien el contenido a medida que aparece.
    ```html
    <div ref={containerRef} role="log" aria-live="polite" aria-atomic="false"></div>
    ```
    -   `role="log"`: Indica que es un log donde las nuevas entradas aparecen al final.
    -   `aria-live="polite"`: Anuncia los cambios sin interrumpir al usuario.
-   **Anuncio de Estados**: Usar una región `aria-live` separada (y oculta visualmente) para anunciar cambios de estado importantes, como "Cargando proyecto...", "Ejecución completada", "Error".

## Conclusión

Una interfaz 3D tan compleja solo puede tener éxito si su UX es absolutamente fluida. Al diseñar cuidadosamente la gestión de ventanas, los estados de carga, el manejo del foco y, sobre todo, al proporcionar una alternativa accesible, la característica del "Isomorphic Terminal" pasará de ser una proeza técnica a una experiencia de usuario memorable, inclusiva y verdaderamente profesional.
