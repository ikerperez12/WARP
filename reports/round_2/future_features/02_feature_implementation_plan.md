# Plan de Implementación de Nuevas Características

## Resumen

Este documento describe la planificación y el diseño de nuevas características para mejorar la interactividad y la capacidad de demostración del proyecto. La característica principal propuesta es un **"Personalizador Interactivo del Orbe"**, que permitirá a los usuarios modificar en tiempo real la apariencia y el comportamiento de la escena 3D.

---

## Característica 1: Personalizador Interactivo del Orbe (Orb Customizer)

### 1. Definición del Producto (PRD de una página)

- **Problema**: La escena 3D es visualmente atractiva, pero es una experiencia pasiva. Los usuarios (reclutadores, clientes) no pueden interactuar con ella más allá del scroll o el movimiento del ratón. Esto limita la capacidad de demostrar la profundidad de los conocimientos en programación 3D.
- **Solución Propuesta**: Añadir un panel de control de interfaz gráfica (GUI) que permita a los usuarios manipular una amplia gama de parámetros de la escena 3D en tiempo real.
- **Público Objetivo**: Visitantes del portafolio (reclutadores, líderes técnicos, otros desarrolladores).
- **Objetivo/Resultado Clave**:
    - **Demostrar maestría técnica**: Probar la capacidad de vincular una UI con un sistema complejo en tiempo real (la escena de Three.js).
    - **Aumentar el "engagement"**: Transformar una demo pasiva en un "juguete" interactivo, incentivando a los visitantes a pasar más tiempo en la página.
- **Criterios de Aceptación (Qué se considera "Hecho")**:
    - Un panel de control es visible en la página.
    - El panel contiene controles para al menos 5 propiedades del orbe (ej. color del núcleo, color del anillo, opacidad de las partículas, "metalicidad", "rugosidad").
    - Modificar un control en el panel actualiza la escena 3D instantáneamente sin necesidad de recargar la página.
- **Fuera de Alcance (para la v1)**:
    - Guardar las personalizaciones del usuario.
    - Controles para las animaciones complejas (timeline de intro).
    - Añadir nuevas geometrías dinámicamente.

### 2. Plan de Implementación Técnico

Este plan utiliza **`lil-gui`**, una librería ligera y estándar en el ecosistema de Three.js para este tipo de controles.

#### **Fase 1: Integración y Configuración Inicial**

1.  **Añadir dependencia**:
    - **Tarea**: Ejecutar `npm install lil-gui` en la terminal.
    - **Verificación**: La librería aparece en `package.json`.
2.  **Instanciar la GUI**:
    - **Tarea**: En `anime-landing/src/main.js`, importar y crear una nueva instancia de la GUI.
        ```javascript
        import GUI from 'lil-gui';
        // ...
        const gui = new GUI();
        ```
    - **Verificación**: Un panel de control vacío aparece en la esquina superior derecha de la página.

#### **Fase 2: Refactorización y Exposición de Parámetros**

1.  **Centralizar la Configuración**:
    - **Tarea**: En `anime-landing/src/three/objects.js`, crear un objeto `orbConfig` que contenga todos los valores que antes estaban codificados (colores, tamaños, etc.).
        ```javascript
        // orbConfig inicial
        const orbConfig = {
          coreColor: 0x111111,
          ringColor: 0xb6ff3b,
          particleColor: 0xb6ff3b,
          coreRoughness: 0.32,
          coreMetalness: 0.12,
          particleSize: 0.015,
          particleOpacity: 0.55
        };
        ```
    - **Verificación**: La escena se sigue renderizando exactamente igual que antes, pero ahora usando los valores del objeto `orbConfig`.
2.  **Exponer Materiales y Estado**:
    - **Tarea**: Asegurarse de que la función `addOrb` retorna los materiales (`coreMat`, `ringMat`, `ptsMat`) para poder modificarlos desde `main.js`. El estado (`state`) ya es accesible globalmente.

