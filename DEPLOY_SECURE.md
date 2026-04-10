# Despliegue Seguro en Vercel (Gratis)

## 1) Subir repo privado
```powershell
git add -A
git commit -m "release: security hardening + visual/mobile improvements + real contact email API"
git push origin <tu-rama>
```

## 2) Importar en Vercel
1. `Add New... -> Project`.
2. Importa tu repo privado de GitHub.
3. Configuracion de build para este proyecto (`WARP`):
`Root Directory`: `.`
`Build Command`: `npm run build`
`Output Directory`: `dist`

## 3) Variables de entorno (obligatorio para formulario)
En `Project Settings -> Environment Variables` agrega:

`CONTACT_RECIPIENT_EMAIL` (**obligatoria**): inbox destino principal (`tu-correo@dominio.com`).  
`RESEND_API_KEY` (opcional): si existe, se usa Resend como proveedor principal.  
`CONTACT_FROM_EMAIL` (opcional): remitente verificado en Resend (ejemplo pruebas: `Portfolio Contact <onboarding@resend.dev>`).  
`CONTACT_TO_EMAILS` (opcional): destinatarios extra para Resend, separados por comas.

### Setup rapido recomendado
1. Configura solo `CONTACT_RECIPIENT_EMAIL` para activar fallback gratuito con FormSubmit.
2. Envia un mensaje de prueba desde el formulario.
3. FormSubmit enviara un correo de activacion al inbox destino (solo la primera vez).
4. Haz click en el enlace de activacion para habilitar los envios.
5. (Opcional) Agrega `RESEND_API_KEY` para priorizar Resend y mantener FormSubmit como respaldo automatico.

## 4) Dominio gratis
Vercel asigna automaticamente:
`https://<nombre-proyecto>.vercel.app`

## 5) Seguridad aplicada en el repo
- Headers y politicas en [`vercel.json`](/C:/Users/ijpg1/projects/WARP/vercel.json)
- CSP/referrer en [`index.html`](/C:/Users/ijpg1/projects/WARP/index.html)
- Sanitizacion/UX segura en [`src/main.js`](/C:/Users/ijpg1/projects/WARP/src/main.js)
- API serverless segura para contacto en [`api/contact.js`](/C:/Users/ijpg1/projects/WARP/api/contact.js)
- Secretos y carpetas internas fuera de git/deploy con [`.gitignore`](/C:/Users/ijpg1/projects/WARP/.gitignore) y [`.vercelignore`](/C:/Users/ijpg1/projects/WARP/.vercelignore)

## 6) Verificacion post-deploy
1. Abrir la web en HTTPS.
2. Probar el formulario (debe responder con exito y enviar correo).
3. Revisar consola del navegador: sin errores JS/CSP.
4. Revisar cabeceras en `securityheaders.com`.
