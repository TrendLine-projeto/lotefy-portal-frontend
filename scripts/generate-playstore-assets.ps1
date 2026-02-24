Add-Type -AssemblyName System.Drawing

param(
  [string]$IconPath = "src/assets/ICONEGRANDE.png",
  [string]$PreviewPath = "src/assets/home.png",
  [string]$OutputDir = "android/playstore"
)

if (!(Test-Path $IconPath)) {
  throw "Icon not found: $IconPath"
}

if (!(Test-Path $PreviewPath)) {
  throw "Preview image not found: $PreviewPath"
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$iconImage = [System.Drawing.Image]::FromFile((Resolve-Path $IconPath))
$previewImage = [System.Drawing.Image]::FromFile((Resolve-Path $PreviewPath))

function New-Canvas {
  param([int]$Width, [int]$Height)
  return New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
}

function Use-HighQuality {
  param([System.Drawing.Graphics]$Graphics)
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Save-Jpeg {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path,
    [int]$Quality = 92
  )

  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [int64]$Quality)
  $Bitmap.Save($Path, $codec, $encoderParams)
  $encoderParams.Dispose()
}

function Draw-CoverImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height
  )

  $scale = [Math]::Max($Width / $Image.Width, $Height / $Image.Height)
  $drawW = [int][Math]::Round($Image.Width * $scale)
  $drawH = [int][Math]::Round($Image.Height * $scale)
  $drawX = $X - [int](($drawW - $Width) / 2)
  $drawY = $Y - [int](($drawH - $Height) / 2)
  $Graphics.DrawImage($Image, $drawX, $drawY, $drawW, $drawH)
}

function Draw-ContainImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height
  )

  $scale = [Math]::Min($Width / $Image.Width, $Height / $Image.Height)
  $drawW = [int][Math]::Round($Image.Width * $scale)
  $drawH = [int][Math]::Round($Image.Height * $scale)
  $drawX = $X + [int](($Width - $drawW) / 2)
  $drawY = $Y + [int](($Height - $drawH) / 2)
  $Graphics.DrawImage($Image, $drawX, $drawY, $drawW, $drawH)
}

# 1) Play Store icon (required): 512x512 PNG
$storeIcon = New-Canvas -Width 512 -Height 512
$storeIconGraphics = [System.Drawing.Graphics]::FromImage($storeIcon)
Use-HighQuality -Graphics $storeIconGraphics
$storeIconGraphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 255))
Draw-ContainImage -Graphics $storeIconGraphics -Image $iconImage -X 0 -Y 0 -Width 512 -Height 512
Save-Png -Bitmap $storeIcon -Path (Join-Path $OutputDir "icon-512.png")
$storeIconGraphics.Dispose()
$storeIcon.Dispose()

# 2) Feature graphic (required): 1024x500, JPG or 24-bit PNG (no alpha)
$feature = New-Canvas -Width 1024 -Height 500
$g = [System.Drawing.Graphics]::FromImage($feature)
Use-HighQuality -Graphics $g

$bgRect = New-Object System.Drawing.Rectangle(0, 0, 1024, 500)
$gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bgRect,
  [System.Drawing.Color]::FromArgb(22, 34, 67),
  [System.Drawing.Color]::FromArgb(27, 79, 194),
  25
)
$g.FillRectangle($gradient, $bgRect)

$softCircle1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 255, 255, 255))
$softCircle2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(32, 125, 211, 252))
$g.FillEllipse($softCircle1, -60, 250, 360, 360)
$g.FillEllipse($softCircle2, 720, -120, 420, 420)

$previewRect = New-Object System.Drawing.Rectangle(530, 55, 440, 390)
$previewFrameBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
$previewBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(72, 255, 255, 255), 2)
$g.FillRectangle($previewFrameBrush, $previewRect)
Draw-CoverImage -Graphics $g -Image $previewImage -X 542 -Y 67 -Width 416 -Height 366
$g.DrawRectangle($previewBorderPen, $previewRect)

$titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 52, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subtitleFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 248, 255))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 224, 255))

$g.DrawString("Lotefy", $titleFont, $white, 70, 145)
$g.DrawString("Gestao de lotes com visao clara da operacao", $subtitleFont, $muted, 72, 225)

Save-Jpeg -Bitmap $feature -Path (Join-Path $OutputDir "feature-graphic-1024x500.jpg")

$muted.Dispose()
$white.Dispose()
$titleFont.Dispose()
$subtitleFont.Dispose()
$previewBorderPen.Dispose()
$previewFrameBrush.Dispose()
$softCircle1.Dispose()
$softCircle2.Dispose()
$gradient.Dispose()
$g.Dispose()
$feature.Dispose()

$iconImage.Dispose()
$previewImage.Dispose()

Write-Output "Generated:"
Write-Output " - $OutputDir/icon-512.png"
Write-Output " - $OutputDir/feature-graphic-1024x500.jpg"
