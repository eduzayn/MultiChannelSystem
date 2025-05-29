#!/bin/bash
set -e

echo "Instalando dependências..."
npm install

echo "Construindo o cliente..."
npm run build

mkdir -p dist

echo "Copiando arquivos estáticos..."
cp -r dist/* dist/

echo "Build concluído com sucesso!"
