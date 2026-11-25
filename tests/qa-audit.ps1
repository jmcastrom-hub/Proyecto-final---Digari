param([switch]$Resume)
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel)
Set-Location -LiteralPath $root
$sha = (git rev-parse HEAD)
$deps = Join-Path $env:TEMP 'digari-ux-suite-deps'
if (!(Test-Path "$deps\node_modules\playwright-core\index.mjs")) {
  npm.cmd install --prefix $deps playwright-core@1.55.0 --no-audit --no-fund
  if ($LASTEXITCODE) { throw 'Playwright no se instaló' }
}
$stage = Join-Path $env:TEMP ("digari-audit-build-" + [guid]::NewGuid())
New-Item -Type Directory $stage | Out-Null
git archive --format=zip -o "$stage\source.zip" $sha
if ($LASTEXITCODE) { throw 'git archive' }
tar -xf "$stage\source.zip" -C $stage
if ($LASTEXITCODE) { throw 'extracción' }
New-Item -ItemType Junction -Path "$stage\node_modules" -Target "$root\node_modules" | Out-Null
$env:DIGARI_DB_PATH = "$stage\build.sqlite"
$env:GEMINI_API_KEY = ''
$env:NEXT_TELEMETRY_DISABLED = '1'
Push-Location $stage
try { node node_modules/next/dist/bin/next build; if ($LASTEXITCODE) { throw 'build' } } finally { Pop-Location }
$env:QA_STAGE=$stage
$env:QA_SHA=$sha
$env:QA_DEPS=$deps
if ($Resume) { node tests/qa-audit.mjs --resume } else { node tests/qa-audit.mjs }
if ($LASTEXITCODE) { exit $LASTEXITCODE }
node tests/qa-results.mjs
exit $LASTEXITCODE
