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
- `KV_REST_API_URL`: lo da Vercel KV.
- `KV_REST_API_TOKEN`: lo da Vercel KV.

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

## Limites actuales
- El contenido editable aplicado en vivo cubre metadatos, hero, contacto y proyectos.
- Si quieres, en el siguiente paso amplio el mapeo para editar tambien servicios, about, timeline y footer desde el mismo panel.
