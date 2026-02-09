# Informe: Refinamiento de la Arquitectura "Isomorphic Terminal"

## 1. Resumen Ejecutivo

La arquitectura propuesta es **excelente, innovadora y técnicamente sólida**. La decisión de usar WebAssembly (Wasm) pre-compilado con Emscripten es la solución óptima para ejecutar proyectos de C/C++ en el navegador de forma segura, performante y sin costes de servidor. El uso de `xterm.js` y un `Adapter` para la lógica de negocio son también decisiones acertadas.

Este informe no busca reemplazar, sino **refinar y fortalecer** dicha arquitectura, enfocándose en la gestión del estado, la comunicación entre componentes y la resiliencia del sistema a medida que escala para soportar múltiples proyectos.

---

## 2. Gestión de Estado Centralizada con Zustand

### Problema

La propuesta actual maneja el estado implícitamente dentro de los componentes de React (`useRef`, `useEffect`). A medida que se añadan más "ordenadores" o proyectos, o si se desea un estado global (ej. saber qué proyecto se está ejecutando desde otra parte de la UI), esta gestión local se vuelve insuficiente y compleja.

### Solución Propuesta

Adoptar una librería de gestión de estado global mínima como **Zustand**.

-   **¿Por qué Zustand?** Es extremadamente ligera, no requiere "providers" que envuelvan la aplicación, y su API es muy simple y basada en hooks.

**Ejemplo de un "Store" de Zustand:**

```typescript
// src/stores/terminalStore.ts
import create from 'zustand';

// Definir los estados posibles del terminal
type TerminalStatus = 'IDLE' | 'LOADING' | 'RUNNING' | 'ERROR';

// Definir la forma del estado
interface TerminalState {
  status: TerminalStatus;
  activeProject: string | null;
  errorMessage: string | null;
  // Acción para iniciar la ejecución de un proyecto
  executeProject: (projectId: string) => void;
  // Acciones para actualizar el estado
  setStatus: (status: TerminalStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
}

// Crear el store
export const useTerminalStore = create<TerminalState>((set) => ({
  status: 'IDLE',
  activeProject: null,
  errorMessage: null,
  executeProject: (projectId) => set({ activeProject: projectId, status: 'LOADING' }),
  setStatus: (status) => set({ status }),
  setError: (message) => set({ status: 'ERROR', errorMessage: message }),
  reset: () => set({ status: 'IDLE', activeProject: null, errorMessage: null }),
}));
```

**Ventajas:**
-   **Estado Desacoplado**: El estado de la aplicación vive fuera de los componentes de React.
-   **Acceso Global**: Cualquier componente puede acceder y reaccionar a los cambios de estado (`const status = useTerminalStore(state => state.status);`).
-   **Comunicación Simplificada**: La comunicación entre componentes (ej. un click en un icono 3D y la reacción en la terminal) se simplifica a través del store.

---

## 3. Comunicación Robusta entre Componentes

### Problema

¿Cómo un evento en la escena 3D (ej. `onClick` en un `mesh`) le dice al `TerminalManager` que debe ejecutarse?

### Solución Propuesta

Usar el store de Zustand como un **bus de eventos simplificado**.

1.  **Componente del Icono del Proyecto (en 3D):**
    ```jsx
    import { useTerminalStore } from './stores/terminalStore';

    const ProjectIcon = ({ projectId }) => {
      const executeProject = useTerminalStore(state => state.executeProject);

      return (
        <mesh onClick={() => executeProject(projectId)}>
          {/* Geometría y material del icono */}
        </mesh>
      );
    };
    ```

