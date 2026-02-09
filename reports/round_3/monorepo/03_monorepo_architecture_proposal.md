# Propuesta de Arquitectura Monorepo con Turborepo

## 1. Justificación y Beneficios

La estructura actual del repositorio, con dos proyectos independientes, genera duplicación de dependencias, configuraciones y dificulta el mantenimiento. La adopción de una arquitectura **monorepo** solucionaría estos problemas al centralizar todo el código en un único repositorio gestionado.

Para este proyecto, se recomienda usar **PNPM** como gestor de paquetes y **Turborepo** como orquestador de tareas.

- **PNPM Workspaces**: Gestiona las dependencias de forma increíblemente eficiente, ahorrando espacio en disco al crear enlaces simbólicos a una única versión de cada paquete en lugar de duplicarlos.
- **Turborepo**: Es una herramienta de build extremadamente rápida que entiende las dependencias entre los proyectos del monorepo. Permite ejecutar tareas (como `build` o `lint`) de forma paralela y cachea los resultados, de modo que solo vuelve a ejecutar una tarea si el código de ese proyecto ha cambiado.

**Beneficios Clave para este Proyecto:**

1.  **Dependencias Únicas**: Una sola carpeta `node_modules` en la raíz. `three`, `animejs` y `vite` se instalan una sola vez.
2.  **Configuración Compartida**: Un único conjunto de reglas de ESLint y Prettier para todos los proyectos.
3.  **Código Compartido**: Facilita la creación de paquetes de componentes de UI o utilidades compartidas entre las diferentes aplicaciones.
4.  **Builds Inteligentes y Rápidos**: Si solo se modifica el código de `anime-landing`, Turborepo no volverá a construir `portfolio-3d`, ahorrando tiempo en CI/CD.

## 2. Estructura de Directorios Propuesta

Se propone la siguiente estructura de directorios, estándar en monorepos gestionados con Turborepo:

```
/
├── apps/
│   ├── anime-landing/      # El proyecto principal (landing page interactiva)
│   │   ├── src/
│   │   ├── index.html
│   │   └── package.json
│   └── portfolio-3d/       # El proyecto secundario (portafolio estático)
│       ├── src/
│       ├── index.html
│       └── package.json
├── packages/
│   ├── ui/                 # Futuro paquete para componentes de UI compartidos
│   │   ├── src/
│   │   └── package.json
│   └── eslint-config-custom/ # Configuración de ESLint compartida
│       └── index.js
├── package.json            # package.json raíz
├── pnpm-workspace.yaml     # Define los workspaces de pnpm
└── turbo.json              # Define el pipeline de Turborepo
```

## 3. Archivos de Configuración

### `pnpm-workspace.yaml` (en la raíz)

Este archivo le dice a PNPM dónde encontrar los proyectos del monorepo.

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `package.json` (en la raíz)

Gestiona las dependencias de desarrollo globales (como `turbo`, `eslint`, `prettier`) y define los scripts principales.

```json
{
  "name": "warp-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "format": "prettier --write "**/*.{ts,js,css,md,json}""
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "eslint": "latest",
    "eslint-config-custom": "workspace:*"
  },
  "packageManager": "pnpm@8.6.0"
}
```

### `turbo.json` (en la raíz)

Este es el cerebro de Turborepo. Define las "tuberías" (pipelines) de tareas.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // Un proyecto no puede empezar a construirse hasta que sus dependencias (^) se hayan construido.
      "dependsOn": ["^build"],
      // Los resultados del build se encuentran en estas carpetas. Turborepo las cacheará.
      "outputs": ["dist/**"]
    },
    "lint": {
      // El linting no tiene outputs que cachear, pero la ejecución en sí se cachea.
      "outputs": []
    },
    "dev": {
      // El servidor de desarrollo no se cachea y es una tarea persistente.
      "cache": false
    }
  }
}
```

### `packages/eslint-config-custom/index.js`

Un ejemplo de configuración de ESLint compartida.

```javascript
module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'no-console': 'warn',
  }
};
```

## 4. Plan de Migración (Pasos)

1.  **Inicializar el Monorepo**:
    - Crear una nueva estructura de directorios como la propuesta.
    - Colocar `pnpm-workspace.yaml`, el `package.json` raíz y `turbo.json` en la raíz.
2.  **Mover los Proyectos**:
    - Copiar el contenido del proyecto `anime-landing` a la nueva carpeta `apps/anime-landing`.
    - Copiar el contenido del proyecto raíz (`portfolio-3d`) a la nueva carpeta `apps/portfolio-3d`.
3.  **Adaptar los `package.json`**:
    - Limpiar los `package.json` de cada aplicación (`apps/*`), eliminando las dependencias de desarrollo que ahora vivirán en la raíz (como `eslint`, `prettier`).
    - Añadir la configuración de ESLint compartida: `"eslint-config-custom": "workspace:*"`.
4.  **Instalar Dependencias**:
    - Desde el directorio raíz, ejecutar `pnpm install`. PNPM leerá el `pnpm-workspace.yaml` y creará la estructura de `node_modules` de forma eficiente.
5.  **Verificar los Scripts**:
    - Desde la raíz, ejecutar los scripts definidos en el `package.json` raíz, como `pnpm run build` o `pnpm run lint`. Turborepo se encargará de ejecutar las tareas correspondientes en cada aplicación de forma paralela y cacheada.

## Conclusión

La migración a un monorepo gestionado con PNPM y Turborepo es una inversión estratégica que simplificará drásticamente el mantenimiento, mejorará la velocidad de los builds y sentará una base sólida para compartir código en el futuro. Es la solución recomendada para resolver la actual confusión estructural del repositorio.
