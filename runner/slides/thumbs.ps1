# Makes 480 px JPEG thumbnails with built-in Windows imaging. Input: JSON list of {src, dst}.
param([Parameter(Mandatory = $true)][string]$List)
Add-Type -AssemblyName System.Drawing
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L
$made = 0
foreach ($job in (Get-Content -Raw -LiteralPath $List | ConvertFrom-Json)) {
  if (Test-Path -LiteralPath $job.dst) { continue }
  try {
    $img = [System.Drawing.Image]::FromFile($job.src)
    $w = 480; $h = [int]([double]$img.Height * $w / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h)
    $tmp = "$($job.dst).tmp"
    $bmp.Save($tmp, $jpeg, $params)
    Move-Item -LiteralPath $tmp -Destination $job.dst -Force
    $made++
  } catch {
    Write-Output "thumb failed: $($job.src)"
  } finally {
    if ($g) { $g.Dispose() }; if ($bmp) { $bmp.Dispose() }; if ($img) { $img.Dispose() }
  }
}
Write-Output "thumbs made: $made"
