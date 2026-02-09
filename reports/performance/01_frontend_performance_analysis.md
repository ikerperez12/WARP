# Informe de Rendimiento Frontend

## Resumen General

El análisis de rendimiento revela una gran diferencia entre los dos proyectos. El proyecto `anime-landing` está construido sobre una base moderna y de alto rendimiento gracias a **Vite**, mientras que el proyecto en el directorio raíz carece de un proceso de construcción, lo que resulta en un rendimiento deficiente.

## Análisis del Proyecto `anime-landing`

Este proyecto tiene una base de rendimiento muy sólida.

### Prácticas Positivas

1.  **Herramienta de Build Moderna (Vite)**: Vite es una de las herramientas más rápidas para el desarrollo frontend. Ofrece optimizaciones clave de serie para producción:
    *   **Tree-shaking**: Elimina el código no utilizado de las dependencias (muy importante para librerías grandes como `three.js`).
    *   **Code Splitting**: Divide el código en trozos más pequeños que se cargan según sea necesario.
    *   **Minificación**: Reduce el tamaño de los archivos JS y CSS.
2.  **Carga de JavaScript No Bloqueante**: El script principal se carga con `type="module"` al final del `<body>`, lo que asegura que el HTML se parsea y renderiza antes de que el JavaScript comience a ejecutarse.
3.  **Estructura HTML Mínima**: El `index.html` es muy ligero, lo que permite un primer renderizado extremadamente rápido. El contenido se construye dinámicamente, lo cual es una estrategia válida (similar a una App Shell).
4.  **Animaciones Performantes**: El uso de `requestAnimationFrame` y listeners de eventos pasivos demuestra un enfoque consciente del rendimiento en las animaciones.

### Áreas de Mejora y Recomendaciones

1.  **Optimización de Recursos de Terceros (Preconnect)**:
    *   **Problema**: Aunque no se usan en el `index.html` actual, si en el futuro se añadieran fuentes de Google Fonts u otros recursos de dominios externos, la conexión inicial a esos dominios puede añadir latencia.
    *   **Recomendación**: Añadir hints de `preconnect` en el `<head>` para acelerar la conexión a dominios críticos de terceros.
        ```html
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        ```
2.  **Precarga de Recursos Críticos (Preload)**:
    *   **Problema**: El recurso más importante para la experiencia visual es el canvas 3D. El bundle de JavaScript que lo renderiza podría ser grande.
    *   **Recomendación**: Experimentar con la precarga del chunk de JavaScript que contiene la lógica de Three.js para que el navegador lo descargue con mayor prioridad. Vite puede configurarse para generar estos hints, o se pueden añadir manualmente si se conoce el nombre del archivo final.
        ```html
        <link rel="preload" href="/assets/main-chunk.js" as="script">
        ```
3.  **Tamaño del Bundle de `three.js`**:
    *   **Observación**: `three.js` es una dependencia pesada. Aunque Vite hace un gran trabajo con el tree-shaking, es crucial importar solo lo que se necesita.
    *   **Recomendación**: Auditar periódicamente el bundle de producción (usando `vite-plugin-inspect` o `rollup-plugin-visualizer`) para asegurarse de que no se están incluyendo partes no deseadas de `three.js`. Por ejemplo, en lugar de `import * as THREE from 'three'`, es mejor importar explícitamente: `import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';`.

## Análisis del Proyecto Raíz

Este proyecto tiene **problemas de rendimiento significativos** debido a la falta de un proceso de build.

### Problemas Críticos

1.  **Sin Proceso de Build**:
    *   **Problema**: Los archivos `/src/main.js` y `/src/style.css` se sirven al navegador sin ningún tipo de optimización (sin minificación, sin bundling, sin transpilación para navegadores antiguos). Esto resulta en tamaños de archivo más grandes y más peticiones de red de las necesarias.
    *   **Recomendación URGENTE**: Este proyecto debe ser migrado para usar un bundler como **Vite**. Dado que ya hay un proyecto Vite configurado en `anime-landing`, sería relativamente sencillo crear una nueva configuración de Vite para este `index.html`.
2.  **Recursos que Bloquean el Renderizado**:
    *   **Problema**: La hoja de estilos de Google Fonts y el `style.css` local se cargan de forma síncrona en el `<head>`. El navegador no renderizará nada hasta que estos archivos se hayan descargado y parseado.
    *   **Recomendación**:
        - Para Google Fonts, se puede usar la estrategia de `preload` para cargar el CSS de forma asíncrona.
        - Para el CSS local, una técnica avanzada es identificar el "CSS crítico" (el necesario para renderizar la parte visible de la página o "above the fold") e insertarlo inline en el HTML, cargando el resto de forma asíncrona. Herramientas como [Penthouse](https://github.com/pocketjoso/penthouse) pueden automatizar esto.

### Otras Observaciones de Rendimiento

- **Preloader**: Aunque puede mejorar la experiencia percibida, el preloader actual añade más DOM y CSS al parseo inicial. Es un parche para una carga lenta, pero la solución real es optimizar la carga en sí. Una vez que el proyecto use Vite y las optimizaciones se apliquen, el preloader podría ya no ser necesario o su duración podría reducirse drásticamente.

## Conclusión General de Rendimiento

El enfoque de `anime-landing` es el camino a seguir. El proyecto raíz necesita una refactorización urgente para incorporar un proceso de build moderno. Las recomendaciones para `anime-landing` son micro-optimizaciones sobre una base ya sólida, mientras que las del proyecto raíz son fundamentales para tener un rendimiento aceptable en un entorno de producción.
