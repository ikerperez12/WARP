param(
  [string]$Domain = 'portfolio-iker-perez.vercel.app',
  [string]$AllowedIps = '0.0.0.0',
  [string]$AllowedPrefixes = '192.168.1.',
  [string]$ContactEmail = 'iker.perez@udc.es',
  [string]$ContactToEmails = 'iker.perez@udc.es',
  [string]$KvRestApiUrl = 'https://upstash-redacted.example',
  [string]$KvRestApiToken = 'REDACTED_KV_REST_API_TOKEN',
  [string]$KvRestApiReadOnlyToken = 'REDACTED_KV_REST_API_READ_ONLY_TOKEN',
  [string]$KvUrl = 'rediss://default:REDACTED_KV_REST_API_TOKEN@upstash-redacted.example:6379',
  [string]$RedisUrl = 'rediss://default:REDACTED_KV_REST_API_TOKEN@upstash-redacted.example:6379'
)

function New-RandBytes([int]$count) {
  $bytes = New-Object byte[] $count
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  return $bytes
}

function New-Base64Url([int]$count) {
  $bytes = New-RandBytes $count
  [Convert]::ToBase64String($bytes).TrimEnd('=') -replace '\+','-' -replace '/','_'
}

function New-Hex([int]$count) {
  $bytes = New-RandBytes $count
  ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
}

$adminUser = 'admin_' + (New-Base64Url 6)
$adminPassword = New-Base64Url 18
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($adminPassword))
$adminPasswordHash = -join ($hash | ForEach-Object { $_.ToString('x2') })
$adminSessionSecret = New-Hex 32

$origin = if ($Domain) { "https://$Domain" } else { '' }

$lines = @(
  "# ADMIN_PASSWORD (save this securely): $adminPassword",
  "ADMIN_USERNAME=$adminUser",
  "ADMIN_PASSWORD_HASH=$adminPasswordHash",
  "ADMIN_SESSION_SECRET=$adminSessionSecret",
  "ADMIN_ALLOWED_IPS=$AllowedIps",
  "ADMIN_ALLOWED_IP_PREFIXES=$AllowedPrefixes",
  "ADMIN_ALLOWED_ORIGINS=$origin",
  "ADMIN_RP_ID=$Domain",
  "KV_REST_API_URL=$KvRestApiUrl",
  "KV_REST_API_TOKEN=$KvRestApiToken",
  "KV_REST_API_READ_ONLY_TOKEN=$KvRestApiReadOnlyToken",
  "KV_URL=$KvUrl",
  "REDIS_URL=$RedisUrl",
  "CONTACT_RECIPIENT_EMAIL=$ContactEmail",
  "CONTACT_TO_EMAILS=$ContactToEmails",
  "CONTACT_FROM_EMAIL=",
  "RESEND_API_KEY="
)

$lines | ForEach-Object { Write-Output $_ }
$lines | Set-Content .env.generated.txt

Write-Output ''
Write-Output 'Saved to .env.generated.txt'
