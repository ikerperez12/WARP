# Propuesta de Arquitectura Backend y de Base de Datos

## 1. Resumen y Justificación

Actualmente, el contenido del portafolio (proyectos, skills, etc.) está codificado directamente en el HTML y el JavaScript. Para que el proyecto sea dinámico, escalable y fácil de actualizar, se necesita un backend y una base de datos.

Esta propuesta diseña una arquitectura moderna, robusta y fácil de desarrollar para dar soporte al portafolio.

- **Tecnologías Propuestas**:
    - **Backend**: **Node.js + Express con TypeScript**.
        - **Node.js/Express**: Un estándar de la industria, ligero, rápido y con un enorme ecosistema. Ideal para una API REST.
        - **TypeScript**: Aporta seguridad de tipos, lo que reduce errores y mejora drásticamente la mantenibilidad y el autocompletado.
    - **Base de Datos**: **PostgreSQL**.
        - Es una base de datos relacional de código abierto extremadamente potente, fiable y versátil. Su soporte para tipos de datos avanzados como `JSONB` y `ARRAY` la hace muy flexible.
    - **ORM**: **Prisma**.
        - Proporciona una capa de abstracción de base de datos totalmente segura en cuanto a tipos, simplificando las consultas y las migraciones. Se integra a la perfección con TypeScript.

---

## 2. Diseño de la API (RESTful)

Se propone una API REST centrada en los recursos principales del portafolio. El recurso principal serían los "proyectos".

### Endpoints para el Recurso `Project`

-   `GET /api/projects`
    -   **Descripción**: Obtiene una lista de todos los proyectos.
    -   **Respuesta Exitosa (200 OK)**:
        ```json
        [
          {
            "id": "cltma79de000008l41g23g6i8",
            "title": "Internet & Sistemas Distribuidos",
            "description": "Servicios web con arquitectura REST...",
            "tags": ["Java", "Spring Boot", "REST API", "Docker"],
            "imageUrl": "/images/project-1.png",
            "githubUrl": "https://github.com/ikerperez12"
          }
        ]
        ```

-   `GET /api/projects/:id`
    -   **Descripción**: Obtiene un único proyecto por su ID.
    -   **Respuesta Exitosa (200 OK)**: Devuelve un único objeto de proyecto.
    -   **Respuesta de Error (404 Not Found)**: Si el proyecto no existe.

-   **Endpoints de Administración (protegidos con autenticación)**:
    -   `POST /api/projects`: Crea un nuevo proyecto.
    -   `PUT /api/projects/:id`: Actualiza un proyecto existente.
    -   `DELETE /api/projects/:id`: Elimina un proyecto.

---

## 3. Arquitectura del Backend

Se propone una arquitectura en capas para separar responsabilidades y mejorar la organización del código.

### Estructura de Directorios Propuesta (`packages/api`)

Dentro de un monorepo, este backend viviría en `packages/api`.

```
/packages/api/
├── prisma/
│   └── schema.prisma         # Esquema de la base de datos para Prisma
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   └── project.routes.ts # Rutas para los proyectos
│   │   └── index.ts              # Combina todas las rutas
│   ├── services/
│   │   └── project.service.ts    # Lógica de negocio para los proyectos
│   ├── utils/
│   │   └── db.ts                 # Instancia del cliente de Prisma
│   └── app.ts                    # Configuración de la app Express
└── index.ts                      # Punto de entrada del servidor
```

---

## 4. Diseño de la Base de Datos (PostgreSQL + Prisma)

### `prisma/schema.prisma`

Este archivo es la "fuente única de verdad" para la base de datos. Prisma lo utiliza para generar el cliente de base de datos tipado y para crear y ejecutar las migraciones SQL.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// 1. Define el proveedor de la base de datos y la URL de conexión.
// La URL se carga desde variables de entorno para mayor seguridad.
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 2. Define el generador del cliente de Prisma.
generator client {
  provider = "prisma-client-js"
}

// 3. Define el modelo de datos para los proyectos.
model Project {
  // `id`: Clave primaria, autoincremental, usando CUID para IDs únicos y cortos.
  id          String   @id @default(cuid())

  // `title`: El título del proyecto, es un campo requerido.
  title       String

  // `description`: Una descripción más larga, tipo TEXT en la base de datos.
  description String   @db.Text

  // `tags`: Un array de strings. PostgreSQL lo manejará eficientemente.
  tags        String[]

  // `imageUrl`: URL a la imagen del proyecto.
  imageUrl    String

  // `githubUrl`: URL al repositorio de GitHub, debe ser único.
  githubUrl   String   @unique

  // `order`: Un campo opcional para ordenar los proyectos en el frontend.
  order       Int?

  // `createdAt`: Fecha de creación, se establece automáticamente.
  createdAt   DateTime @default(now())

  // `updatedAt`: Fecha de última actualización, se actualiza automáticamente.
  updatedAt   DateTime @updatedAt
}

// Futuro: Modelo para las 'Skills'
// model Skill { ... }

// Futuro: Modelo para la 'Experiencia'
// model Experience { ... }

```
**Comandos de Prisma a utilizar:**
- `npx prisma generate`: Genera el cliente de Prisma tipado.
- `npx prisma migrate dev`: Crea una nueva migración SQL a partir de los cambios en el `schema.prisma` y la aplica a la base de datos de desarrollo.

## 5. Integración con el Frontend

Con esta arquitectura, el frontend (`anime-landing` o `portfolio-3d`) se modificaría para:

1.  **Eliminar los Datos Codificados**: Se borrarían los arrays de proyectos, skills, etc., que están actualmente en el código JavaScript.
2.  **Realizar Peticiones a la API**: Al cargar la página, se usaría `fetch` para hacer una petición `GET /api/projects`.
3.  **Renderizar Datos Dinámicos**: Los datos recibidos de la API se usarían para renderizar dinámicamente el contenido de la página. Esto hace que para añadir un nuevo proyecto solo sea necesario añadir una nueva entrada en la base de datos, sin tocar el código del frontend.

## Conclusión

Esta arquitectura de backend proporciona una base sólida, segura y escalable. El uso de TypeScript y Prisma garantiza una experiencia de desarrollo excepcional, mientras que PostgreSQL ofrece la potencia y fiabilidad necesarias para una aplicación en producción. Es el siguiente paso lógico para convertir el portafolio de un proyecto estático a una aplicación web dinámica y completa.
