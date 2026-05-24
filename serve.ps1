param(
    [int]$Port = 8765,
    [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Web

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch { Write-Error "Cannot start listener on $prefix : $_"; exit 1 }

Write-Host "Listening on $prefix (root: $Root)"

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.txt'  = 'text/plain; charset=utf-8'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.map'  = 'application/json; charset=utf-8'
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        try {
            $rawPath = [System.Web.HttpUtility]::UrlDecode($req.Url.AbsolutePath)
            if ($rawPath -eq '/' -or $rawPath -eq '') { $rawPath = '/index.html' }
            $rel = $rawPath.TrimStart('/')
            $full = Join-Path $Root $rel
            $full = [System.IO.Path]::GetFullPath($full)
            if (-not $full.StartsWith([System.IO.Path]::GetFullPath($Root))) {
                $res.StatusCode = 403
                $res.Close()
                continue
            }
            if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
                $res.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
                $res.OutputStream.Write($msg, 0, $msg.Length)
                $res.Close()
                continue
            }
            $ext = [System.IO.Path]::GetExtension($full).ToLower()
            $ct = $mime[$ext]
            if (-not $ct) { $ct = 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($full)
            $res.ContentType = $ct
            $res.ContentLength64 = $bytes.Length
            $res.Headers.Add('Cache-Control','no-store, must-revalidate')
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            Write-Host "$([DateTime]::Now.ToString('HH:mm:ss')) $($req.HttpMethod) $rawPath -> 200 ($($bytes.Length) bytes)"
        } catch {
            Write-Host "ERROR: $_"
            try { $res.StatusCode = 500; $res.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
