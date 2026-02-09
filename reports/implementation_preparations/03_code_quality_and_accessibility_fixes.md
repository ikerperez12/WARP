# Preparación para la Implementación: Calidad de Código y Accesibilidad

Este informe detalla las configuraciones propuestas para integrar herramientas de calidad de código y las modificaciones CSS para mejorar la accesibilidad, sentando las bases para un desarrollo más robusto y mantenible.

## 1. Integración de ESLint y Prettier

Para asegurar la consistencia del código, detectar errores y aplicar buenas prácticas de estilo, se propone integrar ESLint (para el linting) y Prettier (para el formateo).

### 1.1. Dependencias Necesarias

Añadir las siguientes dependencias de desarrollo al `package.json`:

```json
{
  "devDependencies": {
    "eslint": "^8.x.x",
    "eslint-config-prettier": "^9.x.x",
    "eslint-plugin-prettier": "^5.x.x",
    "prettier": "^3.x.x"
  }
}
```
**Nota**: Las versiones `x.x.x` deben ser reemplazadas por las últimas versiones estables.

### 1.2. Configuración de ESLint (`.eslintrc.cjs`)

Crear un archivo llamado `.eslintrc.cjs` (para compatibilidad con proyectos `type: "module"`) en la raíz del proyecto con el siguiente contenido:

```javascript
module.exports = {
  // Entornos donde se ejecutará el código (navegador, Node.js)
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  // Extiende configuraciones recomendadas
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Integra Prettier en ESLint
  ],
  // Analizador para sintaxis ECMAScript
  parserOptions: {
    ecmaVersion: 12, // Permite características de ES2021
    sourceType: 'module', // Usa módulos ES
  },
  // Reglas personalizadas o sobrescritas
  rules: {
    // Ejemplo de reglas que podrían añadirse o modificarse:
    'no-unused-vars': 'warn', // Advertir sobre variables no usadas
    'no-console': 'warn',    // Advertir sobre console.log
    'prettier/prettier': 'error', // Reportar errores de Prettier como errores de ESLint
    // Más reglas personalizadas:
    // 'indent': ['error', 2],
    // 'linebreak-style': ['error', 'unix'],
    // 'quotes': ['error', 'single'],
    // 'semi': ['error', 'always'],
  },
};
```

### 1.3. Configuración de Prettier (`.prettierrc.cjs`)

Crear un archivo llamado `.prettierrc.cjs` en la raíz del proyecto con el siguiente contenido:

```javascript
module.exports = {
  // Usar comillas simples en lugar de dobles
  singleQuote: true,
  // Añadir punto y coma al final de las declaraciones
  semi: true,
  // Ancho máximo de línea antes de que Prettier lo envuelva
  printWidth: 100,
  // Usar tabs en lugar de espacios (o viceversa)
  useTabs: false,
  // Número de espacios por nivel de indentación
  tabWidth: 2,
  // Añadir coma colgante (trailing comma) donde sea posible (ej. en objetos, arrays)
  trailingComma: 'es5',
  // Siempre incluir paréntesis alrededor de los parámetros de funciones de flecha de un solo argumento
  arrowParens: 'always',
  // Evitar que Prettier formatee los archivos Markdown con saltos de línea forzados.
  proseWrap: 'preserve',
};
```

### 1.4. Archivo para Ignorar Prettier (`.prettierignore`)

Crear un archivo `.prettierignore` en la raíz del proyecto para excluir archivos o directorios del formateo (ej. build outputs, librerías externas):

```
# Directorios
/dist
/node_modules
/.git
/reports

# Archivos
*.min.js
*.css.map
```

### 1.5. Actualización de `package.json` para Scripts

Añadir los siguientes scripts al `package.json` en la sección `scripts`:

```json
{
  "scripts": {
    "lint": "eslint "{src,anime-landing/src}/**/*.{js,jsx,mjs,cjs}"",
    "lint:fix": "eslint "{src,anime-landing/src}/**/*.{js,jsx,mjs,cjs}" --fix",
    "format": "prettier "{src,anime-landing/src}/**/*.{js,jsx,mjs,cjs,json,css,md}" --write",
    "check-format": "prettier "{src,anime-landing/src}/**/*.{js,jsx,mjs,cjs,json,css,md}" --check"
  }
}
```
**Nota**: He adaptado el script `lint` y `format` para que incluya tanto el directorio `src` de la raíz como `anime-landing/src`, asumiendo que ambos proyectos se mantienen. Si se unifican, el patrón sería más simple.

---

## 2. Implementación de Estados de Foco Visibles (Accesibilidad)

Una de las deficiencias críticas identificadas fue la falta de estados de foco visibles para los elementos interactivos, lo cual es fundamental para la accesibilidad. Se propone el siguiente CSS:

### 2.1. Para `anime-landing/src/style.css`

Añadir las siguientes reglas al final del archivo o en una sección dedicada a la accesibilidad:

```css
/* Accesibilidad: Estados de Foco Visibles */
/* Resaltar botones, enlaces y otros elementos interactivos al ser enfocados por teclado */
.btn:focus-visible,
.nav a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--accent); /* Usar el color de acento principal */
  outline-offset: 3px; /* Separar ligeramente el contorno del elemento */
  border-radius: 4px; /* Opcional: para esquinas redondeadas */
}

/* En caso de que se use el cursor personalizado, asegurar que no interfiere con el foco */
.custom-cursor:focus-visible,
.custom-cursor-dot:focus-visible {
  outline: none; /* Asegurar que el cursor personalizado no tenga foco */
}
```
**Nota**: El `button:focus-visible` genérico es importante para cubrir cualquier botón que no tenga una clase específica como `.btn`.

### 2.2. Para `src/style.css` (Proyecto Raíz)

Añadir las siguientes reglas al final del archivo o en una sección dedicada a la accesibilidad:

```css
/* Accesibilidad: Estados de Foco Visibles */
/* Resaltar botones, enlaces y otros elementos interactivos al ser enfocados por teclado */
.btn:focus-visible,
.nav-link:focus-visible,
button:focus-visible,
a[href^="#"]:focus-visible, /* Para los enlaces de anclaje */
.project-link:focus-visible,
.contact-card a:focus-visible,
input:focus-visible, /* Para campos de formulario */
textarea:focus-visible {
  outline: 2px solid var(--accent-primary); /* Usar el color de acento */
  outline-offset: 3px; /* Separar ligeramente el contorno del elemento */
  border-radius: 8px; /* Opcional, según el diseño */
}
```
**Nota**: En este proyecto, dado que hay más elementos interactivos sin clases `.btn` directas (como `nav-link`, `input`, `textarea`, `a[href^="#"]`), se han incluido selectores más específicos para asegurar que todos los elementos interactivos obtengan un estado de foco visible. Se utiliza `var(--accent-primary)` que ya está definido en el archivo CSS.

---

## Conclusión

La implementación de estas configuraciones de ESLint y Prettier establecerá un estándar de código de alta calidad y formateado automático. La adición de los estilos de `:focus-visible` mejorará drásticamente la accesibilidad para los usuarios que navegan con teclado, abordando una deficiencia crítica identificada previamente. Estas son mejoras fundacionales que beneficiarán cualquier desarrollo futuro en el proyecto.
