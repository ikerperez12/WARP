# Informe Consolidado y Hoja de Ruta de Mejoras

## 1. Resumen Ejecutivo

El repositorio `WARP` contiene dos proyectos: un portafolio personal (`portfolio-3d`) y una landing page de estilo tecnológico (`anime-landing`). El proyecto `anime-landing` es, con diferencia, el más moderno, mejor estructurado y de mayor calidad. Demuestra un sólido conocimiento en desarrollo frontend, animaciones y WebGL (Three.js), con un código limpio y modular.

Por el contrario, el proyecto raíz (`portfolio-3d`) parece ser más antiguo o un prototipo, ya que carece de un proceso de build moderno y presenta vulnerabilidades críticas en sus dependencias.

Las principales fortalezas del código base son su **calidad visual, la modularidad del proyecto `anime-landing` y el uso de buenas prácticas de rendimiento en Three.js**. Las debilidades más significativas son la **falta de un ecosistema de desarrollo robusto (testing, linting), problemas de accesibilidad fundamentales y riesgos de seguridad críticos** en el proyecto antiguo.

Este informe resume los hallazgos y propone una hoja de ruta clara para elevar la calidad, seguridad y mantenibilidad de todo el repositorio.

## 2. Resumen de Hallazgos

### A. Estructura y Configuración del Proyecto

- **Confusión Estructural**: La coexistencia de dos proyectos separados en el mismo repositorio es confusa.
- **Ausencia de Herramientas de Calidad**: No se utiliza ningún linter (ESLint), formateador (Prettier) ni framework de testing (Vitest).
- **Falta de CI/CD**: No hay pipelines de integración continua para automatizar la validación y el despliegue.

### B. Calidad de Código

- **`anime-landing`**: Código de alta calidad, modular y moderno, pero con un **bug crítico** debido a la inconsistencia de la versión de `animejs` y un uso excesivo de "magic numbers".
- **Proyecto Raíz**: Código monolítico en un solo archivo, dependiente de manipulación manual del DOM y sin un proceso de build.
- **Ambos Proyectos**: Falta de documentación de código (JSDoc) y de seguridad de tipos (TypeScript).

### C. Rendimiento Frontend

- **`anime-landing`**: Muy buen rendimiento base gracias a Vite y a las optimizaciones de Three.js. Las mejoras son secundarias.
- **Proyecto Raíz**: **Rendimiento deficiente** por la falta de un proceso de build (sin minificación, tree-shaking ni bundling) y el uso de recursos que bloquean el renderizado.

### D. UI/UX y Accesibilidad

- **UI/UX**: Ambos proyectos tienen una estética visual muy cuidada y una buena experiencia de usuario a nivel de interacción.
- **Accesibilidad (a11y)**: **Fallo crítico en ambos proyectos**. La carencia más grave es la **ausencia de estados de foco visibles**, lo que hace que la navegación por teclado sea prácticamente imposible para usuarios con discapacidad. También se detectó un posible problema de contraste de color.

### E. Buenas Prácticas en Three.js (`anime-landing`)

- El código de Three.js es **excelente**. Sigue las mejores prácticas de rendimiento, como la limitación del `pixelRatio`, el uso eficiente de geometrías y la correcta configuración de materiales. Las únicas mejoras posibles se centran en la limpieza y mantenibilidad del código (uso de constantes en lugar de números mágicos).

### F. Seguridad

- **Proyecto Raíz**: **RIESGO CRÍTICO**. La versión de `vite` utilizada tiene vulnerabilidades conocidas que permiten la lectura de archivos del sistema.
- **`anime-landing`**: No presenta riesgos inminentes, pero utiliza el patrón inseguro `innerHTML`. Aunque actualmente no es explotable, representa una "bomba de tiempo" si en el futuro se usa con datos dinámicos.

## 3. Hoja de Ruta y Recomendaciones Priorizadas

### Prioridad CRÍTICA (Acción Inmediata)

1.  **Solucionar Vulnerabilidad de `vite` (Proyecto Raíz)**:
    - **Acción**: En el `package.json` raíz, actualizar la versión de `vite` a la última disponible (`npm install vite@latest`). Esto es **mandatorio** para mitigar el riesgo de seguridad.
