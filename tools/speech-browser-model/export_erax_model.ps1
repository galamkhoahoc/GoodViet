param(
  [string]$ModelId = 'erax-ai/EraX-WoW-Turbo-V1.1',
  [string]$OutputParent = '',
  [string]$PythonLauncher = 'py'
)

$ErrorActionPreference = 'Stop'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
$ToolRoot = $PSScriptRoot
$ConverterRoot = Join-Path $ToolRoot '.transformers-js-v3.8.1'
$VirtualEnv = Join-Path $ToolRoot '.venv'

if ([string]::IsNullOrWhiteSpace($OutputParent)) {
  $OutputParent = Join-Path $ToolRoot 'dist'
}
$OutputParent = [System.IO.Path]::GetFullPath($OutputParent)

if (-not (Test-Path -LiteralPath $ConverterRoot)) {
  Write-Host '[1/5] Downloading the pinned Transformers.js 3.8.1 converter...'
  git clone --depth 1 --branch 3.8.1 https://github.com/huggingface/transformers.js.git $ConverterRoot
  if ($LASTEXITCODE -ne 0) { throw 'Cannot download the Transformers.js 3.8.1 converter.' }
}

if (-not (Test-Path -LiteralPath $VirtualEnv)) {
  Write-Host '[2/5] Creating an isolated Python environment...'
  if ([System.IO.Path]::GetFileNameWithoutExtension($PythonLauncher) -eq 'py') {
    & $PythonLauncher -3.11 -m venv $VirtualEnv
  } else {
    & $PythonLauncher -m venv $VirtualEnv
  }
  if ($LASTEXITCODE -ne 0) { throw 'Cannot create the Python environment.' }
}

$Python = Join-Path $VirtualEnv 'Scripts\python.exe'
if (-not (Test-Path -LiteralPath $Python)) {
  throw "Python environment was not created at $Python"
}

Write-Host '[3/5] Installing the pinned conversion dependencies...'
& $Python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw 'Cannot upgrade pip.' }
& $Python -m pip install -r (Join-Path $ConverterRoot 'scripts\requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Cannot install converter dependencies.' }
& $Python -m pip install 'torch==2.6.0'
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the converter-compatible PyTorch version.' }
& $Python -m pip install onnxscript
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the ONNX Script exporter dependency.' }

New-Item -ItemType Directory -Force -Path $OutputParent | Out-Null
Write-Host "[4/5] Exporting and quantizing $ModelId. This downloads about 1.62 GB and can take a long time..."
Push-Location $ConverterRoot
try {
  & $Python -m scripts.convert --model_id $ModelId --quantize --modes q8 --output_parent_dir $OutputParent
  if ($LASTEXITCODE -ne 0) { throw 'EraX ONNX conversion failed.' }
} finally {
  Pop-Location
}

$ModelName = ($ModelId -split '/')[-1]
$OnnxRoot = Get-ChildItem -LiteralPath $OutputParent -Directory -Recurse |
  Where-Object { $_.Name -eq 'onnx' -and $_.Parent.Name -eq $ModelName } |
  Select-Object -First 1 -ExpandProperty FullName
if (-not $OnnxRoot) {
  throw "[5/5] Cannot find an onnx directory for $ModelName under $OutputParent"
}
$ExpectedRoot = Split-Path -Parent $OnnxRoot
$RequiredPatterns = @(
  'encoder_model_quantized.onnx',
  'decoder_model_merged_quantized.onnx'
)
$Missing = @()
foreach ($Name in $RequiredPatterns) {
  if (-not (Test-Path -LiteralPath (Join-Path $OnnxRoot $Name))) {
    $Missing += $Name
  }
}

if ($Missing.Count -gt 0) {
  throw "[5/5] Export finished but browser artifacts are incomplete: $($Missing -join ', ')"
}

Write-Host '[5/5] Browser artifacts validated.'
Write-Host "Output: $ExpectedRoot"
Write-Host 'No model or token was uploaded. Review the files, then upload this output directory to a Hugging Face model repository you control.'
