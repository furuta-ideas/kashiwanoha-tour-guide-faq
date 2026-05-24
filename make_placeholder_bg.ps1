# Generates placeholder background JPEGs for assets/bg-mobile.jpg & assets/bg-pc.jpg.
# Replace these later with the official tour artwork.
param(
    [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$assets = Join-Path $Root 'assets'
if (-not (Test-Path $assets)) { New-Item -ItemType Directory -Force $assets | Out-Null }

function New-PlaceholderBg {
    param(
        [string]$OutPath,
        [int]$Width,
        [int]$Height,
        [string]$Label
    )
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Sky gradient: blue -> light blue -> soft green
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $top = [System.Drawing.Color]::FromArgb(120, 196, 235)   # sky
    $bot = [System.Drawing.Color]::FromArgb(160, 220, 180)   # grass-ish
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $top, $bot, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Soft sun
    $sunR = [Math]::Floor([Math]::Min($Width, $Height) * 0.18)
    $sunBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 255, 240, 180))
    $g.FillEllipse($sunBrush, ($Width / 2 - $sunR / 2), ($Height * 0.12), $sunR, $sunR)
    $sunBrush.Dispose()

    # City silhouette band
    $bandH = [int]($Height * 0.18)
    $bandY = [int]($Height * 0.55)
    $bandBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 110, 170, 130))
    $g.FillRectangle($bandBrush, 0, $bandY, $Width, $bandH)
    $bandBrush.Dispose()

    # Confetti dots
    $rand = New-Object System.Random(20260523)
    $palette = @(
        [System.Drawing.Color]::FromArgb(220, 26, 115, 232),
        [System.Drawing.Color]::FromArgb(220, 234, 67, 53),
        [System.Drawing.Color]::FromArgb(220, 251, 188, 4),
        [System.Drawing.Color]::FromArgb(220, 52, 168, 83)
    )
    for ($i = 0; $i -lt 80; $i++) {
        $cx = $rand.Next(0, $Width)
        $cy = $rand.Next(0, [int]($Height * 0.55))
        $r  = $rand.Next(4, 12)
        $cb = New-Object System.Drawing.SolidBrush($palette[$rand.Next(0, 4)])
        $g.FillEllipse($cb, $cx, $cy, $r, $r)
        $cb.Dispose()
    }

    # Label
    $font = New-Object System.Drawing.Font('Yu Gothic UI', [int]([Math]::Max(14, $Width * 0.022)), [System.Drawing.FontStyle]::Bold)
    $tBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 255, 255, 255))
    $g.DrawString($Label, $font, $tBrush, 24, 24)
    $tBrush.Dispose(); $font.Dispose()

    $g.Dispose()
    # Save as JPEG, quality 80
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]80)
    $bmp.Save($OutPath, $codec, $params)
    $bmp.Dispose()
    Write-Host "Wrote $OutPath ($(([System.IO.FileInfo]$OutPath).Length) bytes)"
}

New-PlaceholderBg -OutPath (Join-Path $assets 'bg-pc.jpg')     -Width 1600 -Height 900  -Label 'PC PLACEHOLDER - replace with official artwork'
New-PlaceholderBg -OutPath (Join-Path $assets 'bg-mobile.jpg') -Width 800  -Height 1400 -Label 'MOBILE PLACEHOLDER - replace with official artwork'