2.  **Añadir Estados de Foco Visibles (Ambos Proyectos)**:
    - **Acción**: Añadir estilos CSS para `:focus-visible` en todos los elementos interactivos (enlaces, botones) para garantizar la accesibilidad.
    - **Impacto**: Resuelve el problema de accesibilidad más grave del sitio.

### Prioridad ALTA (Fundacional para la Calidad)

3.  **Unificar o Separar los Proyectos**:
    - **Acción**: Tomar una decisión arquitectónica:
        - **Opción A (Recomendada)**: Convertir `anime-landing` en el proyecto principal del repositorio y mover el contenido del proyecto raíz a una subcarpeta de "archivo" o eliminarlo.
        - **Opción B**: Separar cada proyecto en su propio repositorio de Git.
4.  **Integrar Herramientas de Calidad de Código**:
    - **Acción**: Instalar y configurar **ESLint** y **Prettier** en el proyecto `anime-landing`. Añadir scripts a `package.json` para ejecutar el linter y el formateador.
    - **Impacto**: Asegura un código consistente, legible y libre de errores comunes.
5.  **Corregir Bug de `animejs`**:
    - **Acción**: En `anime-landing`, o bien bajar la versión de `animejs` a la `^3.2.2` en el `package.json` para que coincida con el código, o bien refactorizar el código para que use la API de `animejs@4`.
    - **Impacto**: Soluciona un bug que probablemente esté impidiendo que las animaciones funcionen como se espera.

### Prioridad MEDIA (Mejoras de Robustez)

6.  **Introducir Pruebas (Testing)**:
    - **Acción**: Instalar **Vitest** en `anime-landing` y empezar a escribir pruebas unitarias para las funciones de lógica pura (ej. en `anim/`, `ui/`, `three/`).
    - **Impacto**: Aumenta la confianza al hacer cambios y previene regresiones.
7.  **Refactorizar `innerHTML`**:
    - **Acción**: Modificar el código que usa `innerHTML` para crear y añadir elementos del DOM mediante métodos seguros como `document.createElement()` y `.textContent`.
    - **Impacto**: Elimina un "code smell" de seguridad y prepara el código para un futuro uso con datos dinámicos.
8.  **Migrar a TypeScript o JSDoc**:
    - **Acción**: Renombrar los archivos `.js` a `.ts` y empezar a añadir tipos a las funciones y estructuras de datos, especialmente a los objetos `orb`, `ui` y `state`.
    - **Impacto**: Mejora drásticamente la mantenibilidad y reduce los errores en tiempo de ejecución.

### Prioridad BAJA (Refinamiento)

9.  **Eliminar "Magic Numbers"**:
    - **Acción**: Refactorizar el código para mover todos los valores numéricos y strings codificados a un objeto de configuración centralizado.
10. **Añadir Documentación JSDoc**:
    - **Acción**: Documentar las funciones públicas explicando qué hacen, qué parámetros reciben y qué retornan.

## 4. Sugerencias para Futuros Desarrollos

- **Panel de Control de Animaciones**: Añadir un panel de control (ej. con [lil-gui](https://lil-gui.georgealways.com/)) para poder manipular los parámetros de las animaciones y de la escena 3D en tiempo real. Esto sería muy útil para la experimentación y el ajuste fino.
- **Carga de Modelos 3D**: Extender la escena de Three.js para cargar modelos 3D externos (en formato `glTF`), lo que permitiría crear experiencias mucho más ricas.
- **Web Components**: Dado el enfoque modular, los componentes de UI podrían encapsularse como Web Components, haciéndolos reutilizables en cualquier proyecto web, independientemente del framework.
- **Interacciones más Complejas**: Explorar interacciones más avanzadas con la escena 3D, como la física (usando `ammo.js` o `rapier`) o el post-procesamiento para añadir efectos visuales como `bloom`, `aberración cromática`, etc.
- **Versión en React/Svelte**: El proyecto `anime-landing` es un candidato perfecto para ser migrado a un framework declarativo como React (con `react-three-fiber`) o Svelte. Esto simplificaría enormemente la gestión del estado y la UI.



Ohara TCG
Arelia TCG 
Tequila TCG 
Nakama TCG (amigo y lore op)
Kaizoku TCG (pirata en japo)
Reiki TCG
Yomi TCG (lectura)
Kiru TCG (cortar(espada))
Hihō TCG 
Meki TCG 