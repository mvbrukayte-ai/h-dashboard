$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$port = 5173
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.json' = 'application/json; charset=utf-8'
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($path -eq '/') { $path = '/index.html' }

    $relative = $path.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar
    $file = Join-Path $root $relative

    if (Test-Path -LiteralPath $file -PathType Container) {
      $file = Join-Path $file 'index.html'
    }

    if (Test-Path -LiteralPath $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
      $response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $response.ContentLength64 = $bytes.Length
      $response.Headers.Add('Cache-Control', 'no-store')
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.ContentLength64 = $body.Length
      $response.OutputStream.Write($body, 0, $body.Length)
    }
    $response.Close()
  } catch {
    Write-Host $_.Exception.Message
  }
}
