#!/bin/bash
set -e

echo "🔍 NODE VERSION: $(node -v)"
echo "🔍 NPM VERSION: $(npm -v)"

echo "📦 Instalando dependências..."
npm ci

echo "🏗️ Construindo o projeto..."
npm run build

echo "✅ Build concluído com sucesso!"

# Verificar se os arquivos foram gerados corretamente
if [ -f "dist/index.js" ] && [ -f "dist/index.html" ]; then
  echo "✓ Arquivos de build verificados com sucesso!"
else
  echo "⚠️ Erro: Arquivos de build não encontrados!"
  ls -la dist/
  exit 1
fi
