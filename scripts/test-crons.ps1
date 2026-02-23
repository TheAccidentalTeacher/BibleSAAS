$secret = "change-me-before-production"
$base = "http://localhost:3001"
# (method, route) — Vercel cron routes can be GET or POST
$crons = @(
  @("POST","daily-trail"),
  @("POST","memory-verse-reminders"),
  @("POST","daily-reading"),
  @("GET", "verse-pulse"),
  @("POST","portrait-regen"),
  @("GET", "delete-accounts"),
  @("POST","birthday-letters"),
  @("GET", "year-in-review")
)

foreach ($pair in $crons) {
  $method = $pair[0]; $cron = $pair[1]
  try {
    $r = Invoke-WebRequest -Uri "$base/api/cron/$cron" -Method $method `
      -Headers @{ Authorization = "Bearer $secret"; "Content-Type" = "application/json" } `
      -TimeoutSec 45 -UseBasicParsing -ErrorAction Stop
    $body = $r.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    $msg = if ($body.message) { $body.message } elseif ($body.error) { "ERR: $($body.error)" } else { $r.Content.Substring(0, [Math]::Min(80,$r.Content.Length)) }
    Write-Host ("  OK  {0,-36} HTTP {1}  {2}" -f $cron, $r.StatusCode, $msg)
  } catch {
    $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "timeout/network" }
    $err = $_.Exception.Message.Substring(0,[Math]::Min(100,$_.Exception.Message.Length))
    Write-Host ("  ERR {0,-36} {1}  {2}" -f $cron, $code, $err)
  }
}
