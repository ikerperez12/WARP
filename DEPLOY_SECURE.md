# Despliegue Seguro en Vercel (Gratis)

## 1) Preparar y subir repo privado
```powershell
git add -A
git commit -m "hardening: secure deploy + xss cleanup + vercel config"
git push origin <tu-rama>
```

## 2) Importar en Vercel
1. Entra en Vercel y pulsa `Add New... -> Project`.
2. Importa tu repositorio privado de GitHub.
3. Para este proyecto principal (`WARP`):
`Root Directory`: `.`
`Build Command`: `npm run build`
`Output Directory`: `dist`
4. Despliega.

## 3) Dominio gratis
- Vercel te asigna automáticamente un dominio gratuito:
`https://<nombre-proyecto>.vercel.app`

## 4) Seguridad ya aplicada en el repo
- Headers de seguridad en [`vercel.json`](/C:/Users/ijpg1/projects/WARP/vercel.json).
- CSP y política de referrer también en [`index.html`](/C:/Users/ijpg1/projects/WARP/index.html).
- Sanitización de datos dinámicos y URLs en [`src/main.js`](/C:/Users/ijpg1/projects/WARP/src/main.js).
- Limpieza de secretos/artefactos con [`.gitignore`](/C:/Users/ijpg1/projects/WARP/.gitignore) y [`.vercelignore`](/C:/Users/ijpg1/projects/WARP/.vercelignore).

## 5) Verificación rápida post-deploy
1. Abrir el sitio en HTTPS y comprobar que carga sin errores.
2. Revisar cabeceras con `securityheaders.com`.
3. Revisar consola del navegador (sin errores de CSP ni JS).

## 6) Deploy opcional de `anime-landing`
Si quieres desplegarlo como proyecto separado:
- Crea otro proyecto en Vercel.
- `Root Directory`: `anime-landing`
- Usa su propio [`anime-landing/vercel.json`](/C:/Users/ijpg1/projects/WARP/anime-landing/vercel.json).
