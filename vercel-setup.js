#!/usr/bin/env node

/**
 * Script para configurar o ambiente Vercel durante o deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Verifica se o comando Vercel está instalado
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI já instalado');
} catch (error) {
  console.log('⚠️ Vercel CLI não encontrado, instalando...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Lê as variáveis de ambiente do arquivo vercel.env
console.log('📦 Configurando variáveis de ambiente...');
try {
  const envContent = fs.readFileSync('vercel.env', 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        console.log(`➕ Configurando ${key.trim()}`);
        try {
          execSync(`vercel env add ${key.trim()} production`, { stdio: 'inherit' });
        } catch (error) {
          console.error(`❌ Erro ao configurar ${key.trim()}: ${error.message}`);
        }
      }
    }
  }
  
  console.log('✅ Variáveis de ambiente configuradas com sucesso');
} catch (error) {
  console.error(`❌ Erro ao ler arquivo de variáveis: ${error.message}`);
}

// Verificar e configurar secrets
console.log('🔒 Verificando secrets do Vercel...');
try {
  execSync('vercel secrets ls', { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Erro ao listar secrets: ${error.message}`);
}

console.log('🚀 Configuração concluída! Execute "vercel" para fazer o deploy.'); 