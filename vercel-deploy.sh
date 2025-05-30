#!/bin/bash
set -e

echo "🔍 Ambiente de execução:"
node -v
npm -v

echo "📦 Instalando dependências..."
npm ci

echo "🔧 Configurando o projeto Vercel..."
npx vercel link --confirm

echo "🔒 Configurando variáveis de ambiente..."
if [ -f "vercel.env" ]; then
  # Configurar variáveis de ambiente a partir do arquivo
  while IFS= read -r line || [ -n "$line" ]; do
    # Ignorar linhas em branco e comentários
    if [[ $line =~ ^[A-Za-z] ]]; then
      key=$(echo "$line" | cut -d= -f1)
      value=$(echo "$line" | cut -d= -f2-)
      echo "Configurando $key"
      npx vercel env add $key production <<< "$value"
    fi
  done < "vercel.env"
  echo "✅ Variáveis de ambiente configuradas"
else
  echo "⚠️ Arquivo vercel.env não encontrado!"
fi

echo "🏗️ Construindo o projeto..."
npm run build

echo "🚀 Fazendo deploy para Vercel..."
npx vercel --prod --confirm

echo "✅ Deploy concluído!" 