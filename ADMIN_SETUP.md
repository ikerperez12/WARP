# Admin seguro del portfolio

Ruta del panel:
- `/admin.html`

## Seguridad aplicada
- Login validado en servidor.
- Cookie de sesion `HttpOnly`, `Secure`, `SameSite=Strict`.
- Comprobacion de origen en operaciones de escritura.
- Persistencia en Vercel KV para que los cambios sobrevivan al redeploy.
- La web publica solo consume endpoints de lectura.

## Variables necesarias en Vercel
- `ADMIN_USERNAME`: usuario del panel.
- `ADMIN_PASSWORD_HASH`: hash SHA-256 hexadecimal de tu contraseña.
- `ADMIN_SESSION_SECRET`: secreto largo aleatorio para firmar la sesion.
- `ADMIN_ALLOWED_IPS`: lista CSV de IPs publicas autorizadas.
- `ADMIN_ALLOWED_IP_PREFIXES`: lista CSV de prefijos permitidos, por ejemplo `79.146.,192.168.`.
- `ADMIN_ALLOWED_ORIGINS`: lista CSV opcional de origenes extra validos para passkeys, por ejemplo `https://portfolio-iker-perez.vercel.app`.
- `ADMIN_RP_ID`: RP ID fijo para WebAuthn/passkeys. En produccion, usa tu dominio publico sin protocolo.
- `KV_REST_API_URL`: lo da Vercel KV.
- `KV_REST_API_TOKEN`: lo da Vercel KV.
- `CONTACT_RECIPIENT_EMAIL`: correo destino para el formulario.
- `CONTACT_TO_EMAILS`: destinatarios adicionales opcionales separados por coma.
- `CONTACT_FROM_EMAIL`: remitente para Resend.
- `RESEND_API_KEY`: API key de Resend si quieres proveedor principal.

Tambien tienes una plantilla local lista en [`.env.example`](/C:/Users/ijpg1/projects/WARP/.env.example).

## Alternativa menos recomendable
- `ADMIN_PASSWORD`: contraseña en texto plano.

Se soporta por compatibilidad local, pero en produccion es mejor usar `ADMIN_PASSWORD_HASH`.

## Generar hash de contraseña
En PowerShell:

```powershell
$plain = 'tu-contraseña-larga'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
-join ($hash | ForEach-Object { $_.ToString('x2') })
```

## Generar secreto de sesion
En PowerShell:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Flujo
1. Entras en `/admin.html`.
2. Editas contenido global o proyectos.
3. Guardas.
4. La preview se recarga usando los datos persistidos en KV.
5. La web publica ya sirve esos cambios sin rebuild.
6. El boton visual de editor en la web publica solo deja entrar si vienes desde red permitida o desde un navegador ya confiado tras login anterior.
7. Si registras una passkey desde el panel, ese navegador/equipo puede volver a autenticarse con WebAuthn.

## Limites actuales
- El contenido editable aplicado en vivo cubre metadatos, hero, contacto y proyectos.
- Si quieres, en el siguiente paso amplio el mapeo para editar tambien servicios, about, timeline y footer desde el mismo panel.
