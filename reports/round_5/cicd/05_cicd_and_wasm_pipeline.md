# Informe: Pipeline de CI/CD para Compilación de WebAssembly

## 1. Resumen y Estrategia

Para automatizar la compilación de los proyectos en C/C++ a WebAssembly (Wasm) y su integración en el portafolio, se propone una estrategia de **dos pipelines de CI/CD desacoplados** en GitHub Actions.

1.  **Pipeline de Compilación Wasm**: Se ejecuta en el repositorio de cada proyecto en C/C++. Su única responsabilidad es compilar el código a `.wasm` y `.js` y almacenar estos archivos como **artefactos de build**.
2.  **Pipeline de Despliegue del Frontend**: Se ejecuta en el repositorio principal del portafolio. Antes de construir el sitio web, **descarga los artefactos** de la última compilación exitosa del proyecto Wasm y los integra en el build final del frontend.

**Ventajas de esta estrategia:**

-   **Desacoplamiento**: El frontend y los proyectos en C pueden evolucionar de forma independiente.
-   **Eficiencia**: El frontend no necesita recompilar el Wasm en cada build, simplemente consume los binarios ya listos.
-   **Consistencia**: La compilación de Wasm se realiza en un entorno Docker controlado, garantizando que el resultado sea siempre el mismo.

---

## 2. Entorno de Compilación Dockerizado

Para asegurar una compilación consistente y reproducible, se debe usar un contenedor Docker con el SDK de Emscripten.

### `Dockerfile` para Emscripten

Este archivo debe colocarse en la raíz del repositorio del proyecto en C/C++.

```dockerfile
# Nombre del archivo: Dockerfile

# Usar la imagen oficial de Emscripten que contiene todas las herramientas (emcc)
FROM emscripten/emsdk:3.1.45

# Crear un directorio de trabajo dentro del contenedor
WORKDIR /src

# Copiar el código fuente del proyecto al contenedor
COPY . .

# Comando por defecto (se puede sobrescribir).
# Este comando compila main.c y genera los archivos en la carpeta /src/dist
CMD ["emcc", "main.c", "-o", "dist/cli_project.js", "-s", "WASM=1", "-s", "NO_EXIT_RUNTIME=1", "-s", "EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']", "-s", "INVOKE_RUN=0", "-s", "MODULARIZE=1", "-s", "EXPORT_NAME='createCliModule'"]
```

---

## 3. Pipeline de Compilación de WebAssembly

Este workflow debe colocarse en el repositorio del proyecto en C (ej. `github.com/tu-usuario/mi-cli-en-c`).

### `.github/workflows/build-wasm.yml`

```yaml
name: Build C project to WebAssembly

on:
  push:
    branches: [ main ] # Se activa en cada push a la rama principal

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # 1. Clona el repositorio del proyecto en C
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Construye la imagen Docker con Emscripten
      #    Esto leerá el Dockerfile en la raíz del proyecto.
      - name: Build Emscripten Docker image
        run: docker build -t emscripten-builder .

      # 3. Compila el código a Wasm
      #    - Se corre un contenedor a partir de la imagen recién creada.
      #    - Se monta el directorio actual (`$GITHUB_WORKSPACE`) en `/src` dentro del contenedor.
      #    - El comando `emcc` compilará el código y dejará los resultados en la carpeta `dist`.
      - name: Compile to Wasm
        run: |
          mkdir -p dist # Crear el directorio de salida si no existe
          docker run --rm -v "$GITHUB_WORKSPACE:/src" emscripten-builder

      # 4. Sube los artefactos de build
      #    - Este es el paso clave. Toma el contenido de la carpeta `dist` (`.js` y `.wasm`).
      #    - Lo empaqueta y lo sube como un artefacto llamado 'wasm-build'.
      #    - Este artefacto estará disponible para ser descargado por otros workflows.
      - name: Upload Wasm artifacts
        uses: actions/upload-artifact@v4
        with:
          name: wasm-build
          path: dist/
```

---

## 4. Pipeline del Frontend con Integración de Wasm

Este workflow debe colocarse en el repositorio principal del portafolio (`WARP`). Es una versión mejorada del que se propuso en la ronda anterior.

### `.github/workflows/deploy-frontend.yml`

```yaml
name: Build and Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      # 1. Clona el repositorio del frontend
      - name: Checkout Frontend Repository
        uses: actions/checkout@v4

      # 2. Descarga los artefactos Wasm
      #    - Utiliza una acción para descargar artefactos desde otro repositorio.
      #    - Se debe especificar el nombre del repositorio del proyecto en C (`owner/repo`).
      #    - Descarga el artefacto 'wasm-build' de la última ejecución exitosa en la rama 'main'.
      #    - El contenido se descomprimirá en `public/wasm/cli_project/`.
      - name: Download Wasm Artifacts
        uses: dawidd6/action-download-artifact@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow: build-wasm.yml # Nombre del workflow en el otro repo
          repo: tu-usuario/mi-cli-en-c # ¡¡¡REEMPLAZAR con el repo correcto!!!
          name: wasm-build
          path: public/wasm/cli_project/ # Directorio de destino

      # 3. Configurar PNPM y Node.js (igual que antes)
      - name: Setup PNPM
        uses: pnpm/action-setup@v3
        with:
          version: 8
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      # 4. Instalar dependencias del frontend
      - name: Install Dependencies
        run: pnpm install

      # 5. Construir el sitio web
      #    El proceso de build de Vite/Next.js incluirá automáticamente los archivos
      #    descargados en la carpeta `public/`.
      - name: Build Frontend
        run: pnpm run build # O `turbo run build` en un monorepo

      # 6. Desplegar
      #    Este paso depende del proveedor de hosting (Vercel, Netlify, etc.)
      - name: Deploy to Hosting Provider
        # Ejemplo para Vercel:
        # env:
        #   VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
        #   VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
        # run: npx vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
        run: echo "Desplegando el contenido de la carpeta 'dist'..."
```

## Conclusión

Esta arquitectura de CI/CD de dos pasos crea un flujo de trabajo robusto y automatizado. Asegura que los proyectos en C se compilen de forma consistente y que el frontend siempre utilice la última versión estable de los binarios WebAssembly, todo ello sin intervención manual. Es una solución escalable que permite añadir más proyectos Wasm en el futuro con un esfuerzo mínimo.
