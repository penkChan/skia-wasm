# build.ps1 - 编译 C++ 到 WebAssembly (PowerShell)


# 编译命令
emcc ./wasm/src/wasm-main.cpp -o ./public/wasm-main.js `
  -s EXPORTED_FUNCTIONS="['_fib', '_grayscale', '_allocate', '_free_memory']" `
  -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap', 'writeArrayToMemory', 'getValue', 'HEAPU8']" `
  -s MODULARIZE=1 `
  -s EXPORT_NAME="createWasmModule"  `
  -O2

if ( $LASTEXITCODE -eq 0) {
  Write-Host "compile success" -ForegroundColor Green
}
else {
  Write-Host "compile failed" -ForegroundColor Red
  exit 1
}