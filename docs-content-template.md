# Plantilla editable del portfolio

Archivo principal: `content-template.json`

Objetivo:
- Reunir textos, mensajes y referencias visuales en un solo sitio editable.
- Servir de base para futuras iteraciones sin tocar directamente `index.html`.

## Que puedes editar ya
- `meta`: title, description y Open Graph.
- `hero`: claim principal, nombre, roles, descripcion y CTAs.
- `about`: intro, bloques de texto y highlights.
- `services`: bloques de valor.
- `contact`: enlaces y correo.
- `visualAssets`: notas sobre que imagenes o renders quieres usar.

## Proyectos
La fuente activa de proyectos es `public/projects.json`.

Campos por proyecto:
- `id`: identificador estable.
- `repoName`: nombre real del repo en GitHub.
- `name`: titulo visible.
- `description`: resumen visible.
- `impact`: frase de impacto.
- `language`: lenguaje principal.
- `stack`: etiquetas visibles.
- `domain`: categorias para filtros.
- `githubUrl`: enlace al repo.
- `demoUrl`: enlace a demo si existe.
- `imageUrl`: portada o preview.
- `imageAlt`: texto alternativo.
- `stars`: estrellas.
- `forks`: forks.
- `updatedAt`: ultima actualizacion ISO.
- `accent`: variante visual.

## Actualizar repos desde GitHub
Ejecuta:

```bash
npm run sync:projects
```

Eso rehace `public/projects.json` con repos publicos recientes de `ikerperez12`.

## Flujo recomendado
1. Edita `content-template.json` con el copy que quieras.
2. Edita `public/projects.json` si quieres curar manualmente algun proyecto.
3. Si prefieres refresco automatico, usa `npm run sync:projects`.
4. Cuando me pases los cambios, adapto la web al nuevo contenido.

