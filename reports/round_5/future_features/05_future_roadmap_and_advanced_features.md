# Informe: Hoja de Ruta y Características Avanzadas del "Isomorphic Terminal"

## 1. Resumen

La arquitectura del "Isomorphic Terminal" es una base poderosa. Esta hoja de ruta propone una serie de características avanzadas que transformarían el concepto de una simple "demo" a un sistema operativo virtual ligero y persistente en el navegador, demostrando una profundidad técnica aún mayor.

---

## 2. Fase 1: Consolidación y Carga Dinámica

El primer paso es hacer que el sistema sea completamente data-driven.

### A. Manifiesto de Proyectos (`projects.json`)

Se debe formalizar la idea de un manifiesto de proyectos. Este archivo `JSON`, ubicado en la carpeta `public/`, será la única fuente de verdad sobre los proyectos ejecutables.

**`public/projects.json`:**
```json
[
  {
    "id": "cli_project_c",
    "name": "CLI Demo en C",
    "icon": "terminal", // Icono a mostrar en el escritorio 3D
    "description": "Una demostración de una línea de comandos básica.",
    "language": "C",
    "githubUrl": "https://github.com/tu-usuario/mi-cli-en-c",
    "assets": {
      "jsUrl": "/wasm/cli_project/cli_project.js",
      "wasmUrl": "/wasm/cli_project/cli_project.wasm"
    }
  },
  {
    "id": "image_processor",
    "name": "Procesador de Imagen",
    "icon": "image",
    "description": "Un procesador de imágenes básico escrito en C++.",
    "language": "C++",
    "githubUrl": "https://github.com/tu-usuario/procesador-imagen",
    "assets": {
      "jsUrl": "/wasm/image_processor/image_processor.js",
      "wasmUrl": "/wasm/image_processor/image_processor.wasm"
    }
  }
]
```

### B. Renderizado Dinámico del "Escritorio"

El componente 3D principal debería:
1.  Hacer `fetch` de este `projects.json` al montarse.
2.  Renderizar dinámicamente un `ProjectIcon` en la escena 3D por cada entrada en el JSON.
3.  Al hacer clic en un icono, llamaría a `executeProject(projectId)` del store de Zustand.

**Ventaja**: Añadir nuevos proyectos ejecutables no requeriría tocar el código del frontend, solo actualizar el `JSON` y subir los nuevos artefactos Wasm.

---

## 3. Fase 2: Sistema de Archivos Virtual (MEMFS)

Permitir que los programas en C/C++ interactúen con un sistema de archivos.

### A. Precarga de Archivos del Proyecto

Muchos proyectos no son un único archivo `main.c`, sino que leen otros ficheros. Emscripten permite "empaquetar" estos archivos en el sistema de archivos virtual.

**Comando de Compilación (Build Pipeline) Actualizado:**
```bash
emcc main.c -o cli_project.js 
    ... # flags anteriores
    --preload-file src/ # Pre-carga el directorio 'src' en el FS virtual
```

### B. "Explorador de Archivos" en la UI

Se podría añadir una nueva aplicación al escritorio 3D: un "Explorador de Archivos".

-   **Implementación**: Al ejecutar un proyecto Wasm, se podría usar la API del `FS` de Emscripten desde JavaScript para listar los archivos y directorios en la ruta `/` del sistema de archivos virtual (`FS.readdir('/')`).
-   **UI**: Mostrar esta lista en una nueva ventana dentro del PC virtual, simulando un explorador de archivos.

---

## 4. Fase 3: Simulación de Red

Permitir que el código C "haga peticiones a internet".

### A. Puente JavaScript a Wasm

El código C no puede acceder directamente a las APIs del navegador como `fetch`. La solución es crear un "puente": una función JavaScript que el código C pueda invocar.

**1. Declarar la función en C (usando `EM_JS`):**
```c
// en main.c
#include <emscripten.h>

// Esto le dice a C que la función 'js_fetch' existe y está implementada en JS.
EM_JS(void, js_fetch, (const char* url, const char* callback_func_name), {
    const urlStr = UTF8ToString(url);
    const callbackName = UTF8ToString(callback_func_name);

    console.log(`Wasm pide fetch a: ${urlStr}`);

    fetch(urlStr)
        .then(response => response.text())
        .then(text => {
            // Llama a una función C de vuelta con el resultado
            dynCall('vi', Module[callbackName], [stringToNewUTF8(text)]);
        })
        .catch(err => {
            console.error("Error en fetch desde Wasm:", err);
        });
});

// Función C que será el callback
void handle_fetch_result(char* text) {
    printf("Respuesta recibida del servidor:
%s
", text);
}

int main() {
    printf("Pidiendo datos a una API externa...
");
    js_fetch("https://api.github.com/zen", "handle_fetch_result");
    return 0;
}
```

-   `EM_JS`: Macro de Emscripten para definir una función JS inline.
-   `UTF8ToString`: Convierte un puntero de C a un string de JS.
-   `dynCall`: Llama dinámicamente a una función C desde JS, especificando la signatura ('v' para void, 'i' para int, 's' para string).

### B. Consideraciones de Seguridad (CORS)

Las peticiones `fetch` realizadas desde el worker seguirán estando sujetas a las políticas de Cross-Origin Resource Sharing (CORS) del navegador.

---

## 5. Fase 4: Persistencia y "Multitarea"

### A. Persistencia del Sistema de Archivos con IndexedDB

-   **Concepto**: Emscripten puede sincronizar su sistema de archivos en memoria (MEMFS) con el almacenamiento `IndexedDB` del navegador.
-   **Implementación**:
    -   Al compilar, añadir el flag `-s "FORCE_FILESYSTEM=1"`.
    -   Al instanciar el módulo, montar el `IDBFS`: `FS.mount(IDBFS, {}, '/home/web_user');`
    -   Luego, sincronizar explícitamente: `FS.syncfs(true, (err) => { ... });` al cargar, y `FS.syncfs(false, ...)` al guardar.
-   **Resultado**: Un usuario podría crear un archivo (`touch test.txt`) dentro de la terminal, y ese archivo seguiría existiendo si recarga la página.

### B. Arquitectura de "Sistema Operativo" Virtual

-   **Concepto**: Evolucionar el `TerminalManager` a un `OperatingSystemManager`.
-   **Estado Global (Zustand)**: El store necesitaría ser más complejo, gestionando una lista de procesos en ejecución, cada uno con su `worker` y su estado.
    ```typescript
    interface Process {
      pid: number;
      projectId: string;
      worker: Worker;
      status: 'RUNNING' | 'STOPPED';
      windowId: string; // ID de la ventana de UI asociada
    }
    ```
-   **UI de la "Barra de Tareas"**: Un nuevo componente 3D/HTML en la parte inferior de la pantalla que muestre un icono por cada proceso en ejecución, permitiendo al usuario cambiar entre ventanas (traerlas al frente).
-   **Comunicación entre Procesos (IPC)**: Aún más avanzado, se podrían usar `BroadcastChannel` o un `SharedWorker` para permitir que dos módulos Wasm diferentes se comuniquen entre sí, simulando una comunicación entre procesos.

## Conclusión de la Hoja de Ruta

La implementación del "Isomorphic Terminal" es solo el comienzo. Siguiendo esta hoja de ruta, el proyecto puede evolucionar hacia una simulación de un sistema operativo web completo, demostrando no solo la capacidad de ejecutar código compilado, sino también de manejar sistemas de archivos, redes, persistencia y multitarea en el entorno del navegador. Cada fase representa un incremento significativo en complejidad y en el valor del portafolio como pieza de demostración técnica.
