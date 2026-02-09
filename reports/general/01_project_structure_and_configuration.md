# Informe de Estructura y Configuración del Proyecto

## Resumen General

El repositorio contiene dos proyectos web aparentemente separados, lo que genera una estructura inusual. El proyecto en el subdirectorio `anime-landing` parece ser una versión más reciente o una evolución del proyecto raíz `portfolio-3d`, ya que utiliza versiones más actualizadas de las dependencias.

Ambos proyectos utilizan **Vite** como herramienta de construcción, **Three.js** para gráficos 3D y **Anime.js** para animaciones.

## 1. Estructura del Repositorio

- **Dualidad de Proyectos**: La existencia de un proyecto en el directorio raíz y otro en `anime-landing` puede generar confusión. No está claro si son dos variantes, dos proyectos distintos o si uno es una versión obsoleta del otro.
  - **Recomendación**: Unificar los proyectos en una única estructura (posiblemente un monorepo con `pnpm` o `npm workspaces`) o separar `anime-landing` en su propio repositorio para clarificar la organización.
- **Archivos fuera de lugar**: La presencia de `CV.pdf` en la raíz del proyecto no es una práctica estándar para repositorios de código.
  - **Recomendación**: Eliminar archivos personales o de documentación no relacionada con el código del repositorio.
- **Código no utilizado**: El archivo `src/three-scene.js` en el proyecto raíz no parece ser importado o utilizado por el `index.html` principal, lo que sugiere que podría ser código obsoleto.

## 2. Configuración y Dependencias

- **Dependencias duplicadas**: Al tener dos archivos `package.json`, se duplica la gestión de dependencias. Las versiones de `vite`, `three` y `animejs` son diferentes entre ambos proyectos.
  - `portfolio-3d` (raíz): `vite@^6.0.0`, `three@^0.170.0`, `animejs@^3.2.2`
  - `anime-landing`: `vite@^7.2.4`, `three@^0.182.0`, `animejs@^4.3.5`
  - **Recomendación**: Consolidar en un único `package.json` para simplificar el mantenimiento y asegurar la consistencia de las versiones.

## 3. Herramientas de Calidad de Código

- **Ausencia de Linters y Formateadores**: No se han encontrado archivos de configuración para herramientas de formateo de código como Prettier (`.prettierrc`) ni de linters como ESLint (`.eslintrc.js`).
  - **Impacto**: Esto puede llevar a un código inconsistente, con diferentes estilos y propenso a errores comunes que estas herramientas detectan automáticamente.
  - **Recomendación**: Integrar **ESLint** y **Prettier** es fundamental. Se recomienda crear los archivos de configuración (`.eslintrc.js`, `.prettierrc`, `.prettierignore`) y añadir los scripts correspondientes en `package.json`.

## 4. Pruebas (Testing)

- **Ausencia total de pruebas**: No se ha detectado ningún framework de testing (como **Vitest**, Jest o Cypress) ni ningún archivo de prueba.
  - **Impacto**: La falta de pruebas hace que el proyecto sea frágil. Cualquier cambio o refactorización podría introducir regresiones sin que el desarrollador se dé cuenta.
  - **Recomendación**: Integrar **Vitest**, que se integra de forma nativa con Vite. Añadir pruebas unitarias para la lógica de negocio (ej. interacciones en `anime-landing/src/anim`) y componentes, y considerar pruebas E2E con Cypress o Playwright para los flujos críticos.

## 5. Integración Continua (CI/CD)

- **Sin pipeline de CI/CD**: No existe un archivo de configuración para pipelines de CI/CD (ej. `.github/workflows/main.yml`).
  - **Impacto**: El proceso de build, testing y despliegue es manual, lo que es ineficiente y propenso a errores.
  - **Recomendación**: Crear un pipeline básico con **GitHub Actions** o GitLab CI que se ejecute en cada `push` o `pull request`. Este pipeline debería, como mínimo, instalar dependencias, ejecutar el linter y las pruebas, y realizar el build.