2.  **Componente `MonitorScreen`:**
    -   Este componente escucharía los cambios en `activeProject` del store. Cuando `activeProject` cambia, su `useEffect` se activaría para lanzar el `WasmProjectAdapter`.

    ```jsx
    import { useTerminalStore } from './stores/terminalStore';

    export const MonitorScreen = () => {
        const { activeProject, setStatus, setError, reset } = useTerminalStore();
        // ...
        useEffect(() => {
            if (!activeProject) {
                term.clear();
                return;
            }

            const projectConfig = projectManifest[activeProject]; // Obtener config del proyecto
            if (!projectConfig) {
                setError(`Proyecto '${activeProject}' no encontrado.`);
                return;
            }

            const executor = new WasmProjectAdapter(projectConfig.jsUrl, projectConfig.wasmUrl);
            executor.run(term)
                .then(() => setStatus('IDLE')) // O 'RUNNING' si es interactivo
                .catch((err) => setError(err.message));

        }, [activeProject]); // Se ejecuta solo cuando cambia el proyecto activo

        // ...
    };
    ```

---

## 4. Aislamiento y Resiliencia con Web Workers

### Problema

Su propuesta menciona correctamente que ejecutar Wasm en el hilo principal puede bloquear la UI. La solución es un **Web Worker**, pero la comunicación y la resiliencia son clave.

### Solución Propuesta

Refinar el `WasmProjectAdapter` para que toda la lógica de Emscripten se ejecute dentro de un Web Worker.

1.  **El Worker (`wasm.worker.ts`):**
    -   Este archivo contendrá la lógica de cargar el script de Emscripten y ejecutar el módulo.
    -   Escuchará mensajes del hilo principal (ej. `START_EXECUTION`) y enviará mensajes de vuelta (`PRINT`, `PRINT_ERR`, `EXECUTION_COMPLETE`).

2.  **`TerminalManager` (Adaptador del Worker):**
    -   El `WasmProjectAdapter` en el hilo principal ya no cargará el script directamente. En su lugar, instanciará el worker y se comunicará con él.
    -   Esto proporciona un **aislamiento completo**. Si el Wasm entra en un bucle infinito o se bloquea, solo afectará al worker. El hilo principal puede detectarlo (si el worker deja de responder) y **terminarlo (`worker.terminate()`)**, mostrando un error en `xterm.js` sin bloquear la UI.

**Diagrama de Flujo:**

```mermaid
graph TD
    A[Hilo Principal: React Component] -- executeProject('cli') --> B[Hilo Principal: TerminalManager];
    B -- postMessage({ type: 'START', payload: config }) --> C[Web Worker];
    C -- Carga Emscripten y Módulo Wasm --> D[Ejecución de main()];
    D -- print(stdout) --> E[Redirección de Salida];
    E -- postMessage({ type: 'PRINT', payload: '...' }) --> B;
    B -- term.writeln('...') --> F[Hilo Principal: xterm.js];
```

---

## 5. Abstracción y Escalabilidad

### `ProjectRegistry` (Manifiesto de Proyectos)

Su propuesta es excelente. Para formalizarla, se recomienda un archivo `JSON` estático que actúe como un registro de todos los proyectos ejecutables.

**`public/projects.json`:**

```json
{
  "cli_project_c": {
    "name": "CLI Demo en C",
    "description": "Una demostración de una línea de comandos básica.",
    "language": "C",
    "assets": {
      "jsUrl": "/wasm/cli_project.js",
      "wasmUrl": "/wasm/cli_project.wasm"
    }
  },
  "another_project": {
    "name": "Otro Proyecto",
    "description": "...",
    "language": "C++",
    "assets": {
      // ...
    }
  }
}
```

La aplicación principal cargaría este `JSON` al inicio para saber qué "iconos" de escritorio mostrar y qué assets cargar para cada uno. Añadir un nuevo proyecto solo requeriría:
1.  Compilarlo a Wasm en el pipeline de CI/CD.
2.  Añadir su entrada a este `projects.json`.
3.  Añadir un nuevo `mesh` en la escena 3D para representarlo.

**No sería necesario modificar la lógica del `TerminalManager`.**

## Conclusión

La arquitectura propuesta es un punto de partida de nivel experto. Al añadir una capa de **gestión de estado global (Zustand)**, formalizar la **comunicación entre componentes** y garantizar la **resiliencia mediante Web Workers**, el sistema "Isomorphic Terminal" se convertirá en una plataforma robusta, escalable y mantenible, lista para soportar un portafolio de proyectos cada vez más complejo e impresionante.