#### **Fase 3: Vinculación de la UI con la Escena 3D**

1.  **Añadir Controles a `lil-gui`**:
    - **Tarea**: En `main.js`, después de crear la GUI, añadir controles para cada propiedad de `orbConfig`.
        ```javascript
        gui.addColor(orbConfig, 'coreColor').name('Núcleo');
        gui.addColor(orbConfig, 'ringColor').name('Anillo');
        gui.add(orbConfig, 'coreRoughness', 0, 1).name('Rugosidad');
        gui.add(orbConfig, 'coreMetalness', 0, 1).name('Metalicidad');
        gui.add(orbConfig, 'particleSize', 0.001, 0.05).name('Tamaño Partículas');
        ```
    - **Verificación**: El panel de la GUI ahora muestra los controles con sus nombres correctos.

2.  **Implementar Actualizaciones en Tiempo Real**:
    - **Tarea**: Añadir listeners `onChange` a cada control para que actualicen las propiedades correspondientes de los materiales de Three.js.
        ```javascript
        // Ejemplo para el color del núcleo
        gui.addColor(orbConfig, 'coreColor').onChange(value => {
          orb.coreMat.emissive.set(value);
        });

        // Ejemplo para la rugosidad
        gui.add(orbConfig, 'coreRoughness', 0, 1).onChange(value => {
          orb.coreMat.roughness = value;
        });
        ```
    - **Verificación**: Al mover un slider o cambiar un color en la GUI, el orbe 3D se actualiza visualmente de forma instantánea.

#### **Fase 4: Control de Animaciones**

1.  **Exponer Parámetros de Animación**:
    - **Tarea**: Modificar `anime-landing/src/anim/loop.js` para que acepte un objeto de configuración con parámetros como la duración de la rotación o la intensidad de la "respiración".
2.  **Añadir Controles de Animación**:
    - **Tarea**: Añadir nuevos controles a `lil-gui` en `main.js` para estas nuevas variables.
    - **Tarea**: Usar los listeners `onChange` para actualizar las variables que controlan las animaciones. Es posible que algunas animaciones de `anime.js` necesiten ser reiniciadas (`.restart()`) para que los nuevos valores surtan efecto.
    - **Verificación**: Al cambiar un valor en la GUI (ej. "Velocidad de Rotación"), la animación correspondiente en la escena 3D cambia su comportamiento.

---

## Característica 2: Migración a React con `react-three-fiber`

### 1. Justificación

- **Problema**: El proyecto actual, aunque bien estructurado, se basa en manipulación imperativa del DOM. A medida que la aplicación crezca, la gestión del estado y la sincronización entre la UI y la escena 3D se volverá cada vez más compleja y propensa a errores.
- **Solución**: Migrar a un framework declarativo como React, utilizando `react-three-fiber` (R3F) para la parte de 3D. R3F permite describir la escena de Three.js con componentes de React, lo que simplifica enormemente el código, la interactividad y la gestión del estado.

### 2. Plan de Migración (Alto Nivel)

1.  **Setup del Proyecto**: Crear un nuevo proyecto Vite con la plantilla de React + TypeScript.
2.  **Recrear la Escena con R3F**: Convertir la lógica de `three/objects.js` en un componente de React. En lugar de `new THREE.Mesh(...)`, se usaría JSX: `<mesh>...</mesh>`.
3.  **Portar la UI**: Convertir los módulos de `ui/` en componentes de React.
4.  **Estado Global**: Usar un gestor de estado como **Zustand** (ligero y simple) para manejar el estado que antes estaba en el objeto `state` y en `orbConfig`.
5.  **Integrar `lil-gui`**: La integración seguiría siendo similar, pero vinculada al store de Zustand.
6.  **Recrear Animaciones**: Las animaciones de `anime.js` para la UI se pueden recrear con librerías de animación para React como `framer-motion`. Las animaciones de Three.js se pueden controlar con el hook `useFrame` de R3F.
